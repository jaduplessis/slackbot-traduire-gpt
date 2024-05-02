import { BasicSlackEvent, EnvelopedEvent } from "@slack/bolt";
import { APIGatewayProxyEvent } from "aws-lambda";
import { WorkspaceEntity } from "../../dataModel";

export const getAccessToken = async (
  event: APIGatewayProxyEvent
): Promise<string> => {
  if (!event.body) {
    throw new Error("No event body");
  }

  const payload = JSON.parse(event.body) as EnvelopedEvent<BasicSlackEvent>;
  const team_id = payload.team_id;

  const response = await WorkspaceEntity.get({
    team_id,
  });

  const workspace = response.Item;

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return workspace.access_token;
};
