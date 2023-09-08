import json
import boto3


def lambda_handler(event, context):
    # Extract the access token from the request headers
    data = event['body']
    access_token = data['token']

    # Set up the AWS Cognito client
    client = boto3.client('cognito-idp')

    try:
        # Invalidate the access token to log out the user
        response = client.global_sign_out(
            AccessToken=access_token
        )

        # Check if the logout was successful
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return {
                'statusCode': 200,
                'message': 'Logout successful'
            }
        else:
            return {
                'statusCode': 400,
                'error': 'Logout failed'
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
