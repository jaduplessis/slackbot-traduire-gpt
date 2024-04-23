export enum ElementTypeEnum {
  PLAIN_TEXT_INPUT = "plain_text_input",
  STATIC_SELECT = "static_select",
  UNKNOWN = "unknown",
}

interface Element {
  type: ElementTypeEnum;
  action_id: string;
}

export interface SlackInteractionPayload {
  view: {
    blocks: Array<{
      block_id: string;
      elements: Element[];
      element: Element;
    }>;
    state: {
      values: {
        // Block ID
        [key: string]: {
          // Action ID
          [key: string]: {
            type: string;
            value: string;
            selected_option: {
              text: {
                type: string;
                text: string;
                emoji: boolean;
              };
              value: string;
            } | null;
          };
        };
      };
    };
  };
  actions: Array<{
    action_id: string;
    block_id: string;
    text: {
      type: string;
      text: string;
      emoji: boolean;
    };
    value: string;
    type: string;
    action_ts: string;
  }>;
  eventTime: number;
}
