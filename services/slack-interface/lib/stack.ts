import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  ApiGateway,
  DynamoDBConstruct,
  EventBridge,
} from "@slackbot/cdk-constructs";
import { buildResourceName, getStage } from "@slackbot/helpers";
import {
  SlackAuthCallback,
  SlackInstall,
  SlackIntegration,
} from "./resources/functions";

export class SlackInterfaceStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stage = getStage();

    const apiGateway = new ApiGateway(this, "api-gateway", {
      stage,
    });

    const eventBridge = new EventBridge(this, "event-bridge", {
      eventBusName: buildResourceName("traduire-global-event-bus"),
    });

    const workspaceTable = new DynamoDBConstruct(this, "workspace-table", {
      tableName: buildResourceName("workspace-table"),
    });

    new SlackIntegration(this, "traduire-slack-integration", {
      eventBus: eventBridge.eventBus,
      workspaceTable: workspaceTable.table,
      slackEndPoint: apiGateway.slackEndPoint,
    });

    new SlackInstall(this, "slack-install", {
      slackEndPoint: apiGateway.slackEndPoint,
    });

    new SlackAuthCallback(this, "slack-auth-callback", {
      workspaceTable: workspaceTable.table,
      slackEndPoint: apiGateway.slackEndPoint,
    });
  }
}
