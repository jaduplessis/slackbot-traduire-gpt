import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  ApiGateway,
  DynamoDBConstruct,
  EventBridge,
} from "@slackbot/cdk-constructs";
import { buildResourceName, getStage } from "@slackbot/helpers";
import { AppHome, RemoveApiKey, SlackIntegration, SubmitApiKey } from "./resources/functions";

export class TranslateStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stage = getStage();

    const translateTable = new DynamoDBConstruct(this, "translateTable", {
      tableName: buildResourceName("translations-table"),
    });

    const eventBridge = new EventBridge(this, "event-bridge", {
      eventBusName: buildResourceName("slackbot-event-bus"),
    });

    const slackIntegration = new SlackIntegration(
      this,
      "translate-slack-integration",
      {
        table: translateTable.table,
        eventBus: eventBridge.eventBus,
      }
    );

    new ApiGateway(this, "api-gateway", {
      stage,
      slackIntegration,
    });

    new AppHome(this, "app-home", {
      eventBus: eventBridge.eventBus,
    });

    new SubmitApiKey(this, "submit-api-key", {
      eventBus: eventBridge.eventBus,
    });

    new RemoveApiKey(this, "remove-api-key", {
      eventBus: eventBridge.eventBus,
    });
  }
}
