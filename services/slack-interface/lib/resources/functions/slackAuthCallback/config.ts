import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import {
  buildParameterArnSsm,
  buildResourceName,
  getCdkHandlerPath,
  getEnvVariable,
  getRegion,
} from "@slackbot/helpers";
import { Stack } from "aws-cdk-lib";
import { LambdaIntegration, Resource } from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface SlackAuthCallbackProps {
  workspaceTable: Table;
  slackEndPoint: Resource;
}

export class SlackAuthCallback extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { workspaceTable, slackEndPoint }: SlackAuthCallbackProps
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

    // Auth callback URL
    const oauthCallbackEndPoint = slackEndPoint.addResource("auth");
    const oauthCallbackIntegration = new LambdaIntegration(this.function);
    oauthCallbackEndPoint.addMethod("GET", oauthCallbackIntegration);
  }
}
