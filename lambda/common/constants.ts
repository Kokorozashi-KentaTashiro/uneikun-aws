// DynamoDB関係の定数
export const TABLE_REGION = "ap-northeast-1";
export const TABLE_NAME = "tashiro-cdk-table";
export const GSI_SORTKEY = "gsi_sortKey";
export const GSI_SORTKEY_PARTITIONKEY = "gsi_sortKey_partitionKey";
export const GSI_SORTKEY_EVENTDATE = "gsi_sortKey_eventDate";
export const GSI_SORTKEY_ORDER = "gsi_sortKey_order";
export const GSI_APPLICANTMANAGER = "gsi_applicantManager";
export const GSI_SORTKEY_APPLICANTMANAGER = "gsi_sortKey_applicantManager";

// Lambda関係の定数
export const EVENET_HTTP_GET = "GET";
export const EVENET_HTTP_POST = "POST";
export const EVENET_HTTP_PUT = "PUT";
export const USERINFO_RESOURCE = "userInfo";
export const TOURNAMENT_RESOURCE = "tournament";
export const TOURNAMENTS_RESOURCE = "tournaments";

// 参加者情報（管理者）
export const SINGLES_APPLICATIONS_RESOURCE = "singlesApplications";
export const TEAM_APPLICATIONS_RESOURCE = "teamApplications";
export const TEAMS_RESOURCE = "teams";
// 応募履歴
export const SINGLES_HISTORY_RESOURCE = "singlesHistory";
export const TEAM_HISTORY_RESOURCE = "teamHistory";
export const TOURNAMENTS_HISTORY_RESOURCE = "tournamentsHistory";

export const TOURNAMENT_SORTKEY = "tournament";
export const USERINFO_SORTKEY = "userInfo";
export const TEAMINFO_PREFIX = "t#";
