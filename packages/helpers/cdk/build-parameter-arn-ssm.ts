export const buildParameterArnSsm = (
  accessPattern: string,
  region: string,
  accountId: string
): string => {
  return `arn:aws:ssm:${region}:${accountId}:*`;
};
