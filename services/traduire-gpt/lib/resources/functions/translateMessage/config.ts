import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import {
  buildParameterArnSsm,
  buildResourceName,
  getCdkHandlerPath,
  getEnvVariable,
  getRegion,
} from "@slackbot/helpers";
import { Duration, Stack } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface translateMessageProps {
  table: Table;
  eventBus: EventBus;
}

export class TranslateMessage extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { table, eventBus }: translateMessageProps
  ) {
    super(scope, id);

    const region = getRegion();
    const accountId = Stack.of(this).account;

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
    const SLACK_BOT_TOKEN = getEnvVariable("SLACK_BOT_TOKEN");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("translate-message"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        timeout: Duration.minutes(3),
        environment: {
          SLACK_SIGNING_SECRET,
          SLACK_BOT_TOKEN,
          TABLE_NAME: table.tableName,
        },
      }
    );

    table.grantReadWriteData(this.function);

    new Rule(this, buildResourceName("on-message-translated-event"), {
      eventBus,
      eventPattern: {
        source: ["application.slackIntegration"],
        detailType: ["translate.message"],
      },
      targets: [new LambdaFunction(this.function)],
    });

    const apiAccessPattern = buildResourceName("api-keys/*");
    const languageAccessPattern = buildResourceName("language-preferences/*");

    const ssmReadPolicy = new PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: [
        buildParameterArnSsm(`${apiAccessPattern}`, region, accountId),
        buildParameterArnSsm(`${languageAccessPattern}`, region, accountId),
      ],
    });

    this.function.addToRolePolicy(ssmReadPolicy);
  }
}
