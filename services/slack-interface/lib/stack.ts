import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  ApiGateway,
  DynamoDBConstruct,
  EventBridge,
} from "@slackbot/cdk-constructs";
import { buildResourceName, getStage } from "@slackbot/helpers";
import {
  AppHome,
  SlackAuthCallback,
  SlackInstall,
  SlackIntegration,
} from "./resources/functions";

export class SlackInterfaceStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stage = getStage();

    const eventBridge = new EventBridge(this, "event-bridge", {
      eventBusName: buildResourceName("traduire-global-event-bus"),
    });

    const workspaceTable = new DynamoDBConstruct(
      this,
      "traduire-workspace-table",
      {
        tableName: buildResourceName("traduire-workspace-table"),
      }
    );

    const slackIntegration = new SlackIntegration(
      this,
      "traduire-slack-integration",
      {
        eventBus: eventBridge.eventBus,
        workspaceTable: workspaceTable.table,
      }
    );

    const slackInstall = new SlackInstall(this, "slack-install");
    const slackAuthCallback = new SlackAuthCallback(
      this,
      "slack-auth-callback",
      {
        workspaceTable: workspaceTable.table,
      }
    );

    new ApiGateway(this, "api-gateway", {
      stage,
      slackIntegration,
      slackInstall,
      slackAuthCallback,
    });

    new AppHome(this, "app-home", {
      eventBus: eventBridge.eventBus,
    });
  }
}
