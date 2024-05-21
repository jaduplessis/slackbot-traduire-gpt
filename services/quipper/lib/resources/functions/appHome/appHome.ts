import { HomeView } from "@slack/bolt";
import { getApiKeyBlocks } from "./apiKey";

export const createHome = (apiKey: string | undefined): HomeView => {
  // Block to request the user to input the API key if undefined
  const apiKeyBlock = getApiKeyBlocks(apiKey);

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!* \nThis is a home for the quipper app. Add this app to your channel to get translations of channel posts.",
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
        text: "*How to use* \nType `/invite @quipper` in the channel to get automatic translations of the posts in your channel!.\n\n",
      },
    },
  ];

  const view: HomeView = {
    type: "home",
    callback_id: "home_view",
    blocks: blocks,
  };

  return view;
};
