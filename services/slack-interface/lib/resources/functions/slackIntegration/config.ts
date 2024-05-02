import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

import { SlackCustomResource } from "@slackbot/cdk-constructs";
import {
  buildResourceName,
  getCdkHandlerPath,
  getEnvVariable,
} from "@slackbot/helpers";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";

interface slackIntegrationProps {
  eventBus: EventBus;
  workspaceTable: Table;
}

export class SlackIntegration extends Construct {
  public function: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { eventBus, workspaceTable }: slackIntegrationProps
  ) {
    super(scope, id);

    const SLACK_SIGNING_SECRET = getEnvVariable("SLACK_SIGNING_SECRET");

    this.function = new SlackCustomResource(
      this,
      buildResourceName("traduire-slack-integration"),
      {
        lambdaEntry: getCdkHandlerPath(__dirname),
        environment: {
          SLACK_SIGNING_SECRET,
          EVENT_BUS: eventBus.eventBusName,
        },
      }
    );

    eventBus.grantPutEventsTo(this.function);
    workspaceTable.grantReadData(this.function);
  }
}
