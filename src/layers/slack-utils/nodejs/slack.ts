import { WebClient } from '@slack/web-api';

const token = process.env.SlackToken;
let slackClient: WebClient | null = null;

if (token) {
  slackClient = new WebClient(token);
}

export const send = async (channel: string, text: string) => {
  if (slackClient) {
    await slackClient.chat.postMessage({ channel, text });
  } else {
    console.info(`
      channel: ${channel}
      text: ${text}
    `);
  }
}