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
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface submitApiKeyProps {
  eventBus: EventBus;
}

export class SubmitApiKey extends Construct {
  public function: NodejsFunction;

  constructor(scope: Construct, id: string, { eventBus }: submitApiKeyProps) {
    super(scope, id);

    const region = getRegion();
    const accountId = Stack.of(this).account;

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
    const SLACK_BOT_TOKEN = getEnvVariable("SLACK_BOT_TOKEN");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("submit-api-key"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        environment: {
          SLACK_SIGNING_SECRET,
          SLACK_BOT_TOKEN,
          EVENT_BUS: eventBus.eventBusName,
        },
      }
    );

    eventBus.grantPutEventsTo(this.function);

    new Rule(this, buildResourceName("on-submit-api-key-event"), {
      eventBus,
      eventPattern: {
        source: ["application.slackIntegration"],
        detailType: ["submit.api.key"],
      },
      targets: [new LambdaFunction(this.function)],
    });

    const accessPattern = buildResourceName("api-keys/*");
    const ssmReadPolicy = new PolicyStatement({
      actions: ["ssm:PutParameter"],
      resources: [buildParameterArnSsm(`${accessPattern}`, region, accountId)],
    });

    this.function.addToRolePolicy(ssmReadPolicy);
  }
}
