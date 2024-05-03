import { Block, KnownBlock } from "@slack/bolt";

export const getApiKeyBlocks = (
  apiKey: string | undefined
): (Block | KnownBlock)[] => {
  let apiKeyBlock: (Block | KnownBlock)[];
  switch (apiKey) {
    case undefined:
      apiKeyBlock = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*API Key Required* \nPlease input the OpenAI API key in the environment variables.",
          },
        },
        {
          type: "input",
          block_id: "api_key_input_block",
          element: {
            type: "plain_text_input",
            action_id: "api_key_input",
            placeholder: {
              type: "plain_text",
              text: "Input API Key",
            },
          },
          label: {
            type: "plain_text",
            text: "API Key",
          },
        },

        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Submit",
              },
              action_id: "submit_api_key",
            },
          ],
        },
      ];
      break;
    default:
      apiKeyBlock = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*API Key* \nAPI Key: *****************************",
          },
        },
        {
          type: "actions",
          block_id: "remove_api_key",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Remove API Key",
              },
              action_id: "remove_api_key",
            },
          ],
        },
      ];
      break;
  }
  return apiKeyBlock;
};
