import { getEnvVariable } from "@slackbot/helpers";
import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async () => {
  const slackClientId = getEnvVariable("SLACK_CLIENT_ID");

  const html = `
    <html>
      <body>
        <a href="https://slack.com/oauth/v2/authorize?client_id=6038606150656.6353191158049&scope=channels:history,chat:write,groups:history&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
      </body>
    </html>
  `;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: html,
  };
};
