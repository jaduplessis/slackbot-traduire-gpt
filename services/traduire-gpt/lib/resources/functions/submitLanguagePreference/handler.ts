import { SSMClient } from "@aws-sdk/client-ssm";
import { EventBridgeAdapter } from "@slackbot/cdk-constructs";
import { getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import {
  getStateValues,
  instantiateApp,
  SubmitApiKeyEvent,
  uploadParameter,
} from "../../utils";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"submit.api.key", SubmitApiKeyEvent>
) => {
  const { token, user_id, body } = event.detail;

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

  const { app, awsLambdaReceiver } = instantiateApp();

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
      token,
      user_id,
    },
    "app.home.opened"
  );
};
