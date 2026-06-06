"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClubDraw } from "@/components/ClubDraw";
import { DraftBoard } from "@/components/DraftBoard";
import { FormationPicker } from "@/components/FormationPicker";
import { HomeMenu } from "@/components/HomeMenu";
import { PlayerCard } from "@/components/PlayerCard";
import { PositionGroupedPlayers } from "@/components/PositionGroupedPlayers";
import { RatingReveal } from "@/components/RatingReveal";
import { RerollButton } from "@/components/RerollButton";
import { RoleChoicePanel } from "@/components/RoleChoicePanel";
import { SeasonSimulation } from "@/components/SeasonSimulation";
import { SeasonSummary } from "@/components/SeasonSummary";
import { TeamSummary } from "@/components/TeamSummary";
import { getPlayersForDraw, getPositionCounts, isDraftComplete } from "@/lib/draft";
import { formationConfig } from "@/lib/formations";
import { formatPosition } from "@/lib/labels";
import { useDraftStore } from "@/stores/draftStore";

export default function Home() {
  const phase = useDraftStore((state) => state.phase);
  const formationId = useDraftStore((state) => state.formationId);
  const draftMode = useDraftStore((state) => state.draftMode);
  const era = useDraftStore((state) => state.era);
  const slots = useDraftStore((state) => state.slots);
  const draw = useDraftStore((state) => state.currentDraw);
  const pendingRoleChoice = useDraftStore((state) => state.pendingRoleChoice);
  const seasonResult = useDraftStore((state) => state.seasonResult);
  const isDrawing = useDraftStore((state) => state.isDrawing);
  const selectedPlayerIds = useDraftStore((state) => state.selectedPlayerIds);
  const openFormationSelect = useDraftStore((state) => state.openFormationSelect);
  const backToMenu = useDraftStore((state) => state.backToMenu);
  const setFormation = useDraftStore((state) => state.setFormation);
  const setDraftMode = useDraftStore((state) => state.setDraftMode);
  const setEra = useDraftStore((state) => state.setEra);
  const setEraPreset = useDraftStore((state) => state.setEraPreset);
  const startDraft = useDraftStore((state) => state.startDraft);
  const selectPlayer = useDraftStore((state) => state.selectPlayer);
  const confirmPlayerRole = useDraftStore((state) => state.confirmPlayerRole);
  const cancelPlayerRoleChoice = useDraftStore((state) => state.cancelPlayerRoleChoice);
  const openTeamSummary = useDraftStore((state) => state.openTeamSummary);
  const finishRatingReveal = useDraftStore((state) => state.finishRatingReveal);
  const simulateSeason = useDraftStore((state) => state.simulateSeason);
  const showSeasonResults = useDraftStore((state) => state.showSeasonResults);
  const reset = useDraftStore((state) => state.reset);
  const availablePlayers = useMemo(
    () => getPlayersForDraw(draw, slots, selectedPlayerIds, era),
    [draw, era, selectedPlayerIds, slots]
  );
  const isComplete = useMemo(() => isDraftComplete(slots), [slots]);
  const positionCounts = useMemo(() => getPositionCounts(slots), [slots]);
  const formation = formationConfig[formationId];

  if (phase === "home") {
    return (
      <HomeMenu
        onStartDraft={openFormationSelect}
        draftMode={draftMode}
        onDraftModeChange={setDraftMode}
        era={era}
        onEraChange={setEra}
        onEraPreset={setEraPreset}
      />
    );
  }

  if (phase === "formation") {
    return (
      <FormationPicker
        selectedFormation={formationId}
        onSelectFormation={setFormation}
        onStart={startDraft}
        onBack={backToMenu}
      />
    );
  }

  if (phase === "season" && seasonResult) {
    return <SeasonSummary result={seasonResult} onNewDraft={reset} onBackToMenu={backToMenu} />;
  }

  if (phase === "simulation" && seasonResult) {
    return <SeasonSimulation result={seasonResult} onComplete={showSeasonResults} />;
  }

  if (phase === "summary") {
    return (
      <TeamSummary
        slots={slots}
        formationId={formationId}
        era={era}
        onSimulateSeason={simulateSeason}
        onBackToDraft={startDraft}
      />
    );
  }

  if (phase === "reveal") {
    return (
      <RatingReveal
        slots={slots}
        formationId={formationId}
        onContinue={finishRatingReveal}
      />
    );
  }

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-10">
      <div className="blue-orb absolute -left-48 top-20 h-[30rem] w-[30rem] blur-3xl" />
      <div className="absolute right-[-14rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#B8B3AA]/5 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-14">
        <section className="flex min-h-[calc(100vh-4rem)] flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="editorial-kicker">
                Archivio Serie A
              </p>
              <h1 className="editorial-title mt-2 text-6xl leading-none text-[#F4EFE6] sm:text-8xl">
                XI Draft
              </h1>
              <p className="mt-2 text-sm font-medium text-[#B8B3AA]/58">
                {formation.name} · {formation.formation} · {era.startYear}-{era.endYear}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.22em] text-[#B8B3AA]/62">
              <span className="h-1.5 w-1.5 rounded-full bg-[#008CFF]" />
              {isComplete ? "XI completo" : `${selectedPlayerIds.length}/${slots.length} scelti`}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 border-y border-[#B8B3AA]/10 py-3 sm:gap-3">
            {(["GK", "DEF", "MID", "ATT"] as const).map((position) => (
              <div
                key={position}
                className="px-1 text-center"
              >
                <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#B8B3AA]/50">{formatPosition(position)}</p>
                <p className="mt-1 text-sm font-black text-[#F4EFE6]/86">
                  {positionCounts[position].filled}/{positionCounts[position].total}
                </p>
              </div>
            ))}
          </div>

          <DraftBoard />
        </section>

        <aside className="flex flex-col gap-10 pb-4 lg:min-h-[calc(100vh-4rem)] lg:pt-5">
          <ClubDraw />

          <div>
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#B8B3AA]/12 pb-4">
              <div>
                <p className="editorial-kicker">
                  {draftMode === "blind" ? "Sala Cieca" : "Sala Scelta"}
                </p>
                <h2 className="editorial-title mt-1 text-4xl text-[#F4EFE6]">
                  {draftMode === "blind" ? "Profili Proposti" : "Giocatori Disponibili"}
                </h2>
              </div>
              <RerollButton />
            </div>

            <AnimatePresence mode="popLayout">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 border-l border-[#008CFF]/40 pl-5"
                >
                  <p className="text-sm font-medium text-[#F4EFE6]/78">
                    Il tuo undici è pronto. Rileggi la squadra prima della stagione.
                  </p>
                  <button
                    type="button"
                    onClick={openTeamSummary}
                    className="azzurro-button min-h-12 rounded-full px-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
                  >
                    Riepilogo Squadra
                  </button>
                  <button
                    onClick={reset}
                    className="min-h-11 rounded-full border border-[#B8B3AA]/18 px-4 text-sm font-bold text-[#F4EFE6]/72 transition hover:border-[#B8B3AA]/38"
                  >
                    Nuova Draft
                  </button>
                </motion.div>
              ) : draw && !isDrawing ? (
                <motion.div
                  key={`${draw.club}-${draw.season}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-1"
                >
                  {availablePlayers.length > 0 ? (
                    draftMode === "blind" ? (
                      <PositionGroupedPlayers players={availablePlayers} onSelect={selectPlayer} hideRating />
                    ) : (
                      availablePlayers.map((player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          onSelect={() => selectPlayer(player)}
                        />
                      ))
                    )
                  ) : (
                    <p className="border-l border-[#B8B3AA]/18 pl-4 text-sm font-medium text-[#F4EFE6]/66">
                      Nessun profilo disponibile per questo sorteggio. Prova un nuovo sorteggio.
                    </p>
                  )}
                </motion.div>
              ) : isDrawing ? (
                <motion.div
                  key="drawing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-l border-[#008CFF]/40 pl-4 text-sm font-semibold text-[#F4EFE6]"
                >
                  Il sorteggio è in corso. I giocatori appariranno tra un istante.
                </motion.div>
              ) : (
                <motion.p
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-l border-[#B8B3AA]/18 pl-4 text-sm font-medium text-[#F4EFE6]/66"
                >
                  Sorteggio in corso...
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
      <AnimatePresence>
        {pendingRoleChoice ? (
          <RoleChoicePanel
            player={pendingRoleChoice.player}
            options={pendingRoleChoice.options}
            onChoose={confirmPlayerRole}
            onCancel={cancelPlayerRoleChoice}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
