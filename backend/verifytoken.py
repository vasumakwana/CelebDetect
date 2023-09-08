import json
import boto3

def lambda_handler(event, context):
    # Extract the access token from the request headers
    body = event['body']
    access_token = body['token']

    # Set up the AWS Cognito client
    client = boto3.client('cognito-idp')

    try:
        # Verify the access token
        response = client.get_user(
            AccessToken=access_token
        )

        # Extract user attributes from the response
        user_attributes = response['UserAttributes']

        return {
            'statusCode': 200,
            'message': 'Token verified successfully',
            'user_attributes': user_attributes
        }
    except client.exceptions.NotAuthorizedException:
        return {
            'statusCode': 401,
            'error': 'Invalid access token'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e)
        }
