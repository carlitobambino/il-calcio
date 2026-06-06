"use client";

import { motion } from "framer-motion";
import { PitchView } from "@/components/team-summary/PitchView";
import { RatingBreakdown } from "@/components/team-summary/RatingBreakdown";
import { TeamOverview } from "@/components/team-summary/TeamOverview";
import { formationConfig } from "@/lib/formations";
import { analyzeTeam } from "@/lib/teamAnalysis";
import type { DraftSlot, EraSelection, FormationId } from "@/lib/types";

type TeamSummaryProps = {
  slots: DraftSlot[];
  formationId: FormationId;
  era: EraSelection;
  onSimulateSeason: () => void;
  onBackToDraft: () => void;
};

export function TeamSummary({
  slots,
  formationId,
  era,
  onSimulateSeason,
  onBackToDraft
}: TeamSummaryProps) {
  const analysis = analyzeTeam(slots);
  const eraLabel = `${era.startYear}-${era.endYear}`;
  const formation = formationConfig[formationId];

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="blue-orb absolute -left-40 top-20 h-[32rem] w-[32rem] blur-3xl" />
      <div className="absolute right-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#B8B3AA]/8 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 xl:grid-cols-[minmax(0,1.32fr)_minmax(320px,0.68fr)] xl:gap-14">
        <div className="grid gap-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-[#B8B3AA]/10 pb-6"
          >
            <p className="editorial-kicker">Draft completata</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <h1 className="editorial-title text-6xl leading-[0.86] text-[#F4EFE6] sm:text-8xl">
                Identita<br />tattica.
              </h1>
              <div className="border-b border-[#B8B3AA]/18 pb-1 text-sm font-black uppercase tracking-[0.18em] text-[#F4EFE6]/62">
                {formation.name} · {formation.formation} · {eraLabel}
              </div>
            </div>
          </motion.div>

          <PitchView slots={slots} formationId={formationId} />
        </div>

        <div className="grid content-start gap-5">
          <TeamOverview
            analysis={analysis}
            formationId={`${formation.name} / ${formation.formation}`}
            eraLabel={eraLabel}
            onSimulateSeason={onSimulateSeason}
            onBackToDraft={onBackToDraft}
          />
          <RatingBreakdown analysis={analysis} />
        </div>
      </section>
    </main>
  );
}
