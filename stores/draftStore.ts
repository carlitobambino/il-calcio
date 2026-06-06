import { create } from "zustand";
import {
  drawClubSeason,
  drawSeasonForClub,
  fillNextSlotForPlayer,
  getCompatibleOpenSlots,
  getPlayersForDraw,
  isDraftComplete,
  MAX_CLUB_REROLLS,
  MAX_ERA_REROLLS
} from "@/lib/draft";
import { buildSlotsFromFormation, defaultFormationId } from "@/lib/formations";
import { availableEraBounds, eraPresets } from "@/lib/players";
import { simulateSeason as runSeasonSimulation } from "@/lib/simulation";
import type { SeasonSimulationResult } from "@/lib/simulation";
import type {
  ClubSeasonDraw,
  DraftMode,
  DraftSlot,
  DrawAnimationType,
  EraPresetId,
  EraSelection,
  FormationId,
  GamePhase,
  Player,
  SubPosition
} from "@/lib/types";

type PendingRoleChoice = {
  player: Player;
  options: SubPosition[];
};

type DraftState = {
  phase: GamePhase;
  formationId: FormationId;
  draftMode: DraftMode;
  era: EraSelection;
  slots: DraftSlot[];
  currentDraw: ClubSeasonDraw | null;
  drawAnimationType: DrawAnimationType;
  drawHistory: string[];
  pendingRoleChoice: PendingRoleChoice | null;
  seasonResult: SeasonSimulationResult | null;
  isDrawing: boolean;
  clubRerollsUsed: number;
  eraRerollsUsed: number;
  selectedPlayerIds: string[];
  openFormationSelect: () => void;
  backToMenu: () => void;
  setFormation: (formationId: FormationId) => void;
  setDraftMode: (draftMode: DraftMode) => void;
  setEra: (era: EraSelection) => void;
  setEraPreset: (presetId: EraPresetId) => void;
  getAvailablePlayers: () => Player[];
  isComplete: () => boolean;
  startDraft: () => void;
  finishDrawAnimation: () => void;
  changeClub: () => void;
  changeEra: () => void;
  selectPlayer: (player: Player) => void;
  confirmPlayerRole: (subPosition: SubPosition) => void;
  cancelPlayerRoleChoice: () => void;
  openTeamSummary: () => void;
  finishRatingReveal: () => void;
  simulateSeason: () => void;
  showSeasonResults: () => void;
  reset: () => void;
};

function drawKey(draw: ClubSeasonDraw | null) {
  return draw ? `${draw.club}:::${draw.season}` : "";
}

function appendDrawHistory(history: string[], draw: ClubSeasonDraw | null) {
  const key = drawKey(draw);
  return key && !history.includes(key) ? [...history, key] : history;
}

function seenSeasonsForClub(history: string[], club: string) {
  return history
    .map((key) => key.split(":::"))
    .filter(([historyClub]) => historyClub === club)
    .map(([, season]) => Number(season));
}

function normalizeEra(era: EraSelection): EraSelection {
  const startYear = Math.max(availableEraBounds.startYear, Math.min(era.startYear, availableEraBounds.endYear));
  const endYear = Math.max(startYear, Math.min(era.endYear, availableEraBounds.endYear));

  return { startYear, endYear };
}

function createInitialState(
  formationId: FormationId = defaultFormationId,
  era: EraSelection = eraPresets["all-time"].era,
  draftMode: DraftMode = "normal"
) {
  const slots = buildSlotsFromFormation(formationId);

  return {
    phase: "home" as GamePhase,
    formationId,
    draftMode,
    era: normalizeEra(era),
    slots,
    currentDraw: null,
    drawAnimationType: "club" as DrawAnimationType,
    drawHistory: [],
    pendingRoleChoice: null,
    seasonResult: null,
    isDrawing: false,
    clubRerollsUsed: 0,
    eraRerollsUsed: 0,
    selectedPlayerIds: []
  };
}

