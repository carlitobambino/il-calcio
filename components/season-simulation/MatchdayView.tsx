"use client";

import { AnimatePresence, motion } from "framer-motion";
import { USER_CLUB_NAME } from "@/lib/simulation";
import type { LeagueTableRow, SeasonMatchday, SimulatedMatch } from "@/lib/simulation";
import { MatchResultCard } from "@/components/season-simulation/MatchResultCard";

type MatchdayViewProps = {
  matchday: SeasonMatchday;
  userMatch: SimulatedMatch;
  table: LeagueTableRow[];
  streak: string;
};

function getComment(match: SimulatedMatch, rank: number, streak: string) {
  const userGoals = match.homeTeam === USER_CLUB_NAME ? match.homeGoals : match.awayGoals;
  const opponentGoals = match.homeTeam === USER_CLUB_NAME ? match.awayGoals : match.homeGoals;

  if (userGoals > opponentGoals) {
    return streak.includes("W") ? "La squadra prende ritmo. Lo spogliatoio ci crede." : "Una vittoria pesante nella corsa di Serie A.";
  }

  if (userGoals === opponentGoals) {
    return rank <= 4 ? "Un punto gestito con maturità. La classifica resta viva." : "Un punto guadagnato, ma la pressione rimane.";
  }

  return "Una notte complicata. La prossima gara dirà molto sul carattere.";
}

export function MatchdayView({ matchday, userMatch, table, streak }: MatchdayViewProps) {
  const rank = table.findIndex((row) => row.club === USER_CLUB_NAME) + 1;
  const opponent = userMatch.homeTeam === USER_CLUB_NAME ? userMatch.awayTeam : userMatch.homeTeam;

  return (
    <div className="grid gap-5">
      <motion.div
        key={`header-${matchday.matchday}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-[#B8B3AA]/10 pb-6"
      >
        <p className="editorial-kicker">Giornata {matchday.matchday}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="editorial-title text-6xl leading-[0.86] text-[#F4EFE6] sm:text-8xl">{opponent}</h1>
          <div className="border-b border-[#B8B3AA]/18 pb-1 text-sm font-black uppercase tracking-[0.18em] text-[#F4EFE6]/62">
            Posizione live #{rank || "-"}
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-[#B8B3AA]/62">{getComment(userMatch, rank, streak)}</p>
      </motion.div>

      <AnimatePresence mode="wait">
        <MatchResultCard key={matchday.matchday} match={userMatch} />
      </AnimatePresence>
    </div>
  );
}
