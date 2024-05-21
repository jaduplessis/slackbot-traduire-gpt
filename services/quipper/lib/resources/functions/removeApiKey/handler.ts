import {
  DeleteParameterCommand,
  DeleteParameterCommandInput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { EventBridgeAdapter, SlackAppAdapter } from "@slackbot/adapters";
import { BaseEvent, buildResourceName, getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"remove.api.key", BaseEvent>
) => {
  const { accessToken, teamId, token, user_id } = event.detail;
  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  const parameterName = buildResourceName(`api-keys/${teamId}/OPENAI_API_KEY`);

  const input: DeleteParameterCommandInput = {
    Name: `/${parameterName}`,
  };

  const command = new DeleteParameterCommand(input);
  await ssm.send(command);

  await app.client.chat.postMessage({
    token,
    channel: user_id,
    text: "API Key deleted successfully!",
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
