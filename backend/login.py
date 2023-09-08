import json
import boto3
import os

def lambda_handler(event, context):
    # Extract the username (email) and password from the request body
    body = event['body']
    username = body['email']
    password = body['password']

    # Set up the AWS Cognito client
    client = boto3.client('cognito-idp')

    user_pool_id = os.environ['USER_POOL_ID']
    app_client_id = os.environ['APP_CLIENT_ID']

    try:
        # Initiate the authentication process
        response = client.admin_initiate_auth(
            UserPoolId=user_pool_id,
            ClientId=app_client_id,
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )

        # Extract the access token from the response
        access_token = response['AuthenticationResult']['AccessToken']

        # Return the access token in the response
        return {
            'statusCode': 200,
            'token': access_token
        }
    except client.exceptions.NotAuthorizedException:
        return {
            'statusCode': 401,
            'error': 'Invalid credentials'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e)
        }
