"use client";

import { motion } from "framer-motion";
import { USER_CLUB_NAME } from "@/lib/simulation";
import type { SimulatedMatch } from "@/lib/simulation";

type MatchResultCardProps = {
  match: SimulatedMatch;
};

export function MatchResultCard({ match }: MatchResultCardProps) {
  const isHome = match.homeTeam === USER_CLUB_NAME;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const userGoals = isHome ? match.homeGoals : match.awayGoals;
  const opponentGoals = isHome ? match.awayGoals : match.homeGoals;
  const result = userGoals > opponentGoals ? "Vittoria" : userGoals === opponentGoals ? "Pareggio" : "Sconfitta";
  const tone = result === "Vittoria" ? "border-[#008CFF]/45" : result === "Pareggio" ? "border-[#B8B3AA]/18" : "border-rose-200/24";

  return (
    <motion.div
      key={`${match.homeTeam}-${match.awayTeam}-${match.homeGoals}-${match.awayGoals}`}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden border-b pb-6 ${tone}`}
    >
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#008CFF]">{isHome ? "Casa" : "Trasferta"}</p>
          <h2 className="editorial-title mt-3 text-4xl text-[#F4EFE6]">{opponent}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/48">{result}</p>
          <p className="editorial-title mt-2 text-6xl text-[#F4EFE6]">
            {userGoals}-{opponentGoals}
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/42">Marcatori</p>
        {match.goalEvents?.length ? (
          <div className="mt-3 grid gap-2">
            {match.goalEvents.map((event, index) => (
              <p key={`${event.playerId}-${event.minute}-${index}`} className="text-sm font-semibold text-[#F4EFE6]/82">
                {event.minute}&apos; {event.playerName}
                {event.assistPlayerName ? <span className="text-[#B8B3AA]/50"> · assist {event.assistPlayerName}</span> : null}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-[#B8B3AA]/58">Nessun gol del Draft XI.</p>
        )}
      </div>
    </motion.div>
  );
}
