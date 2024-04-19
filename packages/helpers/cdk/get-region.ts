import { getArg } from "../getArg";

const defaultRegion = "eu-west-2";

export const getRegion = (): string =>
  getArg({
    cliArg: "region",
    processEnvName: "REGION",
    defaultValue: defaultRegion,
  });
