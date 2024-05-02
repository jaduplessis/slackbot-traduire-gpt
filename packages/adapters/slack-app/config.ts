import { App, AwsLambdaReceiver } from "@slack/bolt";
import { getEnvVariable } from "@slackbot/helpers";

export const SlackAppAdapter = (
  accessToken: string
): {
  app: App;
  awsLambdaReceiver: AwsLambdaReceiver;
} => {
  const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: getEnvVariable("SLACK_SIGNING_SECRET"),
  });

  const app = new App({
    token: accessToken,
    receiver: awsLambdaReceiver,
  });

  return { app, awsLambdaReceiver };
};
