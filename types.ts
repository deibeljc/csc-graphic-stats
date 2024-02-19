export interface GqlResponse {
  data: Data;
}

export interface Data {
  findManyPlayerMatchStats: FindManyPlayerMatchStat[];
}

export interface FindManyPlayerMatchStat {
  name: string;
  teamClanName: string;
  rating: number;
  rounds: number;
  TRounds: number;
  ctRounds: number;
  TRating: number;
  ctRating: number;
  adr: number;
  ctADR: number;
  TADR: number;
  kills: number;
  TKills: number;
  ctKills: number;
  deaths: number;
  TDeaths: number;
  ctDeaths: number;
  match?: Match;
  matchDays: string[]; // Add matchDays property
}

export interface Match {
  id: string;
  matchDay: string; // Will be like M01, M02, M03, etc.
  tier: string;
}
export interface PlayerStatAccumulator {
  [key: string]: FindManyPlayerMatchStat & { matchCount: number };
}

export interface TierGroup {
  [tier: string]: (FindManyPlayerMatchStat & { matchCount?: number })[];
}
