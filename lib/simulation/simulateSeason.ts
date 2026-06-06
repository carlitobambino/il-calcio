import { SERIE_A_CLUB_STRENGTHS, USER_CLUB_NAME } from "@/lib/simulation/clubs";
import { generateLeagueTable } from "@/lib/simulation/generateLeagueTable";
import { generateMatchGoalEvents, generatePlayerStats } from "@/lib/simulation/generatePlayerStats";
import { simulateMatch } from "@/lib/simulation/simulateMatch";
import type { DraftSlot, Position } from "@/lib/types";
import type { DraftTeamStrength, SeasonMatchday, SeasonSimulationResult, SimulationTeam } from "@/lib/simulation/types";

function average(values: number[], fallback: number) {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratingsForPosition(slots: DraftSlot[], position: Position) {
  return slots.flatMap((slot) => (slot.player?.position === position ? [slot.player.rating] : []));
}

function buildDraftTeamStrength(slots: DraftSlot[]): DraftTeamStrength {
  const allRatings = slots.flatMap((slot) => (slot.player ? [slot.player.rating] : []));
  const gk = average(ratingsForPosition(slots, "GK"), 78);
  const defenders = average(ratingsForPosition(slots, "DEF"), 78);
  const midfielders = average(ratingsForPosition(slots, "MID"), 78);
  const attackers = average(ratingsForPosition(slots, "ATT"), 78);
  const overall = average(allRatings, 78);

  return {
    attack: attackers * 0.56 + midfielders * 0.28 + overall * 0.16,
    defense: defenders * 0.43 + gk * 0.34 + midfielders * 0.18 + overall * 0.05,
    overall
  };
}

function createOpponentTeam(club: { name: string; strength: number; attackBias?: number; defenseBias?: number }): SimulationTeam {
  return {
    name: club.name,
    attack: club.strength + (club.attackBias ?? 0),
    defense: club.strength + (club.defenseBias ?? 0),
    strength: club.strength
  };
}

function createDraftTeam(slots: DraftSlot[]): { team: SimulationTeam; teamStrength: DraftTeamStrength } {
  const teamStrength = buildDraftTeamStrength(slots);

  return {
    teamStrength,
    team: {
      name: USER_CLUB_NAME,
      attack: teamStrength.attack,
      defense: teamStrength.defense,
      strength: teamStrength.overall,
      isUser: true
    }
  };
}

function generateRoundRobinSchedule(teams: SimulationTeam[]): [SimulationTeam, SimulationTeam][][] {
  const rotating = [...teams];
  const firstLeg: [SimulationTeam, SimulationTeam][][] = [];
  const rounds = teams.length - 1;
  const matchesPerRound = teams.length / 2;

  for (let round = 0; round < rounds; round += 1) {
    const roundMatches: [SimulationTeam, SimulationTeam][] = [];

    for (let index = 0; index < matchesPerRound; index += 1) {
      const left = rotating[index];
      const right = rotating[rotating.length - 1 - index];
      const homeFirst = (round + index) % 2 === 0;
      roundMatches.push(homeFirst ? [left, right] : [right, left]);
    }

    firstLeg.push(roundMatches);
    rotating.splice(1, 0, rotating.pop()!);
  }

  const secondLeg = firstLeg.map((round) => round.map(([home, away]) => [away, home] as [SimulationTeam, SimulationTeam]));

  return [...firstLeg, ...secondLeg];
}

export function simulateSeason(slots: DraftSlot[]): SeasonSimulationResult {
  const { team, teamStrength } = createDraftTeam(slots);
  const teams = [team, ...SERIE_A_CLUB_STRENGTHS.map(createOpponentTeam)];
  const schedule = generateRoundRobinSchedule(teams);
  const matchdays: SeasonMatchday[] = schedule.map((round, index) => {
    const matches = round.map(([home, away]) => {
      const match = simulateMatch(home, away);
      const isUserMatch = match.homeTeam === USER_CLUB_NAME || match.awayTeam === USER_CLUB_NAME;

      return {
        ...match,
        goalEvents: isUserMatch ? generateMatchGoalEvents(slots, match) : []
      };
    });

    return {
      matchday: index + 1,
      matches
    };
  });
  const matches = matchdays.flatMap((matchday) => matchday.matches);

  const table = generateLeagueTable(matches, USER_CLUB_NAME);
  const userRow = table.find((row) => row.club === USER_CLUB_NAME) ?? table[0];
  const userMatches = matches.filter((match) => match.homeTeam === USER_CLUB_NAME || match.awayTeam === USER_CLUB_NAME);
  const playerStats = generatePlayerStats(slots, userMatches);
  const topScorer = playerStats.reduce<PlayerSeasonStatOrNull>(
    (best, stat) => (!best || stat.goals > best.goals ? stat : best),
    null
  );
  const topAssister = playerStats.reduce<PlayerSeasonStatOrNull>(
    (best, stat) => (!best || stat.assists > best.assists ? stat : best),
    null
  );

  return {
    matches,
    matchdays,
    table,
    userRow,
    playerStats,
    topScorer,
    topAssister,
    teamStrength,
    draftSlots: slots
  };
}

type PlayerSeasonStatOrNull = SeasonSimulationResult["topScorer"];
