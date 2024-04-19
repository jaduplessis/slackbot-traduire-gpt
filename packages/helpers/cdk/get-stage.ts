import { getArg } from "../getArg";

const defaultEnvironment = "dev";

export const getStage = (): string => {
  const stage = getArg({
    cliArg: "stage",
    processEnvName: "STAGE",
    defaultValue: defaultEnvironment,
  });

  if (stage === "dev" && process.env.PR_NUMBER !== undefined) {
    return `${stage}-${process.env.PR_NUMBER}`;
  }
  return stage;
};
