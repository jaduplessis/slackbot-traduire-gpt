import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import {
  buildResourceName,
  getCdkHandlerPath,
  getEnvVariable,
} from "@slackbot/helpers";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

interface SlackAuthCallbackProps {
  workspaceTable: Table;
}

export class SlackAuthCallback extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { workspaceTable }: SlackAuthCallbackProps
  ) {
    super(scope, id);

    this.function = new SlackCustomResource(
      this,
      buildResourceName("slack-auth-callback"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        environment: {
          SLACK_CLIENT_ID: getEnvVariable("SLACK_CLIENT_ID"),
          SLACK_CLIENT_SECRET: getEnvVariable("SLACK_CLIENT_SECRET"),
        },
      }
    );
    
    workspaceTable.grantReadWriteData(this.function);
  }
}
