import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { ApiGatewayProps } from "./types";

interface CreateIntegrationsProps extends ApiGatewayProps {
  api: RestApi;
}

export const createIntegrations = (props: CreateIntegrationsProps) => {
  const { api, slackIntegration, slackInstall, slackAuthCallback } = props;

  const slackEndPoint = api.root.addResource("slack");

  const eventsIntegrationEndPoint = slackEndPoint.addResource("events");
  const eventsIntegration = new LambdaIntegration(slackIntegration.function);
  eventsIntegrationEndPoint.addMethod("POST", eventsIntegration);

  // auth callback URL
  const oauthCallbackEndPoint = slackEndPoint.addResource("auth");
  const oauthCallbackIntegration = new LambdaIntegration(
    slackAuthCallback.function
  );
  oauthCallbackEndPoint.addMethod("GET", oauthCallbackIntegration);

  // Install URL
  const oauthInstallEndPoint = slackEndPoint.addResource("install");
  const oauthInstallIntegration = new LambdaIntegration(slackInstall.function);
  oauthInstallEndPoint.addMethod("GET", oauthInstallIntegration);
};
