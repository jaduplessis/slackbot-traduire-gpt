import { APIGatewayProxyHandler } from "aws-lambda";

import { EventBridgeAdapter } from "@slackbot/cdk-constructs";
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

    await eventBridge.putEvent(
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

    await eventBridge.putEvent(
      "application.slackIntegration",
      {
        token: context.botToken,
        user_id: body.user.id,
      },
      "remove.api.key"
    );
  });

  app.action("submit_language_preference", async ({ ack, body, context }) => {
    await ack();

    await eventBridge.putEvent(
      "application.slackIntegration",
      {
        token: context.botToken,
        user_id: body.user.id,
        body,
      },
      "submit.language.preference"
    );
  });

  app.message(async ({ message }) => {
    await eventBridge.putEvent(
      "application.slackIntegration",
      {
        message,
      },
      "translate.message"
    );
  });

  const response = await awsLambdaReceiver.start();

  return response(event, context, callback);
};
