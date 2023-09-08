import json
import os

import boto3
import base64
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Parse the request body
    request_body = event['body']

    # Extract image file details from the request body
    image_data = request_body.get('image_data')
    image_name = request_body.get('image_name')
    bucket_name = os.environ['S3_BUCKET_NAME']
    function_name = os.environ['REKOGNITION_FUNCTION_NAME']

    s3 = boto3.client('s3')

    # Validate that image_data and image_name are present
    if not (image_data and image_name):
        return {
            'statusCode': 400,  # Bad Request status code
            'body': 'Missing required fields: image_data, image_name'
        }

    # Convert base64-encoded image data back to bytes
    try:
        image_bytes = base64.b64decode(image_data)
    except ValueError:
        return {
            'status': 400,
            'body': 'Invalid base64-encoded image data'
        }

    # Upload the image file to S3

    try:
        s3.put_object(Bucket=bucket_name, Key=image_name, Body=image_bytes)
        lambda_client = boto3.client('lambda')
        payload = {
            'body': {
                'bucket_name': bucket_name,
                'image_name': image_name
            }
        }

        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(payload).encode('utf-8')
        )
        response_payload = json.loads(response['Payload'].read().decode())
        name_from_response = response_payload.get('Name')
        urls_from_response = response_payload.get('Urls')

        # Do further processing or return the response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'NameFromResponse': name_from_response,
                'UrlsFromResponse': urls_from_response
            })
        }
    except ClientError as e:
        return {
            'status': 500,  # Internal Server Error status code,
            'body': 'Failed to upload image to S3: {}'.format(e)
        }