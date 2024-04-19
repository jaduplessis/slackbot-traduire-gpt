import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface RestApiFunctions {
  function: NodejsFunction;
}

export interface ApiGatewayProps {
  stage: string;
  slackIntegration: RestApiFunctions;
}
