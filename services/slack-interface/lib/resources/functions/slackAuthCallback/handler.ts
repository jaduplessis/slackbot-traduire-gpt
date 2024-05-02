import { getEnvVariable } from "@slackbot/helpers";
import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";

export const handler: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters } = event;
  const code = queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code",
    };
  }

  // Exchange code for token: curl -F code=1234 -F client_id=3336676.569200954261 -F client_secret=ABCDEFGH https://slack.com/api/oauth.v2.access
  const url = "https://slack.com/api/oauth.v2.access";
  const response = await axios.post(
    url,
    new URLSearchParams({
      code,
      client_id: getEnvVariable("SLACK_CLIENT_ID"),
      client_secret: getEnvVariable("SLACK_CLIENT_SECRET"),
      redirect_uri:
        "https://51j0vgmkei.execute-api.eu-west-2.amazonaws.com/dev-oauth/slack/auth",
    })
  );

  if (response.status !== 200) {
    return {
      statusCode: 500,
      body: "Failed to exchange code for token",
    };
  }

  const html = `
    <html>
      <body>
        <h1>Success</h1>
        <p>Your token is: ${JSON.stringify(response.data)}</p>
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
