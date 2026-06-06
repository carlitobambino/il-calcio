import type { Position } from "@/lib/types";

export const positionLabels: Record<Position, string> = {
  GK: "Portiere",
  DEF: "Difesa",
  MID: "Centrocampo",
  ATT: "Attacco"
};

export function formatPosition(position: Position) {
  return positionLabels[position];
}
