import console = require("console");
import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
import { TABLE_NAME, GSI_SORTKEY, TEAMINFO_PREFIX } from "../common/constants";
import { numberToCloudFormation } from "aws-cdk-lib";

export const getTeams = async (body: any) => {
  const { tournamentTitle } = body;
  // DynamoDBレコード検索
  // https://qiita.com/sayama0402/items/fc7ce074f1f1747b1bef
  console.log("getTeams.ts/開始");
  const queryResults: any = await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        IndexName: GSI_SORTKEY,
        ExpressionAttributeNames: {
          "#sk": "sortKey",
        },
        ExpressionAttributeValues: {
          ":sk": `${TEAMINFO_PREFIX}${tournamentTitle}`,
        },
        KeyConditionExpression: "#sk = :sk",
        ProjectionExpression: "team, teamSex",
      },
      (err, res) => {
        if (err) {
          console.log("getTeams.ts/チーム詳細取得エラー");
        } else {
          console.log("getTeams.ts/チーム詳細取得完了");
        }
      }
    )
    .promise();

  const results = queryResults.Items.map((queryResult: any) => {
    return {
      key: `${queryResult.team}${queryResult.teamSex}`,
      team: queryResult.team,
      teamSex: queryResult.teamSex,
    };
  });
  const duplicateDeleteResults = Array.from(
    new Map(
      results.map((result: { key: string; team: number; teamSex: number }) => [
        result.key,
        result,
      ])
    ).values()
  );

  const returnResults = duplicateDeleteResults.map(
    (duplicateDeleteResult: any) => {
      return {
        team: duplicateDeleteResult.team,
        teamSex: duplicateDeleteResult.teamSex,
      };
    }
  );

  console.log("getTeams.ts/終了");
  return returnResults;
};
