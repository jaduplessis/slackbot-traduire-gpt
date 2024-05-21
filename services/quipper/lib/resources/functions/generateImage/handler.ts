import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SSMClient } from "@aws-sdk/client-ssm";
import { SlackAppAdapter } from "@slackbot/adapters";
import { getEnvVariable, getRegion, MessageEvent } from "@slackbot/helpers";
import { EventBridgeEvent } from "aws-lambda";
import { generateImage } from "quipper";

import { overheardEntity } from "../../dataModel";
import { loadSsmValues } from "./ssm";

const s3Client = new S3Client({});
const ssm = new SSMClient({ region: getRegion() });

export const handler = async (
  event: EventBridgeEvent<"generate.image", MessageEvent>
): Promise<void> => {
  const { accessToken, teamId, message } = event.detail;

  const { app, awsLambdaReceiver } = SlackAppAdapter(accessToken);

  await loadSsmValues(ssm, teamId);
  const resultsBucket = getEnvVariable("RESULTS_BUCKET");

  if (message === undefined || message.text === undefined) {
    return;
  }
  const { text: quote, channel, ts, thread_ts } = message;

  if (thread_ts !== undefined) {
    return;
  }

  const overheard = await overheardEntity.get({
    PK: ts,
    SK: "ROOT",
  });

  if (overheard.Item) {
    return;
  } else {
    await overheardEntity.update({
      PK: ts,
      SK: "ROOT",
      text: quote,
      imagePrompt: "PENDING",
    });
  }

  const { image, prompt } = await generateImage(quote);

  const imageFilePath = `generated-images/${channel}/${ts}/image.png`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: resultsBucket,
      Key: imageFilePath,
      Body: image,
    })
  );

  const image_url = `https://${resultsBucket}.s3.amazonaws.com/${imageFilePath}`;

  console.log({ channel, thread_ts, imageFilePath });
  await app.client.chat.postMessage({
    token: accessToken,
    channel,
    thread_ts: ts,
    blocks: [
      {
        type: "image",
        image_url,
        alt_text: "Overheard",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Prompt: ${prompt}`,
        },
      },
    ],
  });

  await overheardEntity.update({
    PK: ts,
    SK: "ROOT",
    imagePrompt: prompt,
    imageUrl: imageFilePath,
  });

  await awsLambdaReceiver.start();
};
