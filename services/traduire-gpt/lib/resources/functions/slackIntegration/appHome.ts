import { HomeView } from "@slack/bolt";

export const createHome = (): HomeView => {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome!* \nThis is a home for the traduire-gpt app. Add this app to your channel to get translations of channel posts.",
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
