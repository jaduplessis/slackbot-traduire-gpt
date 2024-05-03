import {
  PutParameterCommand,
  PutParameterCommandInput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { EventBridgeAdapter, SlackAppAdapter } from "@slackbot/adapters";
import {
  buildResourceName,
  getRegion,
  getStateValues,
  SubmitApiKeyEvent,
} from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"submit.api.key", SubmitApiKeyEvent>
) => {
  const { accessToken, teamId, token, user_id, body } = event.detail;

  const apiKey = getStateValues(body, "api_key_input");

  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  const parameterName = buildResourceName(`api-keys/${teamId}/OPENAI_API_KEY`);

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
      accessToken,
      teamId,
      token,
      user_id,
    },
    "app.home.opened"
  );
};
