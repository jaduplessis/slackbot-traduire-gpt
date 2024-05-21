import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

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
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { SlackCustomResource } from "@slackbot/cdk-constructs";

interface generateImageProps {
  eventBus: IEventBus;
  resultsBucket: Bucket;
  quipperTable: Table;
}

export class GenerateImage extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { eventBus, resultsBucket, quipperTable }: generateImageProps
  ) {
    super(scope, id);

    const region = getRegion();
    const accountId = Stack.of(this).account;

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
    // const SLACK_CHANNEL_ID = getEnvVariable("SLACK_CHANNEL_ID");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("generate-image"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        timeout: Duration.minutes(3),
        environment: {
          SLACK_SIGNING_SECRET,
          RESULTS_BUCKET: resultsBucket.bucketName,
        },
      }
    );

    // Grant putObject to the results bucket
    resultsBucket.grantPut(this.function);
    quipperTable.grantReadWriteData(this.function);

    new Rule(this, buildResourceName("on-image-generated-event"), {
      eventBus,
      eventPattern: {
        source: ["application.slackIntegration"],
        detailType: ["generate.image"],
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
