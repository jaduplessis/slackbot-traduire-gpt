#!/usr/bin/env node
import { getStage } from "@slackbot/helpers/cdk";
import { App } from "aws-cdk-lib";
import "dotenv/config";

import { quipperStack } from "../lib/stack";

const app = new App();

const stage = getStage();

new quipperStack(app, `${stage}-quipper`);
