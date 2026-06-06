"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LeagueTable } from "@/components/season-simulation/LeagueTable";
import { MatchdayView } from "@/components/season-simulation/MatchdayView";
import { SeasonTimeline } from "@/components/season-simulation/SeasonTimeline";
import { SimulationController } from "@/components/season-simulation/SimulationController";
import { generateLeagueTable, USER_CLUB_NAME } from "@/lib/simulation";
import type { SeasonSimulationResult, SimulatedMatch } from "@/lib/simulation";

type SeasonSimulationProps = {
  result: SeasonSimulationResult;
  onComplete: () => void;
};

function getUserMatch(matches: SimulatedMatch[]) {
  return matches.find((match) => match.homeTeam === USER_CLUB_NAME || match.awayTeam === USER_CLUB_NAME) ?? matches[0];
}

function getResultLetter(match: SimulatedMatch) {
  const userGoals = match.homeTeam === USER_CLUB_NAME ? match.homeGoals : match.awayGoals;
  const opponentGoals = match.homeTeam === USER_CLUB_NAME ? match.awayGoals : match.homeGoals;

  if (userGoals > opponentGoals) {
    return "W";
  }

  if (userGoals === opponentGoals) {
    return "D";
  }

  return "L";
}

export function SeasonSimulation({ result, onComplete }: SeasonSimulationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const currentMatchday = result.matchdays[currentIndex];
  const revealedMatchdays = result.matchdays.slice(0, currentIndex + 1);
  const revealedMatches = revealedMatchdays.flatMap((matchday) => matchday.matches);
  const liveTable = useMemo(() => generateLeagueTable(revealedMatches, USER_CLUB_NAME), [revealedMatches]);
  const userMatch = getUserMatch(currentMatchday.matches);
  const streak = result.matchdays
    .slice(Math.max(0, currentIndex - 4), currentIndex + 1)
    .map((matchday) => getResultLetter(getUserMatch(matchday.matches)))
    .join("");
  const finished = currentIndex === result.matchdays.length - 1;

  useEffect(() => {
    if (finished) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCurrentIndex((index) => Math.min(index + 1, result.matchdays.length - 1));
    }, speed === 1 ? 1800 : 850);

    return () => window.clearTimeout(timeout);
  }, [currentIndex, finished, result.matchdays.length, speed]);

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="blue-orb absolute -left-40 top-20 h-[32rem] w-[32rem] blur-3xl" />
      <div className="absolute right-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#B8B3AA]/5 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <div className="grid content-start gap-8">
          <SimulationController speed={speed} onSpeedChange={setSpeed} onSkip={onComplete} />
          <MatchdayView matchday={currentMatchday} userMatch={userMatch} table={liveTable} streak={streak} />
          <SeasonTimeline matchdays={result.matchdays} currentIndex={currentIndex} />

          {finished ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onComplete}
              className="azzurro-button min-h-14 rounded-full px-5 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:brightness-110"
            >
              Vedi Risultati Stagione
            </motion.button>
          ) : null}
        </div>

        <div className="grid content-start gap-8">
          <LeagueTable table={liveTable} />
          <div className="border-b border-[#B8B3AA]/10 pb-5">
            <p className="editorial-kicker">Forma recente</p>
            <p className="editorial-title mt-3 text-5xl tracking-[0.04em] text-[#F4EFE6]">{streak}</p>
            <p className="mt-2 text-sm font-medium text-[#B8B3AA]/55">Ultime {streak.length} partite</p>
          </div>
        </div>
      </section>
    </main>
  );
}
