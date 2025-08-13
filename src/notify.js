const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: 'eu-west-1' });

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    try {
        const topicArn = process.env.SNS_TOPIC_ARN;
        console.log('SNS Topic ARN:', topicArn);
        
        await Promise.all(event.Records.map(async (record) => {
            const bucket = record.s3.bucket.name;
            const key = record.s3.object.key;
            console.log(`Processing upload: s3://${bucket}/${key}`);
            
            const params = {
                Subject: `New Upload in ${bucket}`,
                Message: `File uploaded: s3://${bucket}/${key}\n\n` + 
                         `Event Time: ${record.eventTime}\n` +
                         `Event Type: ${record.eventName}`,
                TopicArn: topicArn
            };
            
            console.log('Publishing to SNS:', params);
            await snsClient.send(new PublishCommand(params));
            console.log(`Successfully published to SNS for s3://${bucket}/${key}`);
        }));
        
        const response = { statusCode: 200, body: 'Notifications sent' };
        console.log('Response:', response);
        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Processing failed', error: error.message })
        };
    }
};