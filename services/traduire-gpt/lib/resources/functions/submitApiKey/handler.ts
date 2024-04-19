import {
  PutParameterCommand,
  PutParameterCommandInput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { buildResourceName, getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { getStateValues, instantiateApp, SubmitApiKeyEvent } from "../../utils";
import { EventBridgeAdapter } from "@slackbot/cdk-constructs";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"submit.api.key", SubmitApiKeyEvent>
) => {
  const { token, user_id, body } = event.detail;

  console.log(body);

  const apiKey = getStateValues(body, "api_key_input");
  console.log(apiKey);

  const { app, awsLambdaReceiver } = instantiateApp();

  const parameterName = buildResourceName("api-keys/OPENAI_API_KEY");

  const input: PutParameterCommandInput = {
    Name: `/${parameterName}`,
    Value: apiKey,
    Type: "SecureString",
    Overwrite: true,
  };

  const command = new PutParameterCommand(input);
  await ssm.send(command);

  await app.client.chat.postMessage({
    token,
    channel: user_id,
    text: "API Key submitted successfully!",
  });

  await awsLambdaReceiver.start();

  await eventBridge.putEvent(
    "application.slackIntegration",
    {
      token,
      user_id,
    },
    "app.home.opened"
  );
};
