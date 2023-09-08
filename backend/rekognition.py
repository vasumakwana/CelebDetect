import os
import boto3

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    rekognition = boto3.client('rekognition')

    request_body = event['body']
    bucket_name = request_body.get('bucket_name')
    image_name = request_body.get('image_name')

    # Get the latest uploaded image from S3
    response = s3.get_object(Bucket=bucket_name, Key=image_name)
    image = response['Body'].read()

    # Perform image analysis with Rekognition
    data = rekognition.recognize_celebrities(
        Image={
            'Bytes': image
        }
    )

    # Extract and process the detected celebrity information from the response
    celebrities = []
    for celebrity in data['CelebrityFaces']:
        celebrities.append({
            'Name': celebrity['Name'],
            'Confidence': celebrity['MatchConfidence'],
            'Urls': celebrity['Urls']
        })

    sns = boto3.client('sns')
    topic_arn = os.environ['SNS_TOPIC_ARN']

    if celebrities:
        message = f"The image is of \"{celebrities[0]['Name']}\" and you can read more about them from the following URLs: {', '.join(celebrities[0]['Urls'])}"
    else:
        message = "No celebrities were detected in the uploaded image."

    try:
        sns.publish(TopicArn=topic_arn, Message=message)
        print("Email notification sent successfully!")
    except Exception as e:
        print(f"Error sending email notification: {str(e)}")

    payload = {
        'Name': celebrity['Name'],
        'Urls': celebrity['Urls']
    }

    return payload