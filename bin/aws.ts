#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsStack } from "../lib/aws-stack";
import { BackEndStack } from "../lib/backEndStack";
import { CommonStack } from "../lib/common-stack";

require("dotenv").config();

const app = new cdk.App();
const env = {
  account:
    process.env.REACT_APP_ENV_CDK_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region:
    process.env.REACT_APP_ENV_CDK_REGION || process.env.CDK_DEFAULT_REGION,
};
new AwsStack(app, "tashiroCdkStack", { env });

new BackEndStack(app, "uneikunBackStack", { env });

new CommonStack(app, "uneikunCommonStack", { env });
