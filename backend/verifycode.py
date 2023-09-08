import json
import os

import boto3

def lambda_handler(event, context):
    # Extract the email, verification code, and password from the request body
    body = event['body']
    email = body['email']
    verification_code = body['verification_code']
    name = body['name']
    city = body['city']
    gender = body['gender']
    country = body['country']

    user_pool_id = os.environ['USER_POOL_ID']
    app_client_id = os.environ['APP_CLIENT_ID']

    # Set up the AWS Cognito client
    client = boto3.client('cognito-idp')
    sns_client = boto3.client('sns')
    message = '''Welcome To CelebDetect!!!
    
    You have Entered the world of celebrities where you can detect any celebrity just by uploading a photo'''

    try:
        # Confirm the user's sign-up with the verification code
        response = client.confirm_sign_up(
            ClientId=app_client_id,
            Username=email,
            ConfirmationCode=verification_code
        )

        # Check if the user was successfully confirmed
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            # Store user details in DynamoDB
            dynamodb = boto3.client('dynamodb')
            table_name = os.environ['TABLE_NAME']

            item = {
                'email': {'S': email},
                'name': {'S': name},
                'city': {'S': city},
                'gender': {'S': gender},
                'country': {'S': country}
            }

            dynamodb.put_item(TableName=table_name, Item=item)

            topic_arn = os.environ['SNS_TOPIC_ARN']
            sns_client.publish(
                TopicArn=topic_arn,
                Message=message,
                Subject='User Registration Successful'
            )

            return {
                'statusCode': 200,
                'message': 'User confirmed and details stored in DynamoDB'
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'User confirmation failed'})
            }
    except client.exceptions.UserNotFoundException:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'User not found'})
        }
    except client.exceptions.CodeMismatchException:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid verification code'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
