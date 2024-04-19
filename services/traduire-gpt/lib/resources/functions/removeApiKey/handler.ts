import {
  DeleteParameterCommand,
  DeleteParameterCommandInput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { EventBridgeAdapter } from "@slackbot/cdk-constructs";
import { buildResourceName, getRegion } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { BaseEvent, instantiateApp } from "../../utils";

const ssm = new SSMClient({ region: getRegion() });
const eventBridge = new EventBridgeAdapter();

export const handler = async (
  event: EventBridgeEvent<"remove.api.key", BaseEvent>
) => {
  const { token, user_id } = event.detail;
  const { app, awsLambdaReceiver } = instantiateApp();

  const parameterName = buildResourceName("api-keys/OPENAI_API_KEY");

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
      token,
      user_id,
    },
    "app.home.opened"
  );
};
