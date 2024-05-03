import { SSMClient } from "@aws-sdk/client-ssm";
import { getEnvVariable, getParameter, getRegion } from "@slackbot/helpers";
import { APIGatewayProxyHandler } from "aws-lambda";
import axios from "axios";
import { WorkspaceEntity } from "../../dataModel/Workspace";

const ssm = new SSMClient({ region: getRegion() });

export const handler: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters } = event;
  const code = queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code",
    };
  }

  const apiEndpoint = await getParameter(ssm, "system/api-gateway-url", false);

  const url = "https://slack.com/api/oauth.v2.access";
  const response = await axios.post(
    url,
    new URLSearchParams({
      code,
      client_id: getEnvVariable("SLACK_CLIENT_ID"),
      client_secret: getEnvVariable("SLACK_CLIENT_SECRET"),
      redirect_uri: `${apiEndpoint}slack/auth`,
    })
  );

  if (response.status !== 200) {
    return {
      statusCode: 500,
      body: `Failed to exchange code for token: ${response.status}`,
    };
  }

  const { data } = response;
  if (!data.ok) {
    return {
      statusCode: 400,
      body: `Failed to exchange code for token: ${data.error}`,
    };
  }

  const workspaceResponse = await WorkspaceEntity.update({
    teamId: data.team.id,
    name: data.team.name,
    scope: data.scope,
    tokenType: data.token_type,
    accessToken: data.access_token,
    botUserId: data.bot_user_id,
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
