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
import { IEventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface SubmitLanguagePreferenceProps {
  eventBus: IEventBus;
}

export class SubmitLanguagePreference extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { eventBus }: SubmitLanguagePreferenceProps
  ) {
    super(scope, id);

    const region = getRegion();
    const accountId = Stack.of(this).account;

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("submit-language-preference"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        environment: {
          SLACK_SIGNING_SECRET,
          EVENT_BUS: eventBus.eventBusName,
        },
      }
    );

    eventBus.grantPutEventsTo(this.function);

    new Rule(this, buildResourceName("on-submit-language-preference-event"), {
      eventBus,
      eventPattern: {
        source: ["application.slackIntegration"],
        detailType: ["submit.language.preference"],
      },
      targets: [new LambdaFunction(this.function)],
    });

    const accessPattern = buildResourceName("language-preference/*");
    const ssmReadPolicy = new PolicyStatement({
      actions: ["ssm:PutParameter"],
      resources: [buildParameterArnSsm(`${accessPattern}`, region, accountId)],
    });

    this.function.addToRolePolicy(ssmReadPolicy);
  }
}
