import { Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as constructs from "constructs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import { buildResourceName, getCdkHandlerPath, getEnvVariable } from "@slackbot/helpers";
import { Duration } from "aws-cdk-lib";

interface slackIntegrationProps {
  table: Table;
}

export class SlackIntegration extends constructs.Construct {
  public function: NodejsFunction;

  constructor(
    scope: constructs.Construct,
    id: string,
    { table }: slackIntegrationProps
  ) {
    super(scope, id);

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");
    const SLACK_BOT_TOKEN = getEnvVariable("SLACK_BOT_TOKEN");
    const OPENAI_API_KEY = getEnvVariable("OPENAI_API_KEY");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("slackIntegration"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        timeout: Duration.minutes(5),
        environment: {
          SLACK_SIGNING_SECRET,
          SLACK_BOT_TOKEN,
          OPENAI_API_KEY,
          TABLE_NAME: table.tableName,
        },
      }
    );

    table.grantReadWriteData(this.function);
  }
}
