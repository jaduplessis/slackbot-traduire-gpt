import { getStage } from "./get-stage";

export const isProduction = (): boolean => {
  return getStage() === "prod";
};

export const isDev = (): boolean => {
  const stage = getStage();
  const isStaging = stage === "staging";
  const isProd = stage === "prod";

  return !isStaging && !isProd;
};
