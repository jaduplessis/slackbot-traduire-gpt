import { getArg } from "./getArg";

// If we haven't set a project name at all it'll default to india-first
const defaultProjectName = "india-first";

export const getProjectName = (): string => {
  return getArg({
    cliArg: "project-name",
    processEnvName: "PROJECT_NAME",
    defaultValue: defaultProjectName,
  });
};
