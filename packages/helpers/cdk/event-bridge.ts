import { buildResourceName } from "./build-resource-name"

export const eventBusName = buildResourceName("traduire-global-event-bus");

export const buildEventBusArn = (region: string, accountId: string): string =>
  `arn:aws:events:${region}:${accountId}:event-bus/${eventBusName}`;
