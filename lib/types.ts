export type Position = "GK" | "DEF" | "MID" | "ATT";

export type SubPosition =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "LWB"
  | "RWB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "CF"
  | "ST"
  | "SS";

export type FormationId = "sacchi-442" | "sarri-433" | "conte-352" | "inzaghi-532" | "gasperini-3421";

export type DraftMode = "normal" | "blind";

export type DrawAnimationType = "club" | "era";

export type GamePhase = "home" | "formation" | "draft" | "reveal" | "summary" | "simulation" | "season";

export type EraPresetId = "modern" | "classic" | "all-time";

export type EraSelection = {
  startYear: number;
  endYear: number;
};

export type Player = {
  id: string;
  name: string;
  club: string;
  season: number;
  position: Position;
  sub_positions?: SubPosition[];
  rating: number;
  elite?: boolean;
  eliteSeasonBonus?: number;
  legendTier?: "S+" | "S" | "A" | "NONE";
};

export type DraftSlot = {
  id: string;
  label: string;
  position: Position;
  subPosition: SubPosition;
  player: Player | null;
};

export type FormationSlotConfig = {
  position: Position;
  subPosition: SubPosition;
  label: string;
};

export type FormationRow = {
  position: Position;
  slots: FormationSlotConfig[];
};

export type FormationConfig = {
  id: FormationId;
  name: string;
  formation: string;
  coach: string;
  club: string;
  era: string;
  philosophy: string[];
  description: string;
  tagline: string;
  rows: FormationRow[];
};

export type ClubSeasonDraw = {
  club: string;
  season: number;
  seasonLabel: string;
};
