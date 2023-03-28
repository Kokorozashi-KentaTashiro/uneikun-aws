/** チーム情報 */
export type TeamDetailInfo = {
  team: number;
  teamZone: number;
  teamRank: number;
  teamSex: number;
  teamAddress: string;
  teamPhone: string;
  teamFax: string;
  teamManager: string;
};

/** 監督情報 */
export type DirecterInfo = {
  directerName: string;
  directerPhone: string;
  directerEmail: string;
  advisorName: string;
};

/** シングルス応募情報 */
export type SinglesApplicationInfo = {
  lastName: string;
  firstName: string;
  schoolYear: number;
  birthDay: string;
};

/** 参加者情報グループ */
export type ApplicantGroupInfo = {
  teamDetailInfo: TeamDetailInfo;
  directerInfo: DirecterInfo;
  singlesApplicationsInfo: SinglesApplicationInfo[];
};
