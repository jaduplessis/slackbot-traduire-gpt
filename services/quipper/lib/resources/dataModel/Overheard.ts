import { Entity, EntityItem } from 'dynamodb-toolbox';

import { quipperTable } from './Table';

export const overheardEntity = new Entity({
  name: 'overheardItem',
  attributes: {
    PK: { partitionKey: true, hidden: true, prefix: "MESSAGE_TS#" },
    SK: {
      sortKey: true,
      hidden: true,
      prefix: "TEAM_ID#",
    },
    messageTs: ["PK", 0, { type: "string", required: true }],
    teamId: ["SK", 0, { type: "string", required: true }],
    text: { type: 'string' },
    imagePrompt: { type: 'string' },
    imageUrl: { type: 'string' },
  },
  table: quipperTable,
} as const);

export type DDBOverheard = EntityItem<typeof overheardEntity>;
