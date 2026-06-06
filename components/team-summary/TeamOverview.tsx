"use client";

import { motion } from "framer-motion";
import { formatPosition } from "@/lib/labels";
import type { TeamAnalysis } from "@/lib/teamAnalysis";

type TeamOverviewProps = {
  analysis: TeamAnalysis;
  formationId: string;
  eraLabel: string;
  onSimulateSeason: () => void;
  onBackToDraft: () => void;
};

export function TeamOverview({
  analysis,
  formationId,
  eraLabel,
  onSimulateSeason,
  onBackToDraft
}: TeamOverviewProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-[#B8B3AA]/10 pb-6"
    >
      <p className="editorial-kicker">Riepilogo Squadra</p>
      <h1 className="editorial-title mt-4 text-5xl leading-[0.86] text-[#F4EFE6] sm:text-7xl">
        La rosa<br />e pronta.
      </h1>
      <p className="mt-5 text-sm font-medium leading-6 text-[#B8B3AA]/62">
        Modulo {formationId} · Era {eraLabel}
      </p>

      <div className="mt-7 grid gap-3">
        <HighlightCard label="Miglior Giocatore" value={analysis.bestPlayer?.name ?? "-"} meta={analysis.bestPlayer ? `${analysis.bestPlayer.rating} · ${formatPosition(analysis.bestPlayer.position)}` : "-"} />
        <HighlightCard label="Punto Debole" value={analysis.weakestLink?.name ?? "-"} meta={analysis.weakestLink ? `${analysis.weakestLink.rating} · ${formatPosition(analysis.weakestLink.position)}` : "-"} />
      </div>

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="button"
          onClick={onSimulateSeason}
          className="azzurro-button min-h-14 rounded-full px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
        >
          Simula Stagione
        </button>
        <button
          type="button"
          onClick={onBackToDraft}
          className="min-h-12 rounded-full border border-[#B8B3AA]/18 px-5 text-sm font-bold text-[#F4EFE6]/72 transition hover:border-[#B8B3AA]/38"
        >
          Torna alla Draft
        </button>
      </div>
    </motion.aside>
  );
}

function HighlightCard({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="border-b border-[#B8B3AA]/12 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/70">{label}</p>
      <p className="editorial-title mt-2 truncate text-2xl text-[#F4EFE6]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[#B8B3AA]/62">{meta}</p>
    </div>
  );
}
