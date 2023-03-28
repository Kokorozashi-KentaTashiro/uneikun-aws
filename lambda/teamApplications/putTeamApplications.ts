import * as AWS from "aws-sdk";
import console = require("console");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
import { TABLE_NAME, TEAMINFO_PREFIX } from "../common/constants";
import { changeTodayToStr } from "../common/utility";

export const putTeamApplications = async (body: any) => {
  console.log("【putTeamApplications/start】");
  const todayStr = changeTodayToStr(
    new Date(Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000)
  );

  const {
    tournamentTitle,
    teamInfo,
    directerInfo,
    teamApplicationsInfo,
    userId,
  } = body;

  // チーム情報の登録
  await dynamodb
    .put(
      {
        TableName: TABLE_NAME,
        Item: {
          // 検索情報
          partitionKey: `${teamInfo.teamSex}${teamInfo.team}${todayStr}`,
          sortKey: `${TEAMINFO_PREFIX}${tournamentTitle}`,
          // チーム情報
          team: teamInfo.team,
          teamZone: teamInfo.teamZone,
          teamRank: teamInfo.teamRank,
          teamSex: teamInfo.teamSex,
          teamAddress: teamInfo.teamAddress,
          teamPhone: teamInfo.teamPhone,
          teamFax: teamInfo.teamFax,
          teamManager: teamInfo.teamManager,
          // 監督情報
          directerName: directerInfo.directerName,
          directerPhone: directerInfo.directerPhone,
          directerEmail: directerInfo.directerEmail,
          advisorName: directerInfo.advisorName,
          // 登録したユーザー
          applicantManager: userId,
          // 作成日
          createdAt: todayStr,
        },
      },
      (err, res) => {
        if (err) {
          console.log(`【putTeamApplications(team)/error】${err}`);
        } else {
          console.log(`【putTeamApplications(team)/success】${res}`);
        }
      }
    )
    .promise();

  // 参加者情報
  teamApplicationsInfo.forEach(
    async (teamApplicationInfo: any, index: number) => {
      await dynamodb
        .put(
          {
            TableName: TABLE_NAME,
            Item: {
              // 検索情報
              partitionKey: `${teamApplicationInfo.lastName}${teamApplicationInfo.firstName}${teamApplicationInfo.birthDay}`,
              sortKey: `${teamInfo.teamSex}${teamInfo.team}${todayStr}`,
              // 参加者情報
              lastName: teamApplicationInfo.lastName,
              firstName: teamApplicationInfo.firstName,
              birthDay: teamApplicationInfo.birthDay,
              schoolYear: teamApplicationInfo.schoolYear,
              captain: teamApplicationInfo.captain,
              order: index + 1,
              // 作成日
              createdAt: todayStr,
            },
          },
          (err, res) => {
            if (err) {
              console.log(`【putTeamApplications(Applicant)/error】${err}`);
            } else {
              console.log(`【putTeamApplications(Applicant)/success】${res}`);
            }
          }
        )
        .promise();
    }
  );

  return { result: "ok" };
};
