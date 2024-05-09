import { SSMClient } from "@aws-sdk/client-ssm";
import { SlackAppAdapter } from "@slackbot/adapters";
import { BaseEvent, getParameter, getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { getSettingsFromTeamId } from "../utils";
import { createHome } from "./appHome";

const ssm = new SSMClient({ region: getRegion() });

export const handler = async (
  event: EventBridgeEvent<"app.home.opened", BaseEvent>
) => {
  const { accessToken, teamId, token, user_id } = event.detail;
  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  const apiKey = await getParameter(
    ssm,
    `api-keys/${teamId}/OPENAI_API_KEY`,
    true
  );
  const settings = await getSettingsFromTeamId(teamId);
  const { primaryLanguage, secondaryLanguage } = settings;

  const homeView = createHome(apiKey, primaryLanguage, secondaryLanguage);

  try {
    await app.client.views.publish({
      token,
      user_id,
      view: homeView,
    });
  } catch (e) {
    console.error(e);
  }

  await awsLambdaReceiver.start();
};
