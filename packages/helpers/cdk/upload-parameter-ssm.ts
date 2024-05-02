import {
  PutParameterCommand,
  PutParameterCommandInput,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { buildResourceName } from "./build-resource-name";

export const uploadParameter = async (
  ssm: SSMClient,
  parameterName: string,
  parameterValue: string,
  encrypted: boolean
): Promise<void> => {
  const input: PutParameterCommandInput = {
    Name: `/${buildResourceName(parameterName)}`,
    Value: parameterValue,
    Type: encrypted ? "SecureString" : "String",
    Overwrite: true,
  };

  const command = new PutParameterCommand(input);
  await ssm.send(command);
};
