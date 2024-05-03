import { SSMClient } from "@aws-sdk/client-ssm";
import { EventBridgeAdapter, SlackAppAdapter } from "@slackbot/adapters";
import {
  getRegion,
  getStateValues,
  SubmitApiKeyEvent,
} from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { SettingsEntity } from "../../dataModel/Settings";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"submit.api.key", SubmitApiKeyEvent>
) => {
  const { accessToken, teamId, token, user_id, body } = event.detail;

  const primaryLanguage = getStateValues(body, "primary_language_input");
  if (primaryLanguage) {
    await SettingsEntity.update({
      teamId,
      primaryLanguage,
    });
  }

  const secondaryLanguage = getStateValues(body, "secondary_language_input");
  if (secondaryLanguage) {
    await SettingsEntity.update({
      teamId,
      secondaryLanguage,
    });
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
      teamId,
      token,
      user_id,
    },
    "app.home.opened"
  );
};
