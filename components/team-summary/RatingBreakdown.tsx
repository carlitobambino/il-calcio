"use client";

import { motion } from "framer-motion";
import type { TeamAnalysis } from "@/lib/teamAnalysis";

type RatingBreakdownProps = {
  analysis: TeamAnalysis;
};

const ratings = [
  ["Valore", "overall"],
  ["Attacco", "attack"],
  ["Centrocampo", "midfield"],
  ["Difesa", "defense"]
] as const;

export function RatingBreakdown({ analysis }: RatingBreakdownProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ratings.map(([label, key], index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-[#B8B3AA]/12 py-4"
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/58">{label}</p>
          <p className="editorial-title mt-2 text-5xl text-[#F4EFE6]">{analysis[key]}</p>
        </motion.div>
      ))}
    </div>
  );
}
