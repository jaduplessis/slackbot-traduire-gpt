import {
  EventBridgeClient,
  PutEventsCommand,
  PutEventsCommandOutput,
  PutEventsRequestEntry,
} from "@aws-sdk/client-eventbridge";
import { getEnvVariable } from "@slackbot/helpers";

let client: EventBridgeClient | undefined;

export class EventBridgeAdapter {
  eventBus: string;

  constructor(eventBus: string = getEnvVariable("EVENT_BUS")) {
    this.eventBus = eventBus;
  }

  putEvent(
    action: string,
    payload: Record<string, unknown>,
    detailType: string
  ): Promise<PutEventsCommandOutput> {
    const eventTime = Date.now();

    const event: PutEventsRequestEntry = {
      Source: action,
      Detail: JSON.stringify({ ...payload, eventTime }),
      DetailType: detailType,
      EventBusName: this.eventBus,
    };

    // Construct client on cold start
    if (client == null) {
      client = new EventBridgeClient();
    }

    // Create put command
    const command: PutEventsCommand = new PutEventsCommand({
      Entries: [event],
    });

    return client.send(command);
  }
}
