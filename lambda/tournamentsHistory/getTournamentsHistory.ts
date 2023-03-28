import console = require("console");
import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
import {
  TABLE_NAME,
  GSI_APPLICANTMANAGER,
  TEAMINFO_PREFIX,
} from "../common/constants";

export const getTournamentsHistory = async (body: any) => {
  const { userId } = body;
  // DynamoDBレコード検索
  // https://qiita.com/sayama0402/items/fc7ce074f1f1747b1bef
  console.log("getTournamentsHistory.ts/開始");

  let tournamentsInfo = [];

  const queryResults: any = await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        IndexName: GSI_APPLICANTMANAGER,
        ExpressionAttributeNames: {
          "#am": "applicantManager",
          "#sk": "sortKey",
        },
        ExpressionAttributeValues: {
          ":am": userId,
        },
        KeyConditionExpression: "#am = :am",
        ProjectionExpression: "#sk",
      },
      (err, res) => {
        if (err) {
          console.log("getTournamentsHistory.ts/チーム詳細情報取得エラー");
        } else {
          console.log("getTournamentsHistory.ts/チーム詳細情報取得完了");
        }
      }
    )
    .promise();

  for (const teamDetail of queryResults.Items) {
    // 大会情報の取得
    let tournamentInfoResult: any = await getTournamentResult(teamDetail);
    let tournamentInfo: any = {
      tournamentName: tournamentInfoResult.Items[0].partitionKey,
      tournamentClass: tournamentInfoResult.Items[0].tournamentClass,
    };
    tournamentsInfo.push(tournamentInfo);
  }

  // 重複を削除
  const returnTournamentsInfo = Array.from(
    new Map(
      tournamentsInfo.map(
        (tournamentInfo: {
          tournamentName: string;
          tournamentClass: number;
        }) => [tournamentInfo.tournamentName, tournamentInfo]
      )
    ).values()
  );

  console.log("getTournamentsHistory.ts/終了");
  return returnTournamentsInfo;
};

// 参加者情報の取得
const getTournamentResult = async (teamDetail: any) => {
  return await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        ExpressionAttributeNames: {
          "#pk": "partitionKey",
          "#tc": "tournamentClass",
        },
        ExpressionAttributeValues: {
          ":pk": teamDetail.sortKey.slice(2),
        },
        KeyConditionExpression: "#pk = :pk",
        ProjectionExpression: "#pk, #tc",
      },
      (err) => {
        if (err) {
          console.log("getTournamentsHistory.ts/大会情報の取得エラー");
        } else {
          console.log("getTournamentsHistory.ts/大会情報の取得完了");
        }
      }
    )
    .promise();
};
