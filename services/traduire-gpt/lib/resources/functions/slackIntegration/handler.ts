import { App, AwsLambdaReceiver } from "@slack/bolt";
import { APIGatewayProxyHandler } from "aws-lambda";
import { translate } from "traduire-gpt";

import { getEnvVariable } from "@slackbot/helpers";

import { TranslateEntity } from "../../dataModel/Translate";
import { createHome } from "./appHome";

interface MessageEvent {
  text: string;
  channel: string;
  user: string;
  ts: string;
  thread_ts?: string;
}

export const handler: APIGatewayProxyHandler = async (
  event,
  context,
  callback
) => {
  const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
  const SLACK_BOT_TOKEN = getEnvVariable("SLACK_BOT_TOKEN");

  const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: SLACK_SIGNING_SECRET,
  });

  const app = new App({
    token: SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
  });

  app.event(
    "app_home_opened",
    async ({ event: home_event, context: home_context }) => {
      console.log("app_home_opened", home_event);

      // Display App Home
      const homeView = createHome();

      try {
        await app.client.views.publish({
          token: home_context.botToken,
          user_id: home_event.user,
          view: homeView,
        });
      } catch (e) {
        console.error(e);
      }
    }
  );

  app.message(async ({ message }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (message === undefined) {
      console.log("No message, exiting");

      return;
    }

    const { text, channel, ts, thread_ts } = message as MessageEvent;

    if (thread_ts !== undefined) {
      console.log("Not a parent message, exiting");

      return;
    }

    // Get event details
    const translateEntity = await TranslateEntity.get({
      PK: ts,
      SK: "ROOT",
    });

    if (translateEntity.Item) {
      console.log("Duplicate event received, exiting");

      return;
    } else {
      console.log(`New event received, creating entity. Message: ${text}`);
      await TranslateEntity.update({
        PK: ts,
        messageSent: "PENDING",
      });
    }

    const translation = await translate(text);

    if (translation === undefined) {
      console.log("Text not translatable, exiting");

      return;
    }

    console.log(`Text: ${text}`);
    console.log(`Translation: ${translation}`);

    await app.client.chat.postMessage({
      token: SLACK_BOT_TOKEN,
      channel,
      thread_ts: ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: translation,
          },
        },
      ],
    });

    await TranslateEntity.update({
      PK: ts,
      SK: "ROOT",
      messageSent: "SENT",
      text,
      translation,
    });
  });

  const response = await awsLambdaReceiver.start();

  return response(event, context, callback);
};
