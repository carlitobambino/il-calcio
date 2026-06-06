"use client";

import type { LeagueTableRow } from "@/lib/simulation";

type LeagueTableProps = {
  table: LeagueTableRow[];
};

export function LeagueTable({ table }: LeagueTableProps) {
  return (
    <div className="border-b border-[#B8B3AA]/10 pb-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="editorial-kicker">Classifica live</p>
          <h3 className="editorial-title mt-1 text-4xl text-[#F4EFE6]">Serie A</h3>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B8B3AA]/42">Aggiornata</p>
      </div>

      <div className="overflow-hidden border-y border-[#B8B3AA]/10">
        {table.slice(0, 8).map((row, index) => (
          <div
            key={row.club}
            className={`grid grid-cols-[2rem_minmax(0,1fr)_2.5rem_2.5rem] items-center gap-2 border-b border-[#B8B3AA]/10 py-2.5 text-sm last:border-b-0 ${
              row.isUser ? "bg-[#008CFF]/10 text-white" : "text-[#F4EFE6]/70"
            }`}
          >
            <span className="font-black text-[#B8B3AA]/55">{index + 1}</span>
            <span className="truncate font-black">{row.club}</span>
            <span className="text-center font-semibold">{row.points}</span>
            <span className="text-right text-xs font-medium text-[#B8B3AA]/55">
              {row.goalDifference > 0 ? "+" : ""}
              {row.goalDifference}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
