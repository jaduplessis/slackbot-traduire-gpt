import { getEnvVariable } from "@slackbot/helpers";
import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import { WorkspaceEntity } from "../../dataModel/Workspace";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters } = event;
  const code = queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code",
    };
  }

  const url = "https://slack.com/api/oauth.v2.access";
  const response = await axios.post(
    url,
    new URLSearchParams({
      code,
      client_id: getEnvVariable("SLACK_CLIENT_ID"),
      client_secret: getEnvVariable("SLACK_CLIENT_SECRET"),
      redirect_uri:
        "https://jwp2d5n2c8.execute-api.eu-west-2.amazonaws.com/dev/slack/auth",
    })
  );

  if (response.status !== 200) {
    return {
      statusCode: 500,
      body: "Failed to exchange code for token",
    };
  }

  const { data } = response;
  if (!data.ok) {
    return {
      statusCode: 400,
      body: "Failed to exchange code for token",
    };
  }

  const workspaceResponse = await WorkspaceEntity.update({
    team_id: data.team.id,
    name: data.team.name,
    scope: data.scope,
    token_type: data.token_type,
    access_token: data.access_token,
    bot_user_id: data.bot_user_id,
    enterprise: data.enterprise,
  });

  const html = `
    <html>
      <body>
        <h1>Success</h1>
        <p>Your token is: ${JSON.stringify(workspaceResponse)}</p>
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
