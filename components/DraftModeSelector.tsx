"use client";

import { motion } from "framer-motion";
import type { DraftMode } from "@/lib/types";

type DraftModeSelectorProps = {
  draftMode: DraftMode;
  onChange: (draftMode: DraftMode) => void;
};

const modes: { id: DraftMode; label: string; description: string }[] = [
  { id: "normal", label: "Draft Classica", description: "Valutazioni visibili durante la draft" },
  { id: "blind", label: "Draft Cieca", description: "Valutazioni nascoste fino alla rivelazione" }
];

export function DraftModeSelector({ draftMode, onChange }: DraftModeSelectorProps) {
  return (
    <div className="relative border-y border-[#B8B3AA]/10 py-5">
      <div className="mb-4">
        <p className="editorial-kicker">Modalita Draft</p>
        <p className="mt-1 text-sm font-medium text-[#F4EFE6]/58">
          Scegli tra lettura completa e puro istinto calcistico.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {modes.map((mode) => {
          const active = draftMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`border-b px-0 py-3 text-left transition ${
                active
                  ? "border-[#008CFF]/70"
                  : "border-[#B8B3AA]/14 hover:border-[#B8B3AA]/32"
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-[#F4EFE6]">
                {mode.label}
              </span>
              <span className="mt-1 block text-xs font-medium text-[#B8B3AA]/62">{mode.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