export const useDraftStore = create<DraftState>((set, get) => ({
  ...createInitialState(),

  getAvailablePlayers: () => {
    return getPlayersForDraw(get().currentDraw, get().slots, get().selectedPlayerIds, get().era);
  },

  isComplete: () => isDraftComplete(get().slots),

  openFormationSelect: () => {
    set({ phase: "formation", currentDraw: null, pendingRoleChoice: null, seasonResult: null, isDrawing: false });
  },

  backToMenu: () => {
    const nextState = createInitialState(get().formationId, get().era, get().draftMode);

    set({
      ...nextState,
      phase: "home"
    });
  },

  setFormation: (formationId) => {
    set({
      formationId,
      slots: buildSlotsFromFormation(formationId),
      currentDraw: null,
      drawHistory: [],
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: false,
      clubRerollsUsed: 0,
      eraRerollsUsed: 0,
      selectedPlayerIds: []
    });
  },

  setDraftMode: (draftMode) => {
    set({ draftMode });
  },

  setEra: (era) => {
    const nextEra = normalizeEra(era);

    set({
      era: nextEra,
      slots: buildSlotsFromFormation(get().formationId),
      currentDraw: null,
      drawHistory: [],
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: false,
      clubRerollsUsed: 0,
      eraRerollsUsed: 0,
      selectedPlayerIds: []
    });
  },

  setEraPreset: (presetId) => {
    get().setEra(eraPresets[presetId].era);
  },

  startDraft: () => {
    const state = get();

    if (isDraftComplete(state.slots) || state.currentDraw) {
      set({ phase: "draft" });
      return;
    }

    const nextDraw = drawClubSeason(state.slots, state.selectedPlayerIds, state.era);

    set({
      phase: "draft",
      currentDraw: nextDraw,
      drawAnimationType: "club",
      drawHistory: appendDrawHistory(state.drawHistory, nextDraw),
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: true
    });
  },

  finishDrawAnimation: () => {
    set({ isDrawing: false });
  },

  changeClub: () => {
    const state = get();

    if (state.isDrawing || isDraftComplete(state.slots) || state.clubRerollsUsed >= MAX_CLUB_REROLLS) {
      return;
    }

    const nextDraw = drawClubSeason(state.slots, state.selectedPlayerIds, state.era, state.currentDraw);

    if (!nextDraw) {
      return;
    }

    set({
      currentDraw: nextDraw,
      drawAnimationType: "club",
      drawHistory: appendDrawHistory(state.drawHistory, nextDraw),
      pendingRoleChoice: null,
      isDrawing: true,
      clubRerollsUsed: state.clubRerollsUsed + 1
    });
  },

  changeEra: () => {
    const state = get();

    if (state.isDrawing || isDraftComplete(state.slots) || state.eraRerollsUsed >= MAX_ERA_REROLLS) {
      return;
    }

    const seenSeasons = state.currentDraw ? seenSeasonsForClub(state.drawHistory, state.currentDraw.club) : [];
    const nextDraw = drawSeasonForClub(state.currentDraw, state.slots, state.selectedPlayerIds, state.era, seenSeasons);

    if (!nextDraw) {
      return;
    }

    set({
      currentDraw: nextDraw,
      drawAnimationType: "era",
      drawHistory: appendDrawHistory(state.drawHistory, nextDraw),
      pendingRoleChoice: null,
      isDrawing: true,
      eraRerollsUsed: state.eraRerollsUsed + 1
    });
  },

  selectPlayer: (player) => {
    const state = get();

    if (
      state.isDrawing ||
      state.selectedPlayerIds.includes(player.id) ||
      getCompatibleOpenSlots(state.slots, player).length === 0
    ) {
      return;
    }

    const compatibleSlots = getCompatibleOpenSlots(state.slots, player);
    const options = Array.from(new Set(compatibleSlots.map((slot) => slot.subPosition)));

    if (options.length > 1) {
      set({ pendingRoleChoice: { player, options } });
      return;
    }

    const nextSlots = fillNextSlotForPlayer(state.slots, player, options[0]);
    const nextSelectedIds = [...state.selectedPlayerIds, player.id];
    const complete = isDraftComplete(nextSlots);

    const nextDraw = complete ? null : drawClubSeason(nextSlots, nextSelectedIds, state.era);

    set({
      slots: nextSlots,
      selectedPlayerIds: nextSelectedIds,
      currentDraw: nextDraw,
      drawAnimationType: "club",
      drawHistory: appendDrawHistory(state.drawHistory, nextDraw),
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: !complete
    });
  },

  confirmPlayerRole: (subPosition) => {
    const state = get();
    const pending = state.pendingRoleChoice;

    if (!pending || state.isDrawing || state.selectedPlayerIds.includes(pending.player.id)) {
      return;
    }

    const nextSlots = fillNextSlotForPlayer(state.slots, pending.player, subPosition);

    if (nextSlots === state.slots) {
      set({ pendingRoleChoice: null });
      return;
    }

    const nextSelectedIds = [...state.selectedPlayerIds, pending.player.id];
    const complete = isDraftComplete(nextSlots);

    const nextDraw = complete ? null : drawClubSeason(nextSlots, nextSelectedIds, state.era);

    set({
      slots: nextSlots,
      selectedPlayerIds: nextSelectedIds,
      currentDraw: nextDraw,
      drawAnimationType: "club",
      drawHistory: appendDrawHistory(state.drawHistory, nextDraw),
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: !complete
    });
  },

  cancelPlayerRoleChoice: () => {
    set({ pendingRoleChoice: null });
  },

  openTeamSummary: () => {
    const state = get();

    if (!isDraftComplete(state.slots)) {
      return;
    }

    set({
      phase: state.draftMode === "blind" ? "reveal" : "summary",
      currentDraw: null,
      pendingRoleChoice: null,
      isDrawing: false,
      seasonResult: null
    });
  },

  finishRatingReveal: () => {
    if (!isDraftComplete(get().slots)) {
      return;
    }

    set({ phase: "summary" });
  },

  simulateSeason: () => {
    const state = get();

    if (!isDraftComplete(state.slots)) {
      return;
    }

    set({
      phase: "simulation",
      currentDraw: null,
      pendingRoleChoice: null,
      isDrawing: false,
      seasonResult: runSeasonSimulation(state.slots)
    });
  },

  showSeasonResults: () => {
    if (!get().seasonResult) {
      return;
    }

    set({ phase: "season" });
  },

  reset: () => {
    const nextState = createInitialState(get().formationId, get().era, get().draftMode);

    const nextDraw = drawClubSeason(nextState.slots, [], nextState.era);

    set({
      ...nextState,
      phase: "draft",
      currentDraw: nextDraw,
      drawAnimationType: "club",
      drawHistory: appendDrawHistory([], nextDraw),
      pendingRoleChoice: null,
      seasonResult: null,
      isDrawing: true
    });
  }
}));
