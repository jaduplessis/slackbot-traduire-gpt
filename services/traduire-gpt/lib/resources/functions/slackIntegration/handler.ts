import { APIGatewayProxyHandler } from "aws-lambda";
import { translate } from "traduire-gpt";

import { EventBridgeAdapter } from "@slackbot/cdk-constructs";
import { getEnvVariable } from "@slackbot/helpers";
import { TranslateEntity } from "../../dataModel/Translate";
import { BaseEvent, instantiateApp } from "../../utils";

interface MessageEvent {
  text: string;
  channel: string;
  user: string;
  ts: string;
  thread_ts?: string;
}

const eventBridge = new EventBridgeAdapter();

export const handler: APIGatewayProxyHandler = async (
  event,
  context,
  callback
) => {
  const { app, awsLambdaReceiver } = instantiateApp();

  app.event(
    "app_home_opened",
    async ({ event: home_event, context: home_context }) => {
      const token = home_context.botToken ?? "";
      const user_id = home_event.user;
      const eventData: BaseEvent = { token, user_id };

      await eventBridge.putEvent(
        "application.slackIntegration",
        {
          ...eventData,
        },
        "app.home.opened"
      );
    }
  );

  app.action("submit_api_key", async ({ ack, body, context }) => {
    await ack();

    eventBridge.putEvent(
      "application.slackIntegration",
      {
        token: context.botToken,
        user_id: body.user.id,
        body,
      },
      "submit.api.key"
    );
  });

  app.action("remove_api_key", async ({ ack, body, context }) => {
    await ack();

    eventBridge.putEvent(
      "application.slackIntegration",
      {
        token: context.botToken,
        user_id: body.user.id,
      },
      "remove.api.key"
    );
  });

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
      token: getEnvVariable("SLACK_BOT_TOKEN"),
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
