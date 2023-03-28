import * as AWS from "aws-sdk";
import console = require("console");
const dynamodb = new AWS.DynamoDB.DocumentClient();
import {
  TABLE_NAME,
  TOURNAMENT_SORTKEY,
  USERINFO_SORTKEY,
} from "../common/constants";

export const putUserInfo = async (body: any) => {
  // DynamoDBレコード作成
  console.log("【putUserInfo/start】");
  const result = await dynamodb
    .put(
      {
        TableName: TABLE_NAME,
        Item: {
          partitionKey: body.userId,
          sortKey: USERINFO_SORTKEY,
          lastName: body.lastName,
          firstName: body.firstName,
          phone: body.phone,
        },
      },
      (err, res) => {
        if (err) {
          console.log(`【putUserInfo/error】${err}`);
        } else {
          console.log(`【putUserInfo/success】${res}`);
        }
      }
    )
    .promise();

  return result;
};
