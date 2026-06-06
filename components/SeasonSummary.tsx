"use client";

import { motion } from "framer-motion";
import { formatPosition } from "@/lib/labels";
import type { SeasonSimulationResult } from "@/lib/simulation";

type SeasonSummaryProps = {
  result: SeasonSimulationResult;
  onNewDraft: () => void;
  onBackToMenu: () => void;
};

export function SeasonSummary({ result, onNewDraft, onBackToMenu }: SeasonSummaryProps) {
  const rank = result.table.findIndex((row) => row.isUser) + 1;
  const topScorers = [...result.playerStats].sort((a, b) => b.goals - a.goals || b.assists - a.assists).slice(0, 5);
  const topAssists = [...result.playerStats].sort((a, b) => b.assists - a.assists || b.goals - a.goals).slice(0, 5);

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="blue-orb absolute -left-40 top-20 h-[32rem] w-[32rem] blur-3xl" />
      <div className="absolute right-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#B8B3AA]/8 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-[#B8B3AA]/10 pb-8"
        >
          <p className="editorial-kicker">Stagione conclusa</p>
          <h1 className="editorial-title mt-5 text-6xl leading-[0.86] text-[#F4EFE6] sm:text-8xl">
            Il verdetto<br />finale.
          </h1>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <StatCard label="Posizione" value={`#${rank}`} />
            <StatCard label="Punti" value={result.userRow.points} />
            <StatCard label="Gol fatti" value={result.userRow.goalsFor} />
            <StatCard label="Gol subiti" value={result.userRow.goalsAgainst} />
          </div>

          <div className="mt-7 border-y border-[#B8B3AA]/10 py-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#B8B3AA]/52">Bilancio stagionale</p>
            <p className="editorial-title mt-3 text-4xl text-[#F4EFE6]">
              {result.userRow.wins}W / {result.userRow.draws}D / {result.userRow.losses}L
            </p>
            <p className="mt-2 text-sm font-medium text-[#B8B3AA]/62">
              Valore squadra: {Math.round(result.teamStrength.overall)} generale, {Math.round(result.teamStrength.attack)} attacco, {Math.round(result.teamStrength.defense)} difesa.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <LeaderCard label="Capocannoniere" name={result.topScorer?.name ?? "-"} value={`${result.topScorer?.goals ?? 0} gol`} />
            <LeaderCard label="Miglior Assistman" name={result.topAssister?.name ?? "-"} value={`${result.topAssister?.assists ?? 0} assist`} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onNewDraft}
              className="azzurro-button min-h-12 flex-1 rounded-full px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            >
              Nuova Draft
            </button>
            <button
              type="button"
              onClick={onBackToMenu}
              className="min-h-12 flex-1 rounded-full border border-[#B8B3AA]/18 px-5 text-sm font-bold text-[#F4EFE6]/72 transition hover:border-[#B8B3AA]/38"
            >
              Torna al Menu
            </button>
          </div>
        </motion.div>

        <div className="grid gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="border-b border-[#B8B3AA]/10 pb-5"
          >
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="editorial-kicker">Classifica finale</p>
                <h2 className="editorial-title mt-1 text-4xl text-[#F4EFE6]">Serie A</h2>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#B8B3AA]/48">38 partite</p>
            </div>

            <div className="overflow-hidden border-y border-[#B8B3AA]/10">
              {result.table.map((row, index) => (
                <div
                  key={row.club}
                  className={`grid grid-cols-[2.2rem_minmax(0,1fr)_2.5rem_2.5rem_2.5rem_3rem] items-center gap-2 border-b border-[#B8B3AA]/10 px-3 py-2.5 text-sm last:border-b-0 ${
                    row.isUser ? "bg-[#008CFF]/10 text-white" : "text-[#F4EFE6]/70"
                  }`}
                >
                  <span className="font-black text-[#B8B3AA]/58">{index + 1}</span>
                  <span className="truncate font-black">{row.club}</span>
                  <span className="text-center font-semibold">{row.points}</span>
                  <span className="text-center text-xs font-medium text-[#B8B3AA]/58">{row.wins}W</span>
                  <span className="text-center text-xs font-medium text-[#B8B3AA]/58">{row.draws}D</span>
                  <span className="text-right text-xs font-medium text-[#B8B3AA]/58">{row.goalDifference > 0 ? "+" : ""}{row.goalDifference}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-5 xl:grid-cols-2">
            <PlayerStatList title="Gol" rows={topScorers} valueKey="goals" />
            <PlayerStatList title="Assist" rows={topAssists} valueKey="assists" />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-[#B8B3AA]/12 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/58">{label}</p>
      <p className="editorial-title mt-2 text-4xl text-[#F4EFE6]">{value}</p>
    </div>
  );
}

function LeaderCard({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <div className="border-b border-[#C8A45D]/24 py-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F5DFAD]/78">{label}</p>
      <p className="editorial-title mt-2 truncate text-2xl text-[#F4EFE6]">{name}</p>
      <p className="mt-1 text-sm font-medium text-[#F5DFAD]/66">{value}</p>
    </div>
  );
}

function PlayerStatList({
  title,
  rows,
  valueKey
}: {
  title: string;
  rows: SeasonSimulationResult["playerStats"];
  valueKey: "goals" | "assists";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-[#B8B3AA]/10 pb-4"
    >
      <p className="editorial-kicker">{title}</p>
      <div className="mt-3 grid gap-2">
        {rows.map((row, index) => (
          <div key={`${title}-${row.playerId}`} className="flex items-center justify-between gap-3 border-b border-[#B8B3AA]/10 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#F4EFE6]">
                {index + 1}. {row.name}
              </p>
              <p className="text-xs font-medium text-[#B8B3AA]/58">{formatPosition(row.position)} - {row.club}</p>
            </div>
            <p className="editorial-title text-2xl text-[#F4EFE6]">{row[valueKey]}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
