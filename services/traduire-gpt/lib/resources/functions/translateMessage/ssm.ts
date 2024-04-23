import { SSMClient } from "@aws-sdk/client-ssm";
import { getParameter } from "../../utils";

interface SsmValues {
  primaryLanguage: string | undefined;
  secondaryLanguage: string | undefined;
}

export const loadSsmValues = async (ssm: SSMClient): Promise<SsmValues> => {
  const apiKey = await getParameter(ssm, "api-keys/OPENAI_API_KEY", true);
  process.env.OPENAI_API_KEY = apiKey;

  const primaryLanguage = await getParameter(
    ssm,
    "language-preference/PRIMARY_LANGUAGE",
    false
  );

  const secondaryLanguage = await getParameter(
    ssm,
    "language-preference/SECONDARY_LANGUAGE",
    false
  );

  return {
    primaryLanguage,
    secondaryLanguage,
  };
};
