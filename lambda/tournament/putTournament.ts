import console = require("console");
import * as AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();
import { TABLE_NAME, TOURNAMENT_SORTKEY } from "../common/constants";

export const putTournament = async (body: any) => {
  // DynamoDBレコード作成
  console.log("【putTournament/start】");
  const result = await dynamodb
    .put(
      {
        TableName: TABLE_NAME,
        Item: {
          partitionKey: body.tournamentTitle,
          sortKey: TOURNAMENT_SORTKEY,
          tournamentClass: body.tournamentClass,
          eventDate: body.eventDate,
          place: body.place,
          applicationStartDate: body.applicationStartDate,
          applicationEndDate: body.applicationEndDate,
          detailPdfUrl: body.detailPdfUrl,
        },
      },
      (err, res) => {
        if (err) {
          console.log(`【putTournament/error】${err}`);
        } else {
          console.log(`【putTournament/success】${res}`);
        }
      }
    )
    .promise();

  return result;
};
