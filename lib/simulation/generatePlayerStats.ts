import { USER_CLUB_NAME } from "@/lib/simulation/clubs";
import type { DraftSlot } from "@/lib/types";
import type { MatchGoalEvent, PlayerSeasonStat, SimulatedMatch } from "@/lib/simulation/types";

const GOAL_WEIGHTS = {
  GK: 0.01,
  DEF: 0.12,
  MID: 0.55,
  ATT: 1.15
};

const ASSIST_WEIGHTS = {
  GK: 0.01,
  DEF: 0.25,
  MID: 1,
  ATT: 0.72
};

function weightedPick(stats: PlayerSeasonStat[], mode: "goals" | "assists", excludedId?: string) {
  const weights = stats.map((stat) => {
    if (stat.playerId === excludedId) {
      return 0;
    }

    const positionWeight = mode === "goals" ? GOAL_WEIGHTS[stat.position] : ASSIST_WEIGHTS[stat.position];
    return positionWeight * Math.max(1, stat.rating - 64);
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = Math.random() * total;

  for (let index = 0; index < stats.length; index += 1) {
    cursor -= weights[index];

    if (cursor <= 0) {
      return stats[index];
    }
  }

  return stats[stats.length - 1];
}

function createBaseStats(slots: DraftSlot[]): PlayerSeasonStat[] {
  return slots.flatMap((slot) =>
    slot.player
      ? [
          {
            playerId: slot.player.id,
            name: slot.player.name,
            club: slot.player.club,
            position: slot.player.position,
            rating: slot.player.rating,
            goals: 0,
            assists: 0
          }
        ]
      : []
  );
}

export function generateMatchGoalEvents(slots: DraftSlot[], match: SimulatedMatch): MatchGoalEvent[] {
  const stats = createBaseStats(slots);
  const userGoals =
    match.homeTeam === USER_CLUB_NAME
      ? match.homeGoals
      : match.awayTeam === USER_CLUB_NAME
        ? match.awayGoals
        : 0;

  return Array.from({ length: userGoals }, () => {
    const scorer = weightedPick(stats, "goals");
    const hasAssist = Math.random() > 0.16;
    const assister = hasAssist ? weightedPick(stats, "assists", scorer.playerId) : null;

    return {
      minute: Math.floor(4 + Math.random() * 88),
      team: USER_CLUB_NAME,
      playerId: scorer.playerId,
      playerName: scorer.name,
      assistPlayerId: assister?.playerId,
      assistPlayerName: assister?.name
    };
  }).sort((a, b) => a.minute - b.minute);
}

export function generatePlayerStats(slots: DraftSlot[], matches: SimulatedMatch[]): PlayerSeasonStat[] {
  const stats = createBaseStats(slots);
  const statsById = new Map(stats.map((stat) => [stat.playerId, stat]));

  for (const match of matches) {
    if (match.goalEvents?.length) {
      for (const event of match.goalEvents) {
        statsById.get(event.playerId)!.goals += 1;

        if (event.assistPlayerId) {
          statsById.get(event.assistPlayerId)!.assists += 1;
        }
      }

      continue;
    }

    const generatedEvents = generateMatchGoalEvents(slots, match);

    for (const event of generatedEvents) {
      statsById.get(event.playerId)!.goals += 1;

      if (event.assistPlayerId) {
        statsById.get(event.assistPlayerId)!.assists += 1;
      }
    }
  }

  return stats.sort((a, b) => b.goals - a.goals || b.assists - a.assists || b.rating - a.rating);
}
