"use client";

import { motion } from "framer-motion";
import type { Player, SubPosition } from "@/lib/types";

type RoleChoicePanelProps = {
  player: Player;
  options: SubPosition[];
  onChoose: (subPosition: SubPosition) => void;
  onCancel: () => void;
};

export function RoleChoicePanel({ player, options, onChoose, onCancel }: RoleChoicePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="fixed inset-x-4 bottom-5 z-40 mx-auto max-w-lg border border-[#B8B3AA]/18 bg-[#070A0F]/95 p-5 text-[#F4EFE6] shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="editorial-kicker">Scegli Ruolo</p>
          <h3 className="editorial-title mt-2 truncate text-3xl">{player.name}</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-black uppercase tracking-[0.18em] text-[#B8B3AA]/58 transition hover:text-[#F4EFE6]"
        >
          Annulla
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChoose(option)}
            className="min-h-12 border border-[#008CFF]/35 px-4 text-sm font-black uppercase tracking-[0.14em] text-[#F4EFE6] transition hover:border-[#F4EFE6]/50"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
