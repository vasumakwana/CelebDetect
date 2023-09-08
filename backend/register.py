import json
import boto3
import os

def lambda_handler(event, context):
    # Extract the email and password from the request body
    body = event['body']
    email = body['email']
    password = body['password']
    given_name = body['given_name']
    sns_client = boto3.client('sns')

    app_client_id = os.environ['APP_CLIENT_ID']
    topic_arn = os.environ['SNS_TOPIC_ARN']

    # Set up the AWS Cognito client
    client = boto3.client('cognito-idp')

    try:
        # Register the user
        response = client.sign_up(
            ClientId=app_client_id,
            Username=email,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                },
                {
                    'Name': 'given_name',
                    'Value': given_name
                }
            ]
        )

        # Check if the user needs to be confirmed
        if response['UserConfirmed']:
            return {
                'statusCode': 200,
                'message': 'Registration successful'
            }
        else:
            sns_client.subscribe(
                TopicArn=topic_arn,
                Protocol='email',
                Endpoint=email
            )
            return {
                'statusCode': 200,
                'message': 'User needs to be confirmed'
            }
    except client.exceptions.UsernameExistsException:
        return {
            'statusCode': 400,
            'error': 'User already exists'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e)
        }
