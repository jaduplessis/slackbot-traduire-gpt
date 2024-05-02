import { SSMClient } from "@aws-sdk/client-ssm";
import { EventBridgeAdapter, SlackAppAdapter } from "@slackbot/adapters";
import {
  getRegion,
  getStateValues,
  SubmitApiKeyEvent,
  uploadParameter,
} from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"submit.api.key", SubmitApiKeyEvent>
) => {
  const {accessToken, token, user_id, body } = event.detail;

  const primaryLanguage = getStateValues(body, "primary_language_input");
  if (primaryLanguage) {
    await uploadParameter(
      ssm,
      "language-preference/PRIMARY_LANGUAGE",
      primaryLanguage,
      false
    );
  }

  const secondaryLanguage = getStateValues(body, "secondary_language_input");
  if (secondaryLanguage) {
    await uploadParameter(
      ssm,
      "language-preference/SECONDARY_LANGUAGE",
      secondaryLanguage,
      false
    );
  }

  if (!primaryLanguage && !secondaryLanguage) {
    return;
  }

  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  await app.client.chat.postMessage({
    token,
    channel: user_id,
    text: "Language preference updated successfully!",
  });

  await awsLambdaReceiver.start();

  // Re-render the app home view
  await eventBridge.putEvent(
    "application.slackIntegration",
    {
      accessToken,
      token,
      user_id,
    },
    "app.home.opened"
  );
};
