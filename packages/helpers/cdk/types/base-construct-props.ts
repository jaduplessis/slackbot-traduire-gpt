import { RemovalPolicy } from "aws-cdk-lib";

export interface BaseConstructProps {
  readonly stage: string;
  readonly region: string;
  readonly removalPolicy?: RemovalPolicy;
}
