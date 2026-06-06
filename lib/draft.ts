import { allPlayers, filterPlayersByEra, formatSeason } from "@/lib/players";
import { buildSlotsFromFormation, defaultFormationId } from "@/lib/formations";
import type { ClubSeasonDraw, DraftSlot, EraSelection, Player, Position, SubPosition } from "@/lib/types";

export const MAX_CLUB_REROLLS = 2;
export const MAX_ERA_REROLLS = 3;

export const initialSlots: DraftSlot[] = buildSlotsFromFormation(defaultFormationId);

export function getActiveSlot(slots: DraftSlot[]) {
  return slots.find((slot) => slot.player === null) ?? null;
}

export function isDraftComplete(slots: DraftSlot[]) {
  return slots.every((slot) => slot.player !== null);
}

export function hasOpenSlotForPosition(slots: DraftSlot[], position: Position) {
  return slots.some((slot) => slot.position === position && slot.player === null);
}

const fallbackSubPositions: Record<Position, SubPosition[]> = {
  GK: ["GK"],
  DEF: ["CB", "LB", "RB", "LWB", "RWB"],
  MID: ["CM", "CDM", "CAM", "LM", "RM"],
  ATT: ["ST", "CF", "SS", "LW", "RW"]
};

export function getPlayerSubPositions(player: Player) {
  return player.sub_positions?.length ? player.sub_positions : fallbackSubPositions[player.position];
}

export function getCompatibleOpenSlots(slots: DraftSlot[], player: Player) {
  const subPositions = new Set(getPlayerSubPositions(player));

  return slots.filter(
    (slot) =>
      slot.player === null &&
      subPositions.has(slot.subPosition)
  );
}

export function hasOpenCompatibleSlot(slots: DraftSlot[], player: Player) {
  return getCompatibleOpenSlots(slots, player).length > 0;
}

export function getPositionCounts(slots: DraftSlot[]) {
  return slots.reduce<Record<Position, { filled: number; total: number }>>(
    (counts, slot) => {
      counts[slot.position].total += 1;

      if (slot.player) {
        counts[slot.position].filled += 1;
      }

      return counts;
    },
    {
      GK: { filled: 0, total: 0 },
      DEF: { filled: 0, total: 0 },
      MID: { filled: 0, total: 0 },
      ATT: { filled: 0, total: 0 }
    }
  );
}

export function drawClubSeason(
  slots: DraftSlot[],
  excludedPlayerIds: string[],
  era: EraSelection,
  excludedDraw?: ClubSeasonDraw | null
): ClubSeasonDraw | null {
  const used = new Set(excludedPlayerIds);
  const compatiblePairs = filterPlayersByEra(allPlayers, era)
    .filter((player) => !used.has(player.id) && hasOpenCompatibleSlot(slots, player))
    .map((player) => `${player.club}:::${player.season}`);

  const uniquePairs = Array.from(new Set(compatiblePairs)).filter((pair) => {
    if (!excludedDraw) {
      return true;
    }

    return pair !== `${excludedDraw.club}:::${excludedDraw.season}`;
  });

  if (uniquePairs.length === 0) {
    return null;
  }

  const pair = uniquePairs[Math.floor(Math.random() * uniquePairs.length)];
  const [club, rawSeason] = pair.split(":::");
  const season = Number(rawSeason);

  return {
    club,
    season,
    seasonLabel: formatSeason(season)
  };
}

export function drawSeasonForClub(
  currentDraw: ClubSeasonDraw | null,
  slots: DraftSlot[],
  excludedPlayerIds: string[],
  era: EraSelection,
  seenSeasons: number[] = []
): ClubSeasonDraw | null {
  if (!currentDraw) {
    return null;
  }

  const used = new Set(excludedPlayerIds);
  const compatibleSeasons = filterPlayersByEra(allPlayers, era)
    .filter(
      (player) =>
        player.club === currentDraw.club &&
        player.season !== currentDraw.season &&
        !used.has(player.id) &&
        hasOpenCompatibleSlot(slots, player)
    )
    .map((player) => player.season);
  const uniqueSeasons = Array.from(new Set(compatibleSeasons));
  const unseenSeasons = uniqueSeasons.filter((season) => !seenSeasons.includes(season));
  const seasonPool = unseenSeasons.length > 0 ? unseenSeasons : uniqueSeasons;

  if (seasonPool.length === 0) {
    return null;
  }

  const season = seasonPool[Math.floor(Math.random() * seasonPool.length)];

  return {
    club: currentDraw.club,
    season,
    seasonLabel: formatSeason(season)
  };
}

export function getPlayersForDraw(
  draw: ClubSeasonDraw | null,
  slots: DraftSlot[],
  selectedPlayerIds: string[],
  era: EraSelection
): Player[] {
  if (!draw) {
    return [];
  }

  const selected = new Set(selectedPlayerIds);

  return filterPlayersByEra(allPlayers, era)
    .filter(
      (player) =>
        player.club === draw.club &&
        player.season === draw.season &&
        !selected.has(player.id) &&
        hasOpenCompatibleSlot(slots, player)
    )
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
}

export function fillNextSlotForPlayer(slots: DraftSlot[], player: Player, subPosition?: SubPosition) {
  const compatibleSlots = getCompatibleOpenSlots(slots, player);
  const targetSlot = subPosition
    ? compatibleSlots.find((slot) => slot.subPosition === subPosition)
    : compatibleSlots[0];

  if (!targetSlot) {
    return slots;
  }

  return slots.map((slot) => {
    if (slot.id === targetSlot.id) {
      return { ...slot, player };
    }

    return slot;
  });
}
