import { Construct } from "constructs";
import { getStackName } from "./get-stack-name";
import { getStage } from "./get-stage";

export const buildResourceName = (resourceName: string): string =>
  `${getStackName()}-${getStage()}-${resourceName}`;
