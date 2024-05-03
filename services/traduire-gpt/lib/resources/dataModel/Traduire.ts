import { Entity, EntityItem } from "dynamodb-toolbox";

import { TraduireTable } from "./Table";

export const TraduireEntity = new Entity({
  name: "TraduireItem",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "MESSAGE_TS#" },
    SK: {
      sortKey: true,
      hidden: true,
      prefix: "TEAM_ID#",
    },
    messageTs: ["PK", 0, { type: "string", required: true }],
    teamId: ["SK", 0, { type: "string", required: true }],
    messageSent: { type: "string" },
    text: { type: "string" },
    translation: { type: "string" },
  },
  table: TraduireTable,
} as const);

export type DDBTranslate = EntityItem<typeof TraduireEntity>;
