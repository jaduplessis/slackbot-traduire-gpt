#!/usr/bin/env node
import { getStage } from "@slackbot/helpers/cdk";
import { App } from "aws-cdk-lib";
import "dotenv/config";

import { SlackInterfaceStack } from "../lib/stack";

const app = new App();

const stage = getStage();

new SlackInterfaceStack(app, `${stage}-traduire-slack-interface`);
