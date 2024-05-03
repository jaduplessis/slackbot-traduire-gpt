import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import { buildResourceName, getCdkHandlerPath, getEnvVariable } from "@slackbot/helpers";
import { Construct } from "constructs";

export class SlackInstall extends Construct {
  public function: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const SLACK_CLIENT_ID = getEnvVariable("SLACK_CLIENT_ID");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("slack-install"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        environment: {
          SLACK_CLIENT_ID
        }
      }
    );
  }
}
