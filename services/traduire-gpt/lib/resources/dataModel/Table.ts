import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Table } from "dynamodb-toolbox";

import { buildResourceName, getRegion } from "@slackbot/helpers";

const documentClient = new DynamoDB({
  region: getRegion(),
});

export const TraduireTable = new Table({
  name: buildResourceName("traduire-table"),
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
