import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DynamoDBConstruct } from "@slackbot/cdk-constructs";
import { buildResourceName, eventBusName } from "@slackbot/helpers";
import { EventBus } from "aws-cdk-lib/aws-events";
import {
  AppHome,
  RemoveApiKey,
  SubmitApiKey,
  SubmitLanguagePreference,
  TranslateMessage,
} from "./resources/functions";

export class TraduireStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const translateTable = new DynamoDBConstruct(this, "traduireTable", {
      tableName: buildResourceName("traduire-table"),
    });

    const eventBus = EventBus.fromEventBusName(
      this,
      "EventBridge",
      eventBusName
    );

    new SubmitApiKey(this, "submit-api-key", {
      eventBus,
    });

    new RemoveApiKey(this, "remove-api-key", {
      eventBus,
    });

    new SubmitLanguagePreference(this, "submit-language-preference", {
      traduireTable: translateTable.table,
      eventBus,
    });

    new TranslateMessage(this, "translate-message", {
      eventBus,
      traduireTable: translateTable.table,
    });

    new AppHome(this, "app-home", {
      eventBus,
      traduireTable: translateTable.table,
    });
  }
}
