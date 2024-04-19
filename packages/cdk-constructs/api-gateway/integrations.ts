import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ApiGatewayProps } from "./types";

interface CreateIntegrationsProps extends ApiGatewayProps {
  api: RestApi;
}

export const createIntegrations = (props: CreateIntegrationsProps) => {
  const { api } = props;

  const slackIntegrationEndPoint = api.root.addResource("slack");
  const slackIntegration = new LambdaIntegration(
    props.slackIntegration.function
  );
  slackIntegrationEndPoint.addMethod("POST", slackIntegration);
};
