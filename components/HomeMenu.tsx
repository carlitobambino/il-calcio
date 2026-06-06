"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DraftModeSelector } from "@/components/DraftModeSelector";
import { EraSelector } from "@/components/EraSelector";
import type { DraftMode, EraPresetId, EraSelection } from "@/lib/types";

type HomeMenuProps = {
  onStartDraft: () => void;
  draftMode: DraftMode;
  onDraftModeChange: (draftMode: DraftMode) => void;
  era: EraSelection;
  onEraChange: (era: EraSelection) => void;
  onEraPreset: (presetId: EraPresetId) => void;
};

export function HomeMenu({
  onStartDraft,
  draftMode,
  onDraftModeChange,
  era,
  onEraChange,
  onEraPreset
}: HomeMenuProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.035, 1], opacity: [0.28, 0.42, 0.28] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="blue-orb absolute -left-32 top-8 h-80 w-80 blur-3xl sm:h-[34rem] sm:w-[34rem]"
      />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#B8B3AA]/8 blur-3xl" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center gap-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="editorial-kicker">Archivio Calcio Italiano</p>
          </div>
        </div>

        <div className="grid items-end gap-20 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="editorial-title max-w-5xl text-[5.8rem] leading-[0.78] text-[#F4EFE6] sm:text-[9rem] lg:text-[13rem]">
              Il<br />
              <span className="text-[#008CFF]">Calcio</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl font-medium leading-8 text-[#F4EFE6]/68 sm:text-2xl">
              Componi il più grande XI della storia del calcio.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative grid gap-6">
              <DraftModeSelector draftMode={draftMode} onChange={onDraftModeChange} />
              <EraSelector era={era} onChange={onEraChange} onPreset={onEraPreset} />
              <MenuButton label="Inizia la Draft" primary onClick={onStartDraft} />
              <MenuButton label="Come Si Gioca" onClick={() => setShowRules((value) => !value)} />
            </div>

            <AnimatePresence>
              {showRules ? (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  className="relative mt-6 border-l border-[#B8B3AA]/18 pl-5 text-sm font-medium leading-7 text-[#F4EFE6]/66"
                >
                  Scegli un modulo, osserva il sorteggio club-stagione e costruisci il tuo XI con i profili compatibili. I nuovi sorteggi sono limitati: ogni scelta pesa.
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>

      </section>
    </main>
  );
}

function MenuButton({
  label,
  primary = false,
  onClick
}: {
  label: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`group border-b px-0 py-5 text-left transition duration-300 ${
        primary
          ? "border-[#008CFF]/55 text-white hover:border-[#F4EFE6]/45"
          : "border-[#B8B3AA]/16 text-[#F4EFE6] hover:border-[#B8B3AA]/34"
      }`}
    >
      <span className="editorial-title flex items-center justify-between text-4xl">
        {label}
        <span className="text-sm font-black transition group-hover:translate-x-1">
          -&gt;
        </span>
      </span>
    </motion.button>
  );
}
