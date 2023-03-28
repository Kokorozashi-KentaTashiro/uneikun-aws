# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## aws CLI の環境構築

https://aws.amazon.com/jp/getting-started/guides/setup-environment/

## CDK チュートリアル

https://aws.amazon.com/jp/getting-started/guides/setup-cdk/

## 環境変数を env に切り出す方法

https://maku77.github.io/nodejs/env/dotenv.html

## lambda のバックエンド用資材を作成する方法

cd ./lambda  
　 npm run build  
　./lambda/build/index.js を lambda にアップロード

## lambda のバックエンド用 layer 資材を作成する方法

cd ./lambda  
　 npm install --production  
　./lambda/node_modules⇒./lambdaLayer/nodejs/  
　 ↑ の通りコピー  
 cdk にて lambda.LayerVersion の fromAsset に./lambdaLayer を設定

## prettier の導入

https://ralacode.com/blog/post/vscode-prettier/
