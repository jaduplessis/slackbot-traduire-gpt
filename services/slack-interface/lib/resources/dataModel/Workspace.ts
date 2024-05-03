import { Entity, EntityItem } from "dynamodb-toolbox";

import { SlackWorkspaceTable } from "./Table";

export const WorkspaceEntity = new Entity({
  name: "WorkspaceItem",
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "TEAM_ID#" },
    SK: {
      sortKey: true,
      hidden: true,
      default: "WORKSPACE",
    },
    teamId: ["PK", 0, { type: "string", required: true }],
    name: { type: "string" },
    scope: { type: "string" },
    tokenType: { type: "string" },
    accessToken: { type: "string", required: true },
    botUserId: { type: "string", required: true },
    enterprise: { type: "string" },
    primaryLanguage: { type: "string", default: "English" },
    secondaryLanguage: { type: "string", default: "French" },
  },
  table: SlackWorkspaceTable,
} as const);

export type DDBWorkspace = EntityItem<typeof WorkspaceEntity>;
