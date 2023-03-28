import console = require("console");
import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
import {
  TABLE_NAME,
  GSI_SORTKEY_EVENTDATE,
  TOURNAMENT_SORTKEY,
} from "../common/constants";

export const getTournaments = async () => {
  // DynamoDBレコード検索
  // https://qiita.com/sayama0402/items/fc7ce074f1f1747b1bef
  console.log("getTournaments.ts/開始");
  const queryResults: any = await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        IndexName: GSI_SORTKEY_EVENTDATE,
        ExpressionAttributeNames: {
          "#sk": "sortKey",
        },
        ExpressionAttributeValues: {
          ":sk": TOURNAMENT_SORTKEY,
        },
        KeyConditionExpression: "#sk = :sk",
      },
      (err, res) => {
        if (err) {
          console.log("getTournaments.ts/大会一覧取得エラー");
        } else {
          console.log("getTournaments.ts/大会一覧取得完了");
        }
      }
    )
    .promise();

  const result = queryResults.Items.map((queryResult: any) => {
    return {
      tournamentTitle: queryResult.partitionKey,
      tournamentClass: queryResult.tournamentClass,
      eventDate: queryResult.eventDate,
      place: queryResult.place,
      applicationStartDate: queryResult.applicationStartDate,
      applicationEndDate: queryResult.applicationEndDate,
      detailPdfUrl: queryResult.detailPdfUrl,
    };
  });

  console.log("getTournaments.ts/終了");
  return result;
};
