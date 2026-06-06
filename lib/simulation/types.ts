import type { DraftSlot, Player } from "@/lib/types";

export type ClubStrength = {
  name: string;
  strength: number;
  attackBias?: number;
  defenseBias?: number;
};

export type SimulationTeam = {
  name: string;
  attack: number;
  defense: number;
  strength: number;
  isUser?: boolean;
};

export type SimulatedMatch = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  goalEvents?: MatchGoalEvent[];
};

export type MatchGoalEvent = {
  minute: number;
  team: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
};

export type SeasonMatchday = {
  matchday: number;
  matches: SimulatedMatch[];
};

export type LeagueTableRow = {
  club: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isUser?: boolean;
};

export type PlayerSeasonStat = {
  playerId: string;
  name: string;
  club: string;
  position: Player["position"];
  rating: number;
  goals: number;
  assists: number;
};

export type DraftTeamStrength = {
  attack: number;
  defense: number;
  overall: number;
};

export type SeasonSimulationResult = {
  matches: SimulatedMatch[];
  matchdays: SeasonMatchday[];
  table: LeagueTableRow[];
  userRow: LeagueTableRow;
  playerStats: PlayerSeasonStat[];
  topScorer: PlayerSeasonStat | null;
  topAssister: PlayerSeasonStat | null;
  teamStrength: DraftTeamStrength;
  draftSlots: DraftSlot[];
};
