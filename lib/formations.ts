import type { DraftSlot, FormationConfig, FormationId } from "@/lib/types";

export const formationConfig: Record<FormationId, FormationConfig> = {
  "sacchi-442": {
    id: "sacchi-442",
    name: "SACCHI",
    formation: "4-4-2",
    coach: "Arrigo Sacchi",
    club: "AC Milan",
    era: "1988-1991",
    philosophy: ["Pressing alto", "Blocco compatto", "Movimento collettivo"],
    description: "Il Milan che ha cambiato il calcio italiano con pressing e disciplina tattica.",
    tagline: "Pressing alto, blocco compatto, movimento collettivo",
    rows: [
      { position: "ATT", slots: [{ position: "ATT", subPosition: "ST", label: "ST" }, { position: "ATT", subPosition: "ST", label: "ST" }] },
      { position: "MID", slots: [{ position: "MID", subPosition: "LM", label: "LM" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "RM", label: "RM" }] },
      { position: "DEF", slots: [{ position: "DEF", subPosition: "LB", label: "LB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "RB", label: "RB" }] },
      { position: "GK", slots: [{ position: "GK", subPosition: "GK", label: "GK" }] }
    ]
  },
  "sarri-433": {
    id: "sarri-433",
    name: "SARRI",
    formation: "4-3-3",
    coach: "Maurizio Sarri",
    club: "Napoli",
    era: "2015-2018",
    philosophy: ["Possesso", "Combinazioni rapide", "Ampiezza offensiva"],
    description: "Il Napoli del Sarrismo, costruito su palleggio fluido e movimenti offensivi.",
    tagline: "Possesso, combinazioni rapide, ampiezza offensiva",
    rows: [
      { position: "ATT", slots: [{ position: "ATT", subPosition: "LW", label: "LW" }, { position: "ATT", subPosition: "ST", label: "ST" }, { position: "ATT", subPosition: "RW", label: "RW" }] },
      { position: "MID", slots: [{ position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "CDM", label: "CDM" }, { position: "MID", subPosition: "CM", label: "CM" }] },
      { position: "DEF", slots: [{ position: "DEF", subPosition: "LB", label: "LB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "RB", label: "RB" }] },
      { position: "GK", slots: [{ position: "GK", subPosition: "GK", label: "GK" }] }
    ]
  },
  "conte-352": {
    id: "conte-352",
    name: "CONTE",
    formation: "3-5-2",
    coach: "Antonio Conte",
    club: "Juventus / Inter",
    era: "2012-2021",
    philosophy: ["Quinti", "Intensità", "Dominio del centrocampo"],
    description: "Un classico moderno della Serie A fondato su intensità, transizioni e superiorità tattica.",
    tagline: "Quinti, intensità, dominio del centrocampo",
    rows: [
      { position: "ATT", slots: [{ position: "ATT", subPosition: "ST", label: "ST" }, { position: "ATT", subPosition: "ST", label: "ST" }] },
      { position: "MID", slots: [{ position: "MID", subPosition: "LWB", label: "LWB" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "CDM", label: "CDM" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "RWB", label: "RWB" }] },
      { position: "DEF", slots: [{ position: "DEF", subPosition: "CB", label: "LCB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "CB", label: "RCB" }] },
      { position: "GK", slots: [{ position: "GK", subPosition: "GK", label: "GK" }] }
    ]
  },
  "inzaghi-532": {
    id: "inzaghi-532",
    name: "INZAGHI",
    formation: "5-3-2",
    coach: "Simone Inzaghi",
    club: "Inter",
    era: "2021-2024",
    philosophy: ["Solidità difensiva", "Ritmo controllato", "Quinti offensivi"],
    description: "Un sistema elegante che unisce struttura e fluidità offensiva.",
    tagline: "Solidità difensiva, ritmo controllato, quinti offensivi",
    rows: [
      { position: "ATT", slots: [{ position: "ATT", subPosition: "ST", label: "ST" }, { position: "ATT", subPosition: "ST", label: "ST" }] },
      { position: "MID", slots: [{ position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "CDM", label: "CDM" }, { position: "MID", subPosition: "CM", label: "CM" }] },
      { position: "DEF", slots: [{ position: "DEF", subPosition: "LWB", label: "LWB" }, { position: "DEF", subPosition: "CB", label: "LCB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "CB", label: "RCB" }, { position: "DEF", subPosition: "RWB", label: "RWB" }] },
      { position: "GK", slots: [{ position: "GK", subPosition: "GK", label: "GK" }] }
    ]
  },
  "gasperini-3421": {
    id: "gasperini-3421",
    name: "GASPERINI",
    formation: "3-4-2-1",
    coach: "Gian Piero Gasperini",
    club: "Atalanta",
    era: "2018-2024",
    philosophy: ["Pressing aggressivo", "Calcio verticale", "Attacco prolifico"],
    description: "Uno dei sistemi più elettrici del calcio europeo moderno.",
    tagline: "Pressing aggressivo, calcio verticale, attacco prolifico",
    rows: [
      { position: "ATT", slots: [{ position: "ATT", subPosition: "CAM", label: "CAM" }, { position: "ATT", subPosition: "CAM", label: "CAM" }, { position: "ATT", subPosition: "ST", label: "ST" }] },
      { position: "MID", slots: [{ position: "MID", subPosition: "LWB", label: "LWB" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "CM", label: "CM" }, { position: "MID", subPosition: "RWB", label: "RWB" }] },
      { position: "DEF", slots: [{ position: "DEF", subPosition: "CB", label: "LCB" }, { position: "DEF", subPosition: "CB", label: "CB" }, { position: "DEF", subPosition: "CB", label: "RCB" }] },
      { position: "GK", slots: [{ position: "GK", subPosition: "GK", label: "GK" }] }
    ]
  }
};

export const formationIds = Object.keys(formationConfig) as FormationId[];
export const defaultFormationId: FormationId = "sarri-433";

export function buildSlotsFromFormation(formationId: FormationId): DraftSlot[] {
  const counters: Record<string, number> = {};

  return formationConfig[formationId].rows.flatMap((row) =>
    row.slots.map((slot) => {
      counters[slot.subPosition] = (counters[slot.subPosition] ?? 0) + 1;
      const index = counters[slot.subPosition];

      return {
        id: `${slot.subPosition.toLowerCase()}-${index}`,
        label: slot.label,
        position: slot.position,
        subPosition: slot.subPosition,
        player: null
      };
    })
  );
}
