"use client";

import { motion } from "framer-motion";
import { formationConfig } from "@/lib/formations";
import { formatSeason } from "@/lib/players";
import { analyzeTeam, getDraftPlayers } from "@/lib/teamAnalysis";
import type { DraftSlot, FormationId, Player } from "@/lib/types";

type RatingRevealProps = {
  slots: DraftSlot[];
  formationId: FormationId;
  onContinue: () => void;
};

function getFootballIQ(overall: number) {
  if (overall >= 88) {
    return "Genio";
  }

  if (overall >= 84) {
    return "Occhio d'Elite";
  }

  if (overall >= 80) {
    return "Osservatore Fine";
  }

  return "Istinto Puro";
}

export function RatingReveal({ slots, formationId, onContinue }: RatingRevealProps) {
  const analysis = analyzeTeam(slots);
  const players = getDraftPlayers(slots).sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
  const footballIQ = getFootballIQ(analysis.overall);
  const formation = formationConfig[formationId];

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="blue-orb absolute -left-40 top-20 h-[32rem] w-[32rem] blur-3xl" />
      <div className="absolute right-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#B8B3AA]/8 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-[#B8B3AA]/10 pb-8"
        >
          <p className="editorial-kicker">Draft Cieca</p>
          <h1 className="editorial-title mt-5 text-6xl leading-[0.86] text-[#F4EFE6] sm:text-8xl">
            Il voto<br />nascosto.
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <ScoreCard label="Intuito Calcistico" value={footballIQ} />
            <ScoreCard label="Valore Squadra" value={analysis.overall} />
            <ScoreCard label="Miglior Giocatore" value={analysis.bestPlayer?.rating ?? "-"} meta={analysis.bestPlayer?.name} />
            <ScoreCard label="Punto Debole" value={analysis.weakestLink?.rating ?? "-"} meta={analysis.weakestLink?.name} />
          </div>

          <p className="mt-6 text-sm font-medium leading-6 text-[#B8B3AA]/62">
            Modulo {formation.name} / {formation.formation}. I voti erano nascosti durante la draft, ma la simulazione usa i valori reali.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="azzurro-button mt-7 min-h-14 w-full rounded-full px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Vai al Riepilogo Squadra
          </button>
        </motion.div>

        <div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {players.map((player, index) => (
              <RevealPlayerCard key={player.id} player={player} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ScoreCard({ label, value, meta }: { label: string; value: string | number; meta?: string }) {
  return (
    <div className="border-b border-[#B8B3AA]/12 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/58">{label}</p>
      <p className="editorial-title mt-2 text-4xl text-[#F4EFE6]">{value}</p>
      {meta ? <p className="mt-1 truncate text-xs font-medium text-[#B8B3AA]/60">{meta}</p> : null}
    </div>
  );
}

function RevealPlayerCard({ player, index }: { player: Player; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.11, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden border-b border-[#B8B3AA]/12 py-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.72 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.11 + 0.28, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="gold-reward absolute right-3 top-3 rounded-full border px-3 py-1.5 text-xl font-black"
      >
        {player.rating}
      </motion.div>
      <div className="pr-16">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/78">{player.position}</p>
        <h3 className="editorial-title mt-3 line-clamp-2 text-xl leading-tight text-[#F4EFE6]">{player.name}</h3>
        <p className="mt-3 truncate text-sm font-medium text-[#B8B3AA]/62">
          {player.club} · {formatSeason(player.season)}
        </p>
      </div>
    </motion.div>
  );
}
