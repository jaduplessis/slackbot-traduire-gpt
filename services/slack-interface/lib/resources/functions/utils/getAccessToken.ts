import { BasicSlackEvent, BlockAction, EnvelopedEvent } from "@slack/bolt";
import { APIGatewayProxyEvent } from "aws-lambda";
import { WorkspaceEntity } from "../../dataModel";


export const getAccessToken = async (
  event: APIGatewayProxyEvent
): Promise<{ teamId: string; accessToken: string }> => {
  console.log("Event: ", event);
  if (!event.body) {
    throw new Error("No event body");
  }

  // Process the event body
  const contentType = event.headers["Content-Type"];
  let payload;
  switch (contentType) {
    case "application/x-www-form-urlencoded":
      let body = decodeURIComponent(event.body);

      const firstCurly = body.indexOf("{");
      if (firstCurly !== -1) {
        body = body.slice(firstCurly);
      }

      payload = JSON.parse(body);
      break;
    case "application/json":
      payload = JSON.parse(event.body);
      break;
    default:
      throw new Error(`Content-Type not supported: ${contentType}`);
  }

  // Extract the team ID and access token depending on the event type
  const type = payload.type;
  let teamId: string;
  switch (type) {
    case "block_actions":
      const blockAction = payload as BlockAction;
      teamId = blockAction.user.team_id as string;
      break;

    case "event_callback":
      const envelopedEvent = payload as EnvelopedEvent<BasicSlackEvent>;
      teamId = envelopedEvent.team_id;
      break;

    case "url_verification":
      const challenge = payload.challenge;
      return {
        teamId: "",
        accessToken: challenge,
      };

    default:
      throw new Error(`Event type not supported: ${type}`);
  }

  // Get the workspace entity and return the access token
  const response = await WorkspaceEntity.get({
    teamId,
  });

  const workspace = response.Item;

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return {
    teamId: workspace.teamId,
    accessToken: workspace.accessToken,
  };
};
