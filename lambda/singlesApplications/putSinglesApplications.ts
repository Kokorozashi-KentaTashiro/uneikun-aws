import * as AWS from "aws-sdk";
import console = require("console");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
import { TABLE_NAME, TEAMINFO_PREFIX } from "../common/constants";
import { changeTodayToStr } from "../common/utility";

export const putSinglesApplications = async (body: any) => {
  const todayStr = changeTodayToStr(
    new Date(Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000)
  );
  console.log("【putSinglesApplications/start】");
  const {
    tournamentTitle,
    teamInfo,
    directerInfo,
    singlesApplicationsInfo,
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
          console.log(`【putSinglesApplications(team)/error】${err}`);
        } else {
          console.log(`【putSinglesApplications(team)/success】${res}`);
        }
      }
    )
    .promise();

  // 参加者情報の登録
  singlesApplicationsInfo.forEach(async (singlesApplicationInfo: any) => {
    await dynamodb
      .put(
        {
          TableName: TABLE_NAME,
          Item: {
            // 検索情報
            partitionKey: `${singlesApplicationInfo.lastName}${singlesApplicationInfo.firstName}${singlesApplicationInfo.birthDay}`,
            sortKey: `${teamInfo.teamSex}${teamInfo.team}${todayStr}`,
            // 参加者情報
            lastName: singlesApplicationInfo.lastName,
            firstName: singlesApplicationInfo.firstName,
            birthDay: singlesApplicationInfo.birthDay,
            schoolYear: singlesApplicationInfo.schoolYear,
            // 作成日
            createdAt: todayStr,
          },
        },
        (err, res) => {
          if (err) {
            console.log(`【putSinglesApplications(applicant)/error】${err}`);
          } else {
            console.log(`【putSinglesApplications(applicant)/success】${res}`);
          }
        }
      )
      .promise();
  });

  return { result: "ok" };
};
