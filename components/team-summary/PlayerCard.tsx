"use client";

import { motion } from "framer-motion";
import { formatPosition } from "@/lib/labels";
import { formatSeason } from "@/lib/players";
import type { Player } from "@/lib/types";

type PlayerCardProps = {
  player: Player;
  index?: number;
};

export function PlayerCard({ player, index = 0 }: PlayerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.045, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-24 border-b border-[#B8B3AA]/12 p-2"
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#008CFF]/78">{formatPosition(player.position)}</p>
          <h3 className="editorial-title mt-2 line-clamp-2 text-lg leading-tight text-[#F4EFE6] sm:text-xl">
            {player.name}
          </h3>
        </div>
        <div className="editorial-title text-2xl leading-none text-[#F4EFE6]">
          {player.rating}
        </div>
      </div>
      <div className="relative mt-3 grid gap-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#B8B3AA]/56">
        <p className="truncate">{player.club}</p>
        <p>{formatSeason(player.season)}</p>
      </div>
    </motion.div>
  );
}
