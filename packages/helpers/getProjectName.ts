import { getArg } from "./getArg";

const defaultProjectName = "my-project-name";

export const getProjectName = (): string => {
  return getArg({
    cliArg: "project-name",
    processEnvName: "PROJECT_NAME",
    defaultValue: defaultProjectName,
  });
};
