"use client";

import type { SeasonMatchday } from "@/lib/simulation";

type SeasonTimelineProps = {
  matchdays: SeasonMatchday[];
  currentIndex: number;
};

export function SeasonTimeline({ matchdays, currentIndex }: SeasonTimelineProps) {
  return (
    <div className="border-b border-[#B8B3AA]/10 pb-5">
      <p className="editorial-kicker">Sequenza</p>
      <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${matchdays.length}, minmax(0, 1fr))` }}>
        {matchdays.map((matchday, index) => (
          <div
            key={matchday.matchday}
            className={`h-2 rounded-full transition ${
              index <= currentIndex ? "bg-[#008CFF]" : "bg-[#B8B3AA]/14"
            }`}
            title={`Giornata ${matchday.matchday}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-[#B8B3AA]/58">
        Giornata {Math.min(currentIndex + 1, matchdays.length)} / {matchdays.length}
      </p>
    </div>
  );
}
