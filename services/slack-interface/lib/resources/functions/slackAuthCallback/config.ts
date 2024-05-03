import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import {
  buildParameterArnSsm,
  buildResourceName,
  getCdkHandlerPath,
  getEnvVariable,
  getRegion,
} from "@slackbot/helpers";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";

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

    const region = getRegion();
    const accountId = Stack.of(this).account;

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

    const accessPattern = buildResourceName("system");
    const ssmReadPolicy = new PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: [buildParameterArnSsm(`${accessPattern}`, region, accountId)],
    });

    this.function.addToRolePolicy(ssmReadPolicy);
  }
}
