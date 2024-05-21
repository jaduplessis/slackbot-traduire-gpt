import { SSMClient } from "@aws-sdk/client-ssm";
import { getParameter } from "@slackbot/helpers";

export const loadSsmValues = async (
  ssm: SSMClient,
  teamId: string
): Promise<void> => {
  const apiKey = await getParameter(ssm, `api-keys/${teamId}/OPENAI_API_KEY`, true);
  process.env.OPENAI_API_KEY = apiKey;
};
