import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Table } from "dynamodb-toolbox";

import { buildResourceName, getRegion } from "@slackbot/helpers";

const documentClient = new DynamoDB({
  region: getRegion(),
});

export const TranslateTable = new Table({
  name: buildResourceName("translations-table"),
  partitionKey: "PK",
  sortKey: "SK",
  indexes: {
    GSI1: {
      partitionKey: "GSI1PK",
      sortKey: "GSI1SK",
    },
  },
  DocumentClient: documentClient,
} as const);
