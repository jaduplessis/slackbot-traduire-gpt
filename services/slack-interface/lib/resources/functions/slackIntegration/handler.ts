import { APIGatewayProxyHandler } from "aws-lambda";

import { EventBridgeAdapter, SlackAppAdapter } from "@slackbot/adapters";
import { getAccessToken } from "../utils";

const eventBridge = new EventBridgeAdapter();

export const handler: APIGatewayProxyHandler = async (
  event,
  context,
  callback
) => {
  console.log(`Received event: ${JSON.stringify(event)}`);
  const accessToken = await getAccessToken(event);

  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  app.event(
    "app_home_opened",
    async ({ event: home_event, context: home_context }) => {
      const token = home_context.botToken ?? "";
      const user_id = home_event.user;

      await eventBridge.putEvent(
        "application.slackIntegration",
        {
          accessToken,
          token,
          user_id,
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
        accessToken,
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
        accessToken,
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
        accessToken,
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
        accessToken,
        message,
      },
      "translate.message"
    );
  });

  const response = await awsLambdaReceiver.start();

  return response(event, context, callback);
};
