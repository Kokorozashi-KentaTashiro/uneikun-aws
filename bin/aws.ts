#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsStack } from "../lib/aws-stack";

require("dotenv").config();

const app = new cdk.App();
new AwsStack(app, "tashiroCdkStack", {
  env: {
    account:
      process.env.REACT_APP_ENV_CDK_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region:
      process.env.REACT_APP_ENV_CDK_REGION || process.env.CDK_DEFAULT_REGION,
  },
});
