import { GqlResponse, PlayerStatAccumulator, TierGroup } from "./types";

// Define the GraphQL query with variables
const QUERY = `
  query FindPlayerStats($matchDays: [String!], $season: Int!) {
    findManyPlayerMatchStats(where: {match: {season: {equals: $season}, matchDay: {in: $matchDays}}, side: { equals: 4 }}) {
      name
      teamClanName
      rating
      TRounds
      ctRounds
      rounds
      TRating
      ctRating
      adr
      ctADR
      TADR
      kills
      TKills
      ctKills
      deaths
      TDeaths
      ctDeaths
      match {
        id
        matchDay
        tier
      }
    }
  }
`;
// Modified function to fetch data and calculate averages
async function fetchPlayerMatchStats(
  season: number,
  matchDays: string[],
  topX: number
) {
  const response = await fetch("https://stats.csconfederation.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: QUERY,
      variables: { season, matchDays },
    }),
  });

  const { data }: GqlResponse = await response.json();

  // Combine and merge player stats across match days, then average them
  const playerStats: PlayerStatAccumulator =
    data.findManyPlayerMatchStats.reduce((acc: PlayerStatAccumulator, stat) => {
      const key = `${stat.name}-${stat.match?.tier}`;
      if (!acc[key]) {
        acc[key] = {
          ...stat,
          rating: stat.rating * stat.rounds,
          TRating: stat.TRating * stat.TRounds,
          ctRating: stat.ctRating * stat.ctRounds,
          adr: stat.adr * stat.rounds,
          ctADR: stat.ctADR * stat.ctRounds,
          TADR: stat.TADR * stat.TRounds,
          kills: stat.kills * stat.rounds,
          TKills: stat.TKills * stat.TRounds,
          ctKills: stat.ctKills * stat.ctRounds,
          deaths: stat.deaths * stat.rounds,
          TDeaths: stat.TDeaths * stat.TRounds,
          ctDeaths: stat.ctDeaths * stat.ctRounds,
          matchCount: 1,
          matchDays: [stat.match?.matchDay ?? "Unkown"].filter(Boolean), // Initialize matchDays with the current matchDay
        };
      } else {
        acc[key].rating += stat.rating * stat.rounds;
        acc[key].TRating += stat.TRating * stat.TRounds;
        acc[key].ctRating += stat.ctRating * stat.ctRounds;
        acc[key].rounds += stat.rounds;
        acc[key].TRounds += stat.TRounds;
        acc[key].ctRounds += stat.ctRounds;
        acc[key].matchCount += 1;
        acc[key].adr += stat.adr * stat.rounds;
        acc[key].ctADR += stat.ctADR * stat.ctRounds;
        acc[key].TADR += stat.TADR * stat.TRounds;
        acc[key].kills += stat.kills * stat.rounds;
        acc[key].TKills += stat.TKills * stat.TRounds;
        acc[key].ctKills += stat.ctKills * stat.ctRounds;
        acc[key].deaths += stat.deaths * stat.rounds;
        acc[key].TDeaths += stat.TDeaths * stat.TRounds;
        acc[key].ctDeaths += stat.ctDeaths * stat.ctRounds;
        if (
          stat.match?.matchDay &&
          !acc[key].matchDays.includes(stat.match.matchDay)
        ) {
          acc[key].matchDays.push(stat.match.matchDay); // Add unique matchDay to matchDays array
        }
      }
      return acc;
    }, {});

  // Average the stats and prepare for sorting
  const averagedStats = Object.values(playerStats)
    .map((stat) => ({
      ...stat,
      rating: stat.rating / stat.rounds,
      TRating: stat.TRating / stat.TRounds,
      ctRating: stat.ctRating / stat.ctRounds,
      adr: stat.adr / stat.rounds,
      ctADR: stat.ctADR / stat.ctRounds,
      TADR: stat.TADR / stat.TRounds,
      kills: stat.kills / stat.rounds,
      TKills: stat.TKills / stat.TRounds,
      ctKills: stat.ctKills / stat.ctRounds,
      deaths: stat.deaths / stat.rounds,
      TDeaths: stat.TDeaths / stat.TRounds,
      ctDeaths: stat.ctDeaths / stat.ctRounds,
      matchDays: matchDays,
    }))
    .sort((a, b) => b.rating - a.rating);

  // Group by tier and take top X
  const tierGroups: TierGroup = averagedStats.reduce((acc: TierGroup, stat) => {
    const tier = stat.match?.tier ?? "Unknown";
    delete stat.match;
    if (!acc[tier]) {
      acc[tier] = [stat];
    } else if (acc[tier].length < topX) {
      acc[tier].push(stat);
    } else {
      const minRatingInTier = Math.min(...acc[tier].map((s) => s.rating));
      if (stat.rating > minRatingInTier) {
        const minIndex = acc[tier].findIndex(
          (s) => s.rating === minRatingInTier
        );
        acc[tier][minIndex] = stat;
      }
    }
    return acc;
  }, {});

  return tierGroups;
}

// Example usage
const season = 13;
const matchDays = ["M02", "M03"]; // Specify match days here
const topX = 2; // Number of top players per tier you want to get
const main = async () => {
  const resp = await fetchPlayerMatchStats(season, matchDays, topX);
  const csvContent = generateCsvContent(resp);
  const fileName = `Season_${season}_MatchDays_${matchDays.join("-")}.csv`;
  fs.writeFileSync(path.join(__dirname, fileName), csvContent);
  console.log(`CSV file has been written: ${fileName}`);
};

function generateCsvContent(data: TierGroup): string {
  let csv =
    "Tier,Name,TeamClanName,MatchCount,Rating,TRounds,CtRounds,Rounds,TRating,CtRating,Adr,CtADR,TADR,Kills,TKills,CtKills,Deaths,TDeaths,CtDeaths,MatchDays\n";
  Object.entries(data).forEach(([tierName, tier]) => {
    tier.forEach((player) => {
      csv += `${tierName},${player.name},${player.teamClanName},${
        player.matchCount
      },${player.rating},${player.TRounds},${player.ctRounds},${
        player.rounds
      },${player.TRating},${player.ctRating},${player.adr},${player.ctADR},${
        player.TADR
      },${player.kills},${player.TKills},${player.ctKills},${player.deaths},${
        player.TDeaths
      },${player.ctDeaths},"${player.matchDays.join(", ")}"\n`;
    });
  });
  return csv;
}

main();
import * as fs from "fs";
import * as path from "path";
