import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";

import * as path from "path";
import {
  GSI_SORTKEY,
  GSI_SORTKEY_PARTITIONKEY,
  GSI_SORTKEY_EVENTDATE,
  GSI_SORTKEY_ORDER,
  GSI_APPLICANTMANAGER,
  GSI_SORTKEY_APPLICANTMANAGER,
  EVENET_HTTP_GET,
  EVENET_HTTP_POST,
  EVENET_HTTP_PUT,
  USERINFO_RESOURCE,
  TOURNAMENT_RESOURCE,
  TOURNAMENTS_RESOURCE,
  SINGLES_APPLICATIONS_RESOURCE,
  TEAM_APPLICATIONS_RESOURCE,
  TEAMS_RESOURCE,
  SINGLES_HISTORY_RESOURCE,
  TEAM_HISTORY_RESOURCE,
  TOURNAMENTS_HISTORY_RESOURCE,
} from "../lambda/common/constants";

require("dotenv").config();

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3： バケット作成
    const bucket = new s3.Bucket(this, "tashiroCdkBucket", {
      bucketName: "tashiro-cdk-s3",
    });

    // CloudFront: ディストリビューションの作成
    // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html
    new cloudfront.Distribution(this, "tashiroCdkDistribution", {
      comment: `target s3 "${bucket.bucketName}"`,
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });

    // Cognito
    // https://qiita.com/takmot/items/fb00c56404d7df76ab00
    const userPool = new cognito.UserPool(this, "tashiroCdkUserPool", {
      userPoolName: "tashiro-cdk-userPool",
      // ログインに使用する項目を指定
      signInAliases: {
        email: true,
        phone: true,
      },
      selfSignUpEnabled: true,
      userVerification: {
        smsMessage: "The verification code to your new account is {####}",
        // emailSubject: "【千葉卓球連盟】ユーザー認証",
        // emailBody:
        //   "このたびは千葉県卓球連盟アプリにご登録いただきありがとうございます。\r\nこのメールの認証コードをブラウザ画面に入力して会員登録を完了してください。\r\n認証コード： {####}",
        // emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        phone: true,
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "tashiroCdkUserPoolClient",
      {
        userPoolClientName: "tashiro-cdk-userPoolClient",
        userPool: userPool,
        authFlows: {
          custom: true,
          userSrp: true,
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
        oAuth: {
          callbackUrls: [`${process.env.REACT_APP_COGNITO_CALLBACK_URL}`],
          logoutUrls: [`${process.env.REACT_APP_COGNITO_SIGNOUT_URL}`],
        },
      }
    );

    userPool.addDomain("tashiroCdkUserPoolDomain", {
      cognitoDomain: {
        domainPrefix: "tashiro-cdk-userpool-domain",
      },
    });

    const adminGroup = new cognito.CfnUserPoolGroup(this, "adminGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "admin-group",
    });

    // DynamoDB: テーブル作成
    const table = new dynamodb.Table(this, "tashiroCdkTable", {
      tableName: "tashiro-cdk-table",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: {
        name: "partitionKey",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "sortKey",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // DynamoDB: インデックス作成
    // https://itotetsu.hatenablog.com/entry/amazon-dynamodb-via-aws-cdk
    table.addGlobalSecondaryIndex({
      indexName: GSI_SORTKEY,
      partitionKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
    });
    table.addGlobalSecondaryIndex({
      indexName: GSI_SORTKEY_PARTITIONKEY,
      partitionKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "partitionKey", type: dynamodb.AttributeType.STRING },
    });
    table.addGlobalSecondaryIndex({
      indexName: GSI_SORTKEY_EVENTDATE,
      partitionKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "eventDate", type: dynamodb.AttributeType.STRING },
    });
    table.addGlobalSecondaryIndex({
      indexName: GSI_SORTKEY_ORDER,
      partitionKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "order", type: dynamodb.AttributeType.NUMBER },
    });
    table.addGlobalSecondaryIndex({
      indexName: GSI_APPLICANTMANAGER,
      partitionKey: {
        name: "applicantManager",
        type: dynamodb.AttributeType.STRING,
      },
    });
    table.addGlobalSecondaryIndex({
      indexName: GSI_SORTKEY_APPLICANTMANAGER,
      partitionKey: { name: "sortKey", type: dynamodb.AttributeType.STRING },
      sortKey: {
        name: "applicantManager",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Lambda実行用のIAMロールを作成（CloudWatch, DynamoDB, SES）
    // https://qiita.com/yamato1491038/items/6a3eb65688389a5d6e31
    const lambdaRole = new iam.Role(this, "tashiroCdkLamdbaRole", {
      roleName: "tashiro-cdk-lamdba-role",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "AWSLambdaBasicExecutionRole",
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
      )
    );
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "AmazonSESFullAccess",
        "arn:aws:iam::aws:policy/AmazonSESFullAccess"
      )
    );
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        "AmazonCognitoReadOnly",
        "arn:aws:iam::aws:policy/AmazonCognitoReadOnly"
      )
    );

    const snsInlinePolicy = new iam.Policy(this, "tashiroCdkSnsInlinePolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "sns:CreateSMSSandboxPhoneNumber",
            "SNS:VerifySMSSandboxPhoneNumber",
          ],
          resources: [
            `arn:aws:sns:${process.env.REACT_APP_ENV_CDK_REGION}:${process.env.REACT_APP_ENV_CDK_ACCOUNT}:*`,
          ],
        }),
      ],
    });

    lambdaRole.attachInlinePolicy(snsInlinePolicy);

    // Lambda： Layer作成
    // https://dev.classmethod.jp/articles/aws-cdk-node-modules-lambda-layer/
    const lambdaLayer = new lambda.LayerVersion(this, "tashiroCdkLambdaLayer", {
      layerVersionName: "tashiro-cdk-lambdaLayer",
      code: lambda.AssetCode.fromAsset("./lambdaLayer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    });

    // Lambda: 関数作成
    // https://aws.amazon.com/jp/blogs/news/lambda-managed-by-cdk/
    const lambdaFunction = new lambda.Function(
      this,
      "tashiroCdkLambdaFunction",
      {
        functionName: "tashiro-cdk-lambdaFunction",
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "tashiro-cdk-lambdaFunction/index.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "../lambda/build")),
        layers: [lambdaLayer],
        environment: {
          TABLE_NAME: "tashiro-cdk-table",
          PRIMARY_KEY: "partitionKey",
        },
        role: lambdaRole,
      }
    );

    // Lambda: dynamoDBアクセス権限付与
    // https://dev.classmethod.jp/articles/aws-cdk-101-typescript/
    table.grantFullAccess(lambdaFunction);

    // ApiGateway: REST API作成
    // https://dev.classmethod.jp/articles/cors-on-rest-api-of-api-gateway/
    const restApi = new apigateway.RestApi(this, "tashiroCdkRestApi", {
      restApiName: "tashiro-cdk-restApi",
      deployOptions: {
        stageName: process.env.REACT_APP_STAGE_NAME,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
    });

    // ApiGateway: リソース作成
    const userInfoResource = restApi.root.addResource(USERINFO_RESOURCE);
    const tournamentResource = restApi.root.addResource(TOURNAMENT_RESOURCE);
    const tournamentsResource = restApi.root.addResource(TOURNAMENTS_RESOURCE);
    const singlesApplicationsResource = restApi.root.addResource(
      SINGLES_APPLICATIONS_RESOURCE
    );
    const teamApplicationsResource = restApi.root.addResource(
      TEAM_APPLICATIONS_RESOURCE
    );
    const teamsResource = restApi.root.addResource(TEAMS_RESOURCE);
    const singlesHistoryResource = restApi.root.addResource(
      SINGLES_HISTORY_RESOURCE
    );
    const teamHistoryResource = restApi.root.addResource(TEAM_HISTORY_RESOURCE);
    const tournamentsHistoryResource = restApi.root.addResource(
      TOURNAMENTS_HISTORY_RESOURCE
    );

    // ApiGateway: メソッド作成
    userInfoResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    userInfoResource.addMethod(
      EVENET_HTTP_PUT,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    tournamentResource.addMethod(
      EVENET_HTTP_PUT,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    tournamentsResource.addMethod(
      EVENET_HTTP_GET,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    singlesApplicationsResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    singlesApplicationsResource.addMethod(
      EVENET_HTTP_PUT,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    teamApplicationsResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    teamApplicationsResource.addMethod(
      EVENET_HTTP_PUT,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    teamsResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    singlesHistoryResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    teamHistoryResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
    tournamentsHistoryResource.addMethod(
      EVENET_HTTP_POST,
      new apigateway.LambdaIntegration(lambdaFunction)
    );
  }
}
