import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

require("dotenv").config();

export class CommonStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // // S3： バケット作成
    // const bucket = new s3.Bucket(this, "uneikunBucket", {
    //   bucketName: "uneikun-s3",
    // });

    // // CloudFront: ディストリビューションの作成
    // // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html
    // new cloudfront.Distribution(this, "uneikunDistribution", {
    //   comment: `target s3 "${bucket.bucketName}"`,
    //   defaultBehavior: { origin: new origins.S3Origin(bucket) },
    // });

    // Cognito
    // https://qiita.com/takmot/items/fb00c56404d7df76ab00
    const userPool = new cognito.UserPool(this, "uneikunUserPool", {
      userPoolName: "uneikun-userPool",
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
      "uneikunUserPoolClient",
      {
        userPoolClientName: "uneikun-userPoolClient",
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

    userPool.addDomain("uneikunUserPoolDomain", {
      cognitoDomain: {
        domainPrefix: "uneikun-userpool-domain",
      },
    });

    const adminGroup = new cognito.CfnUserPoolGroup(this, "adminGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "admin-group",
    });
  }
}
