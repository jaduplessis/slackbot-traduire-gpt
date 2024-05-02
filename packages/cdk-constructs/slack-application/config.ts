import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface RestApiFunctions {
  function: NodejsFunction;
}

interface SlackApplicationProps {
  stage: string;
  slackIntegration: RestApiFunctions;
}

export class SlackApplication extends Construct {
  public eventBus: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // User Table

    // Install Function

    // Auth Callback Function

    // API Gateway

    // Event Bridge
  }
}
