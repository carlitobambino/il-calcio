import type { DraftSlot, Player, Position } from "@/lib/types";

export type TeamAnalysis = {
  overall: number;
  attack: number;
  midfield: number;
  defense: number;
  bestPlayer: Player | null;
  weakestLink: Player | null;
};

function average(values: number[], fallback = 70) {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ratingsByPosition(slots: DraftSlot[], position: Position) {
  return slots.flatMap((slot) => (slot.player?.position === position ? [slot.player.rating] : []));
}

export function getDraftPlayers(slots: DraftSlot[]) {
  return slots.flatMap((slot) => (slot.player ? [slot.player] : []));
}

export function analyzeTeam(slots: DraftSlot[]): TeamAnalysis {
  const players = getDraftPlayers(slots);
  const gk = average(ratingsByPosition(slots, "GK"));
  const def = average(ratingsByPosition(slots, "DEF"));
  const mid = average(ratingsByPosition(slots, "MID"));
  const att = average(ratingsByPosition(slots, "ATT"));
  const overall = average(players.map((player) => player.rating));

  return {
    overall: Math.round(overall),
    attack: Math.round(att * 0.78 + mid * 0.22),
    midfield: Math.round(mid),
    defense: Math.round(def * 0.72 + gk * 0.28),
    bestPlayer: [...players].sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))[0] ?? null,
    weakestLink: [...players].sort((a, b) => a.rating - b.rating || a.name.localeCompare(b.name))[0] ?? null
  };
}
