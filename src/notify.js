const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: 'eu-west-1' });

exports.handler = async (event) => {
    try {
        const topicArn = process.env.SNS_TOPIC_ARN;
        
        await Promise.all(event.Records.map(async (record) => {
            const bucket = record.s3.bucket.name;
            const key = record.s3.object.key;
            
            const params = {
                Subject: `New Upload in ${bucket}`,
                Message: `File uploaded: s3://${bucket}/${key}\n\n` + 
                         `Event Time: ${record.eventTime}\n` +
                         `Event Type: ${record.eventName}`,
                TopicArn: topicArn
            };
            
            await snsClient.send(new PublishCommand(params));
        }));
        
        return { statusCode: 200, body: 'Notifications sent' };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Processing failed', error })
        };
    }
};