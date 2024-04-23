import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { buildResourceName } from "@slackbot/helpers";

export const getParameter = async (
  ssm: SSMClient,
  parameter: string,
  encrypted: boolean
): Promise<string | undefined> => {
  const input = {
    Name: `/${buildResourceName(parameter)}`,
    WithDecryption: encrypted,
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
