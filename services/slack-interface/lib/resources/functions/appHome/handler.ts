import { SSMClient } from "@aws-sdk/client-ssm";
import { getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { BaseEvent, getParameter } from "@slackbot/helpers"
import { SlackAppAdapter } from "@slackbot/adapters";  
import { createHome } from "./appHome";

const ssm = new SSMClient({ region: getRegion() });

export const handler = async (
  event: EventBridgeEvent<"app.home.opened", BaseEvent>
) => {
  const { token, user_id } = event.detail;
  const { app, awsLambdaReceiver } = SlackAppAdapter();

  const apiKey = await getParameter(ssm, "api-keys/OPENAI_API_KEY", true);
  const primaryLanguage = await getParameter(
    ssm,
    "language-preference/PRIMARY_LANGUAGE",
    false
  );
  const secondaryLanguage = await getParameter(
    ssm,
    "language-preference/SECONDARY_LANGUAGE",
    false
  );
  console.log("apiKey", apiKey);
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
