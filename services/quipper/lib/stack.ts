import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";

import { DynamoDBConstruct, S3Construct } from "@slackbot/cdk-constructs";
import { buildResourceName, eventBusName } from "@slackbot/helpers";
import { EventBus } from "aws-cdk-lib/aws-events";
import {
  AppHome,
  GenerateImage,
  RemoveApiKey,
  SubmitApiKey,
} from "./resources/functions";

export class quipperStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const quipperTable = new DynamoDBConstruct(this, "quipperTable", {
      tableName: buildResourceName("quipper-table"),
    });

    const resultsBucket = new S3Construct(this, "resultsBucket", {
      bucketName: buildResourceName("quipper-results"),
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

    new AppHome(this, "app-home", {
      eventBus,
      quipperTable: quipperTable.table,
    });

    new GenerateImage(this, "generate-image", {
      eventBus,
      quipperTable: quipperTable.table,
      resultsBucket: resultsBucket.bucket,
    });
  }
}
