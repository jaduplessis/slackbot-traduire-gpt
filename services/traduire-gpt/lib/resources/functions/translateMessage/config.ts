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
import { IEventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface translateMessageProps {
  eventBus: IEventBus;
  traduireTable: Table;
}

export class TranslateMessage extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { traduireTable, eventBus }: translateMessageProps
  ) {
    super(scope, id);

    const region = getRegion();
    const accountId = Stack.of(this).account;

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("translate-message"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        timeout: Duration.minutes(3),
        environment: {
          SLACK_SIGNING_SECRET,
        },
      }
    );

    traduireTable.grantReadWriteData(this.function);

    new Rule(this, buildResourceName("on-message-translated-event"), {
      eventBus,
      eventPattern: {
        source: ["application.slackIntegration"],
        detailType: ["translate.message"],
      },
      targets: [new LambdaFunction(this.function)],
    });

    const apiAccessPattern = buildResourceName("api-keys/*");

    const ssmReadPolicy = new PolicyStatement({
      actions: ["ssm:GetParameter"],
      resources: [
        buildParameterArnSsm(`${apiAccessPattern}`, region, accountId),
      ],
    });

    this.function.addToRolePolicy(ssmReadPolicy);
  }
}
