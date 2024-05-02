import { Entity, EntityItem } from "dynamodb-toolbox";

import { TraduireTable } from "./Table";

export const TranslateEntity = new Entity({
  name: "TraduireItem",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "MESSAGE_TS#" },
    SK: {
      sortKey: true,
      hidden: true,
      default: "ROOT",
    },
    messageSent: { type: "string" },
    text: { type: "string" },
    translation: { type: "string" },
  },
  table: TraduireTable,
} as const);

export type DDBTranslate = EntityItem<typeof TranslateEntity>;
