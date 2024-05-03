import { HomeView } from "@slack/bolt";
import { getApiKeyBlocks } from "./apiKey";
import { getLanguagePreferenceBlocks } from "./languagePreference";

export const createHome = (
  apiKey: string | undefined,
  primaryLanguage: string,
  secondaryLanguage: string
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
        text: "*How to use* \nType `/invite @traduire-gpt` in the channel to get automatic translations of the posts in your channel!.\n\n",
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
