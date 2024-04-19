import { getStage, sharedLambdaEsbuildConfig } from "@slackbot/helpers";
import { Duration } from "aws-cdk-lib";
import { Role } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface SlackLambdaProps {
  lambdaEntry: string;
  environment?: Record<string, string>;
  timeout?: Duration;
  role?: Role;
  memorySize?: number;
  runtime?: Runtime;
}

export class SlackCustomResource extends NodejsFunction {
  constructor(scope: Construct, id: string, props: SlackLambdaProps) {
    const { lambdaEntry, environment, memorySize, role, timeout } = props;

    const functionName = `${id}-lambda`;

    super(scope, `${id}-lambda`, {
      functionName,
      runtime: Runtime.NODEJS_18_X,
      bundling: {
        ...sharedLambdaEsbuildConfig,
        metafile: true,
        externalModules: [],
      },
      awsSdkConnectionReuse: true,
      entry: lambdaEntry,
      memorySize: memorySize ?? 1024,
      environment: {
        ...environment,
        STAGE: getStage(),
      },
      role,
      timeout: timeout ?? Duration.seconds(30),
    });
  }
}
