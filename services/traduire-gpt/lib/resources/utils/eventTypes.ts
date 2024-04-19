import { SlackInteractionPayload } from "./slackTypes";

export interface BaseEvent {
  token: string;
  user_id: string;
}

export interface SubmitApiKeyEvent extends BaseEvent {
  body: SlackInteractionPayload;
}
