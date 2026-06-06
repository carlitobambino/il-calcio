import type { ClubStrength } from "@/lib/simulation/types";

export const USER_CLUB_NAME = "Draft XI";

export const SERIE_A_CLUB_STRENGTHS: ClubStrength[] = [
  { name: "Inter", strength: 91, attackBias: 2, defenseBias: 3 },
  { name: "Napoli", strength: 89, attackBias: 3, defenseBias: 1 },
  { name: "Juventus", strength: 88, attackBias: 1, defenseBias: 3 },
  { name: "Milan", strength: 87, attackBias: 2, defenseBias: 2 },
  { name: "Atalanta", strength: 85, attackBias: 4, defenseBias: -1 },
  { name: "Roma", strength: 84, attackBias: 2, defenseBias: 1 },
  { name: "Lazio", strength: 83, attackBias: 2, defenseBias: 0 },
  { name: "Fiorentina", strength: 82, attackBias: 1, defenseBias: 1 },
  { name: "Bologna", strength: 80, attackBias: 0, defenseBias: 2 },
  { name: "Torino", strength: 78, attackBias: -1, defenseBias: 2 },
  { name: "Udinese", strength: 77, attackBias: 0, defenseBias: 0 },
  { name: "Genoa", strength: 76, attackBias: -1, defenseBias: 1 },
  { name: "Sassuolo", strength: 75, attackBias: 2, defenseBias: -2 },
  { name: "Parma", strength: 74, attackBias: 0, defenseBias: -1 },
  { name: "Sampdoria", strength: 74, attackBias: 1, defenseBias: -1 },
  { name: "Cagliari", strength: 73, attackBias: -1, defenseBias: 0 },
  { name: "Hellas Verona", strength: 72, attackBias: -1, defenseBias: 0 },
  { name: "Empoli", strength: 72, attackBias: 0, defenseBias: -1 },
  { name: "Lecce", strength: 71, attackBias: -1, defenseBias: -1 }
];
