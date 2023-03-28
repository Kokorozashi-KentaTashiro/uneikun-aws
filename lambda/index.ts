import console = require("console");
import { APIGatewayEvent } from "aws-lambda";
import {
  USERINFO_RESOURCE,
  TOURNAMENT_RESOURCE,
  TOURNAMENTS_RESOURCE,
  TEAMS_RESOURCE,
  SINGLES_HISTORY_RESOURCE,
  TEAM_HISTORY_RESOURCE,
  TOURNAMENTS_HISTORY_RESOURCE,
  SINGLES_APPLICATIONS_RESOURCE,
  TEAM_APPLICATIONS_RESOURCE,
  EVENET_HTTP_POST,
} from "./common/constants";
import { getUserInfo } from "./userInfo/getUserInfo";
import { putTournament } from "./tournament/putTournament";
import { getTournaments } from "./tournaments/getTournaments";
import { putUserInfo } from "./userInfo/putUserInfo";
import { getApplications } from "./applications/getApplications";
import { putSinglesApplications } from "./singlesApplications/putSinglesApplications";
import { putTeamApplications } from "./teamApplications/putTeamApplications";
import { getTeams } from "./teams/getTeams";
import { getSinglesApplications } from "./singlesApplications/getSinglesApplications";
import { getTeamApplications } from "./teamApplications/getTeamApplications";
import { getTournamentsHistory } from "./tournamentsHistory/getTournamentsHistory";
import { getSinglesHistory } from "./singlesHistory/getSinglesHistory";
import { getTeamHistory } from "./teamHistory/getTeamHistory";

// https://abillyz.com/vclbuff/studies/352
// npm run buildで「./build/*」以外をビルドするように設定
export const handler = async (event: APIGatewayEvent) => {
  console.log(`index.ts${event.resource}/${event.httpMethod}開始`);
  // requestBodyの取得
  let reqBody;
  if (event.body) {
    reqBody = JSON.parse(event.body);
  }

  // return用の変数宣言
  let statusCode = 200;
  let headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };
  let response;

  // apiGateWayのresource名を取得
  let resource = event.resource;
  let httpMethod = event.httpMethod;

  // 実処理
  switch (resource) {
    case `/${USERINFO_RESOURCE}`:
      if (httpMethod === EVENET_HTTP_POST) {
        response = await getUserInfo(reqBody);
      } else {
        response = await putUserInfo(reqBody);
      }
      break;

    case `/${TOURNAMENT_RESOURCE}`:
      response = await putTournament(reqBody);
      break;

    case `/${TOURNAMENTS_RESOURCE}`:
      response = await getTournaments();
      break;

    case `/${SINGLES_APPLICATIONS_RESOURCE}`:
      if (httpMethod === EVENET_HTTP_POST) {
        response = await getSinglesApplications(reqBody);
      } else {
        response = await putSinglesApplications(reqBody);
      }
      break;

    case `/${TEAM_APPLICATIONS_RESOURCE}`:
      if (httpMethod === EVENET_HTTP_POST) {
        response = await getTeamApplications(reqBody);
      } else {
        response = await putTeamApplications(reqBody);
      }
      break;

    case `/${TEAMS_RESOURCE}`:
      response = await getTeams(reqBody);
      break;

    case `/${SINGLES_HISTORY_RESOURCE}`:
      response = await getSinglesHistory(reqBody);
      break;

    case `/${TEAM_HISTORY_RESOURCE}`:
      response = await getTeamHistory(reqBody);
      break;

    case `/${TOURNAMENTS_HISTORY_RESOURCE}`:
      response = await getTournamentsHistory(reqBody);
      break;

    default:
      throw "not found evenet resource;";
  }

  console.log(`index.ts${event.resource}/${event.httpMethod}終了`);
  // return
  return {
    statusCode,
    headers,
    body: JSON.stringify(response),
  };
};
