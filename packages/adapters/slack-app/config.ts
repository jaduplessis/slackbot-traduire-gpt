import { App, AwsLambdaReceiver } from "@slack/bolt";
import { getEnvVariable } from "@slackbot/helpers";

export const SlackAppAdapter = (): {
  app: App;
  awsLambdaReceiver: AwsLambdaReceiver;
} => {
  const awsLambdaReceiver = new AwsLambdaReceiver({
    signingSecret: getEnvVariable("SLACK_SIGNING_SECRET"),
  });

  const app = new App({
    token: getEnvVariable("SLACK_BOT_TOKEN"),
    receiver: awsLambdaReceiver,
  });

  return { app, awsLambdaReceiver };
};
