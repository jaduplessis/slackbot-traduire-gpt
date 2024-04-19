import { KnownEventFromType } from "@slack/bolt";
import { SlackInteractionPayload } from "./slackTypes";

export interface BaseEvent {
  token: string;
  user_id: string;
}

export interface SubmitApiKeyEvent extends BaseEvent {
  body: SlackInteractionPayload;
}

type MessageDetailsBase = KnownEventFromType<"message">;

interface MessageDetailsExtension {
  text?: string;
  thread_ts?: string;
}

export interface MessageEvent extends BaseEvent {
  message: MessageDetailsBase & MessageDetailsExtension;
}
