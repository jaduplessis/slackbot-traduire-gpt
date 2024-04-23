import { SSMClient } from "@aws-sdk/client-ssm";
import { getEnvVariable, getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { BaseEvent, getParameter, instantiateApp } from "../../utils";
import { createHome } from "./appHome";

const ssm = new SSMClient({ region: getRegion() });

export const handler = async (
  event: EventBridgeEvent<"app.home.opened", BaseEvent>
) => {
  const { token, user_id } = event.detail;

  const { app, awsLambdaReceiver } = instantiateApp();

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
