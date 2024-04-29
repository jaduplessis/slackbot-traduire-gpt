import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import { buildResourceName, getCdkHandlerPath } from "@slackbot/helpers";
import { Construct } from "constructs";

export class SlackInstall extends Construct {
  public function: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.function = new SlackCustomResource(
      this,
      buildResourceName("slack-install"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
      }
    );
  }
}
