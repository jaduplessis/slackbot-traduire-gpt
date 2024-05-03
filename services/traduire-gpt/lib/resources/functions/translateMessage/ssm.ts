import { SSMClient } from "@aws-sdk/client-ssm";
import { getParameter } from "@slackbot/helpers";
import { getSettingsFromTeamId } from "../utils";

interface SsmValues {
  primaryLanguage: string;
  secondaryLanguage: string;
}

export const loadSsmValues = async (
  ssm: SSMClient,
  teamId: string
): Promise<SsmValues> => {
  const apiKey = await getParameter(ssm, `api-keys/${teamId}/OPENAI_API_KEY`, true);
  process.env.OPENAI_API_KEY = apiKey;

  const settings = await getSettingsFromTeamId(teamId);
  const { primaryLanguage, secondaryLanguage } = settings;

  return {
    primaryLanguage,
    secondaryLanguage,
  };
};
