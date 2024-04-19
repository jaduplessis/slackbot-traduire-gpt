import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { buildResourceName } from "@slackbot/helpers";

export const getApiKey = async (
  ssm: SSMClient,
  parameter: string
): Promise<string | undefined> => {
  const input = {
    Name: `/${buildResourceName("api-keys/" + parameter)}`,
    WithDecryption: true,
  };

  const command = new GetParameterCommand(input);
  try {
    const response = await ssm.send(command);

    const value = response.Parameter?.Value;

    return value;
  } catch (e) {
    return undefined;
  }
};
