import players from "@/public/data/players_seriea_alltime.json";
import type { EraPresetId, EraSelection, Player } from "@/lib/types";

export const allPlayers = players as Player[];

export const clubs = Array.from(new Set(allPlayers.map((player) => player.club))).sort();

export const seasons = Array.from(new Set(allPlayers.map((player) => player.season))).sort(
  (a, b) => a - b
);

export function formatSeason(season: number) {
  const value = String(season).padStart(4, "0");
  return `20${value.slice(0, 2)}-20${value.slice(2, 4)}`;
}

export function getSeasonStartYear(season: number) {
  const value = String(season).padStart(4, "0");
  return 2000 + Number(value.slice(0, 2));
}

export function isSeasonInEra(season: number, era: EraSelection) {
  const startYear = getSeasonStartYear(season);
  return startYear >= era.startYear && startYear <= era.endYear;
}

export function filterPlayersByEra(playersToFilter: Player[], era: EraSelection) {
  return playersToFilter.filter((player) => isSeasonInEra(player.season, era));
}

export const availableEraBounds: EraSelection = seasons.reduce<EraSelection>(
  (bounds, season) => {
    const startYear = getSeasonStartYear(season);

    return {
      startYear: Math.min(bounds.startYear, startYear),
      endYear: Math.max(bounds.endYear, startYear)
    };
  },
  { startYear: 9999, endYear: 0 }
);

export const eraPresets: Record<EraPresetId, { label: string; description: string; era: EraSelection }> = {
  modern: {
    label: "Era Moderna",
    description: "2019-2025",
    era: { startYear: 2019, endYear: availableEraBounds.endYear }
  },
  classic: {
    label: "Serie A Classica",
    description: "2008-2018",
    era: { startYear: availableEraBounds.startYear, endYear: 2018 }
  },
  "all-time": {
    label: "Tutto il Calcio",
    description: `${availableEraBounds.startYear}-${availableEraBounds.endYear}`,
    era: availableEraBounds
  }
};

export function getAvailableClubsForEra(era: EraSelection) {
  return Array.from(new Set(filterPlayersByEra(allPlayers, era).map((player) => player.club))).sort();
}

export function getAvailableSeasonsForEra(era: EraSelection) {
  return Array.from(new Set(filterPlayersByEra(allPlayers, era).map((player) => player.season))).sort(
    (a, b) => a - b
  );
}
