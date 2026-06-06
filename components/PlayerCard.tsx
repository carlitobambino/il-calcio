"use client";

import { motion } from "framer-motion";
import { formatPosition } from "@/lib/labels";
import { formatSeason } from "@/lib/players";
import type { Player } from "@/lib/types";

type PlayerCardProps = {
  player: Player;
  onSelect?: () => void;
  compact?: boolean;
  hideRating?: boolean;
};

export function PlayerCard({ player, onSelect, compact = false, hideRating = false }: PlayerCardProps) {
  const roles = player.sub_positions?.length ? player.sub_positions.join(" / ") : formatPosition(player.position);

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      data-testid={onSelect ? "player-option" : "draft-slot-player"}
      whileHover={onSelect ? { y: -5, scale: 1.012 } : undefined}
      whileTap={onSelect ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative w-full border-b border-[#B8B3AA]/12 text-left transition duration-300 ${
        onSelect ? "cursor-pointer hover:border-[#F4EFE6]/32" : "cursor-default"
      } ${compact ? "px-1 py-3" : "px-0 py-4"}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#008CFF]">
              {roles}
            </span>
            <span className="h-px w-8 bg-[#B8B3AA]/18 transition group-hover:w-12 group-hover:bg-[#F4EFE6]/34" />
          </div>
          <h3 className="editorial-title mt-2 truncate text-2xl leading-none text-[#F4EFE6] transition group-hover:translate-x-1 sm:text-3xl">
            {player.name}
          </h3>
          <p className="mt-2 truncate text-xs font-medium uppercase tracking-[0.14em] text-[#B8B3AA]/58">
            {player.club} / {formatSeason(player.season)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="editorial-title text-3xl leading-none text-[#F4EFE6]">
            {hideRating ? "??" : player.rating}
          </p>
          <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#B8B3AA]/45">voto</p>
        </div>
      </div>
    </motion.button>
  );
}
