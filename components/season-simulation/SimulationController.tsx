"use client";

import { motion } from "framer-motion";

type SimulationControllerProps = {
  speed: 1 | 2;
  onSpeedChange: (speed: 1 | 2) => void;
  onSkip: () => void;
};

export function SimulationController({ speed, onSpeedChange, onSkip }: SimulationControllerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B8B3AA]/10 pb-5">
      <div>
        <p className="editorial-kicker">Ritmo simulazione</p>
        <p className="mt-1 text-sm font-medium text-[#B8B3AA]/55">Calcolata in anticipo, rivelata giornata dopo giornata.</p>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2].map((value) => (
          <motion.button
            key={value}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSpeedChange(value as 1 | 2)}
            className={`min-h-10 rounded-full px-4 text-xs font-black uppercase tracking-[0.16em] transition ${
              speed === value ? "bg-[#008CFF] text-white" : "border border-[#B8B3AA]/14 text-[#F4EFE6]/70"
            }`}
          >
            x{value}
          </motion.button>
        ))}
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSkip}
          className="min-h-10 rounded-full border border-[#B8B3AA]/18 px-4 text-xs font-black uppercase tracking-[0.16em] text-[#F4EFE6]/72 transition hover:border-[#B8B3AA]/38"
        >
          Salta
        </motion.button>
      </div>
    </div>
  );
}
