// @ts-ignore
import { send }  from '/opt/nodejs/slack';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';

async function handler(event: SQSEvent): Promise<APIGatewayProxyResultV2> {
  try {
    const messages = event.Records.map((record: any) => {
      const body = JSON.parse(record.body) as {Subject: string; Message: string};
  
      return {subject: body.Subject, message: body.Message};
    });
  
    await send('#phoenix-fatal', JSON.stringify(messages, null, 2));
  
    return {
      body: JSON.stringify({messages}),
      statusCode: 2000,
    };
  } catch (e) {
    console.log('There has been an error while trying to send message at dead letter queue to slack', e);
    throw e;
  }
}

export { handler };
