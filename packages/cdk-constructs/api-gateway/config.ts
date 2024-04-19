import { buildResourceName } from "@slackbot/helpers";
import { ApiKeySourceType, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { createIntegrations } from "./integrations";
import { ApiGatewayProps } from "./types";

export class ApiGateway extends Construct {
  public restApi: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const { stage } = props;

    this.restApi = new RestApi(this, "api-gateway", {
      restApiName: buildResourceName("api-gateway"),
      deployOptions: {
        stageName: stage,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["*"],
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    createIntegrations({ ...props, api: this.restApi });
  }
}
