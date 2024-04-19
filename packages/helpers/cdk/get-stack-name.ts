import { getArg } from "../getArg";

export const getStackName = (): string => {
  return getArg({
    cliArg: "stackName",
    processEnvName: "STACK_NAME",
    defaultValue: "traduire-gpt",
  });
};
