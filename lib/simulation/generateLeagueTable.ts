import type { LeagueTableRow, SimulatedMatch } from "@/lib/simulation/types";

function createRow(club: string, isUser = false): LeagueTableRow {
  return {
    club,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    isUser
  };
}

function applyResult(row: LeagueTableRow, goalsFor: number, goalsAgainst: number) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}

export function generateLeagueTable(matches: SimulatedMatch[], userClub: string): LeagueTableRow[] {
  const table = new Map<string, LeagueTableRow>();

  for (const match of matches) {
    if (!table.has(match.homeTeam)) {
      table.set(match.homeTeam, createRow(match.homeTeam, match.homeTeam === userClub));
    }

    if (!table.has(match.awayTeam)) {
      table.set(match.awayTeam, createRow(match.awayTeam, match.awayTeam === userClub));
    }

    applyResult(table.get(match.homeTeam)!, match.homeGoals, match.awayGoals);
    applyResult(table.get(match.awayTeam)!, match.awayGoals, match.homeGoals);
  }

  return Array.from(table.values()).sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.club.localeCompare(b.club)
  );
}
