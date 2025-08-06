const AWS = require('aws-sdk');
const sns = new AWS.SNS();

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
            
            await sns.publish(params).promise();
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