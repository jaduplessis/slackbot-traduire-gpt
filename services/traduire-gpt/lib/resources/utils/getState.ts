import {
  BlockTypeEnum,
  ElementTypeEnum,
  SlackInteractionPayload,
} from "./slackTypes";

export interface BlockIdsMap {
  [key: string]: {
    block_id: string;
    element_type: ElementTypeEnum;
  };
}

export const getBlockId = (body: SlackInteractionPayload): BlockIdsMap => {
  const blocks = body.view.blocks;

  const blockIdsMap: BlockIdsMap = {};
  blocks.map((block) => {
    if (block.type === BlockTypeEnum.ACTIONS) {
      const elements = block.elements;

      elements.map((element) => {
        blockIdsMap[element.action_id] = {
          block_id: block.block_id,
          element_type: element.type,
        };
      });
    } else if (block.type === BlockTypeEnum.INPUT) {
      blockIdsMap[block.element.action_id] = {
        block_id: block.block_id,
        element_type: block.element.type,
      };
    } else {
      // Do nothing
    }
  });

  return blockIdsMap;
};

export const getStateValues = (
  body: SlackInteractionPayload,
  actionId: string
): string => {
  const blockIdsMap = getBlockId(body);

  const blockId = blockIdsMap[actionId]?.block_id ?? "";
  const elementType = blockIdsMap[actionId]?.element_type ?? "";

  const blockStateValues = body.view.state.values[blockId];
  if (blockStateValues === undefined) {
    throw new Error("Block state values is undefined");
  }

  if (elementType === ElementTypeEnum.STATIC_SELECT) {
    return blockStateValues[actionId]?.selected_option.value ?? "";
  } else if (elementType === ElementTypeEnum.PLAIN_TEXT_INPUT) {
    return blockStateValues[actionId]?.value ?? "";
  } else {
    throw new Error("Unknown element type");
  }
};
