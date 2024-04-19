import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { ApiGateway, DynamoDBConstruct } from "@slackbot/cdk-constructs";
import { buildResourceName, getStage } from "@slackbot/helpers";
import { SlackIntegration } from "./resources/functions";

export class TranslateStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stage = getStage();

    const translateTable = new DynamoDBConstruct(this, "translateTable", {
      tableName: buildResourceName("translations-table"),
    });

    const slackIntegration = new SlackIntegration(
      this,
      "translate-slack-integration",
      {
        table: translateTable.table,
      }
    );

    new ApiGateway(this, "api-gateway", {
      stage,
      slackIntegration,
    });
  }
}
