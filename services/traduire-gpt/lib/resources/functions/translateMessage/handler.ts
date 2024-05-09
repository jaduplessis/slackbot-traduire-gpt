import { SSMClient } from "@aws-sdk/client-ssm";
import { SlackAppAdapter } from "@slackbot/adapters";
import { getRegion, MessageEvent } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { translate } from "traduire-gpt";
import { TraduireEntity } from "../../dataModel";
import { loadSsmValues } from "./ssm";

const ssm = new SSMClient({ region: getRegion() });

export const handler = async (
  event: EventBridgeEvent<"translate.message", MessageEvent>
) => {
  const { accessToken, teamId, message } = event.detail;

  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  const { primaryLanguage, secondaryLanguage } = await loadSsmValues(
    ssm,
    teamId
  );

  if (message === undefined || message.text === undefined) {
    return;
  }
  const { text, channel, ts, thread_ts } = message;

  if (thread_ts !== undefined) {
    return;
  }

  const translateEntity = await TraduireEntity.get({
    PK: ts,
    SK: "ROOT",
  });

  if (translateEntity.Item) {
    return;
  } else {
    await TraduireEntity.update({
      messageTs: ts,
      teamId,
      messageSent: "PENDING",
    });
  }

  const translation = await translate(text, primaryLanguage, secondaryLanguage);

  if (translation === undefined) {
    return;
  }

  await app.client.chat.postMessage({
    token: accessToken,
    channel,
    thread_ts: ts,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: translation,
        },
      },
    ],
  });

  await TraduireEntity.update({
    messageTs: ts,
    teamId,
    messageSent: "SENT",
    text,
    translation,
  });

  await awsLambdaReceiver.start();
};
