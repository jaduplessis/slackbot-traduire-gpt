import {
  ElementTypeEnum,
  SlackInteractionPayload,
} from "./types/interaction-payload";

export const getStateValues = (
  body: SlackInteractionPayload,
  actionId: string
): string | undefined => {
  const stateValues = body.view.state.values;

  const blockState = stateValues[`${actionId}_block`];

  const state = blockState[actionId];

  const { type } = state;

  switch (type) {
    case ElementTypeEnum.STATIC_SELECT:
      return state.selected_option?.value ?? undefined;
    case ElementTypeEnum.PLAIN_TEXT_INPUT:
      return state.value;
    default:
      throw new Error("Invalid element type");
  }
};
