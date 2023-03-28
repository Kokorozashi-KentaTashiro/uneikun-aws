import * as AWS from "aws-sdk";
import console = require("console");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
import {
  TABLE_NAME,
  GSI_SORTKEY_PARTITIONKEY,
  GSI_SORTKEY,
  TEAMINFO_PREFIX,
} from "../common/constants";
import {
  TeamDetailInfo,
  DirecterInfo,
  SinglesApplicationInfo,
  ApplicantGroupInfo,
} from "./type";

export const getSinglesApplications = async (body: any) => {
  console.log("getSinglesApplications.ts/開始");
  const { tournamentTitle, team, teamSex } = body;

  const applicantGroupsInfo: ApplicantGroupInfo[] = [];

  // チーム詳細情報の取得
  const teamDetailsResult: any = await getTeamDetailsResult(
    tournamentTitle,
    team,
    teamSex
  );

  console.log(teamDetailsResult.Items);

  for (const teamDetail of teamDetailsResult.Items) {
    // チーム情報の編集
    let teamDetailInfo: TeamDetailInfo = {
      team: teamDetail.team,
      teamZone: teamDetail.teamZone,
      teamRank: teamDetail.teamRank,
      teamSex: teamDetail.teamSex,
      teamAddress: teamDetail.teamAddress,
      teamPhone: teamDetail.teamPhone,
      teamFax: teamDetail.teamFax,
      teamManager: teamDetail.teamManager,
    };

    // 監督情報の編集
    let directerInfo: DirecterInfo = {
      directerName: teamDetail.directerName,
      directerPhone: teamDetail.directerPhone,
      directerEmail: teamDetail.directerEmail,
      advisorName: teamDetail.advisorName,
    };

    // 参加者情報の取得
    let singlesApplicationsResult: any = await getSinglesApplicationsResult(
      teamDetail
    );

    // 参加者情報の編集
    let singlesApplicationsInfo: SinglesApplicationInfo[] =
      singlesApplicationsResult.Items.map((singlesApplicationInfo: any) => {
        return {
          lastName: singlesApplicationInfo.lastName,
          firstName: singlesApplicationInfo.firstName,
          birthDay: singlesApplicationInfo.birthDay,
          schoolYear: singlesApplicationInfo.schoolYear,
        };
      });

    applicantGroupsInfo.push({
      teamDetailInfo: teamDetailInfo,
      directerInfo: directerInfo,
      singlesApplicationsInfo: singlesApplicationsInfo,
    });
  }

  console.log("getSinglesApplications.ts/終了");
  return applicantGroupsInfo;
};

// チーム詳細情報の取得
const getTeamDetailsResult = async (
  tournamentTitle: string,
  team: number,
  teamSex: number
) => {
  return await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        IndexName: GSI_SORTKEY_PARTITIONKEY,
        ExpressionAttributeNames: {
          "#s": "sortKey",
          "#p": "partitionKey",
        },
        ExpressionAttributeValues: {
          ":s": `${TEAMINFO_PREFIX}${tournamentTitle}`,
          ":p": `${teamSex}${team}`,
        },
        KeyConditionExpression: "#s = :s and begins_with(#p, :p)",
      },
      (err) => {
        if (err) {
          console.log("getSinglesApplications.ts/チーム詳細情報の取得エラー");
        } else {
          console.log("getSinglesApplications.ts/チーム詳細情報の取得完了");
        }
      }
    )
    .promise();
};

// 参加者情報の取得
const getSinglesApplicationsResult = async (teamDetail: any) => {
  return await dynamodb
    .query(
      {
        TableName: TABLE_NAME,
        IndexName: GSI_SORTKEY,
        ExpressionAttributeNames: {
          "#s": "sortKey",
        },
        ExpressionAttributeValues: {
          ":s": teamDetail.partitionKey,
        },
        KeyConditionExpression: "#s = :s",
        ProjectionExpression: "lastName, firstName, birthDay, schoolYear",
      },
      (err) => {
        if (err) {
          console.log("getSinglesApplications.ts/参加者情報の取得エラー");
        } else {
          console.log("getSinglesApplications.ts/参加者情報の取得完了");
        }
      }
    )
    .promise();
};
