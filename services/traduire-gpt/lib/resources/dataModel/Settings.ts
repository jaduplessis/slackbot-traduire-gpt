import { Entity, EntityItem } from "dynamodb-toolbox";

import { TraduireTable } from "./Table";

export const SettingsEntity = new Entity({
  name: "SettingsItem",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "TEAM_ID#" },
    SK: {
      sortKey: true,
      hidden: true,
      default: "SETTINGS",
    },
    teamId: ["PK", 0, { type: "string", required: true }],
    primaryLanguage: { type: "string", default: "English", required: true },
    secondaryLanguage: { type: "string", default: "French", required: true },
  },
  table: TraduireTable,
} as const);

export type DDBSettings = EntityItem<typeof SettingsEntity>;
