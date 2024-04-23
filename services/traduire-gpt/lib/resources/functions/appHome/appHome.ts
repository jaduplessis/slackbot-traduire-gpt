import { HomeView } from "@slack/bolt";
import { getApiKeyBlocks } from "./apiKey";
import { getLanguagePreferenceBlocks } from "./languagePreference";

export const createHome = (
  apiKey: string | undefined,
  primaryLanguage: string | undefined,
  secondaryLanguage: string | undefined
): HomeView => {
  // Block to request the user to input the API key if undefined
  const apiKeyBlock = getApiKeyBlocks(apiKey);
  const languagePreferenceBlocks = getLanguagePreferenceBlocks(primaryLanguage, secondaryLanguage);

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!* \nThis is a home for the traduire-gpt app. Add this app to your channel to get translations of channel posts.",
      },
    },
    {
      type: "divider",
    },
    ...apiKeyBlock,
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*How to use* \n1. Add this app to your channel. \n2. Type `/traduire <text>` in the channel to get translations of the text.",
      },
    },
    {
      type: "divider",
    },
    ...languagePreferenceBlocks,
  ];

  const view: HomeView = {
    type: "home",
    callback_id: "home_view",
    blocks: blocks,
  };

  return view;
};
