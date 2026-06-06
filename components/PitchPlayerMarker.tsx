"use client";

import { motion } from "framer-motion";
import { formatPosition } from "@/lib/labels";
import { formatSeason } from "@/lib/players";
import type { Player, SubPosition } from "@/lib/types";

type PitchPlayerMarkerProps = {
  player: Player;
  hideRating?: boolean;
  index?: number;
  role?: SubPosition;
  onInspect?: (player: Player) => void;
};

export function PitchPlayerMarker({ player, hideRating = false, index = 0, role, onInspect }: PitchPlayerMarkerProps) {
  const rating = hideRating ? "??" : player.rating;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.035, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onInspect?.(player)}
      className="group relative mx-auto flex w-full max-w-[6.75rem] flex-col items-center gap-1.5 text-center outline-none"
      aria-label={`${player.name}, voto ${rating}`}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full border border-[#008CFF]/48 bg-[#070A0F]/58 text-sm font-black text-[#F4EFE6] transition group-hover:border-[#F4EFE6]/50 group-focus-visible:border-[#F4EFE6]/65 sm:h-12 sm:w-12 sm:text-base">
        {rating}
      </span>
      <span className="max-w-full truncate text-[0.62rem] font-bold uppercase tracking-[0.07em] text-[#F4EFE6]/78 transition group-hover:text-[#F4EFE6] sm:text-[0.68rem]">
        {player.name}
      </span>

      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.55rem)] z-20 hidden w-52 -translate-x-1/2 border border-[#B8B3AA]/14 bg-[#070A0F]/95 p-3 text-left text-xs text-[#B8B3AA]/72 shadow-xl group-hover:block group-focus-visible:block">
        <span className="block font-black uppercase tracking-[0.18em] text-[#008CFF]">{role ?? formatPosition(player.position)}</span>
        <span className="mt-2 block truncate text-sm font-black text-[#F4EFE6]">{player.name}</span>
        <span className="mt-1 block truncate">{player.club}</span>
        <span className="block">{formatSeason(player.season)}</span>
      </span>
    </motion.button>
  );
}
