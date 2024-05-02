import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApiGateway, EventBridge } from "@slackbot/cdk-constructs";
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
      eventBusName: buildResourceName("translate-event-bus"),
    });

    const slackIntegration = new SlackIntegration(
      this,
      "translate-slack-integration",
      {
        eventBus: eventBridge.eventBus,
      }
    );

    const slackInstall = new SlackInstall(this, "slack-install");
    const slackAuthCallback = new SlackAuthCallback(
      this,
      "slack-auth-callback"
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
