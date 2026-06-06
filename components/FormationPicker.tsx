"use client";

import { motion } from "framer-motion";
import { formationConfig, formationIds } from "@/lib/formations";
import type { FormationId } from "@/lib/types";

type FormationPickerProps = {
  selectedFormation: FormationId;
  onSelectFormation: (formationId: FormationId) => void;
  onStart: () => void;
  onBack: () => void;
};

const positionTone = {
  GK: "bg-[#B8B3AA]",
  DEF: "bg-[#008CFF]",
  MID: "bg-[#F4EFE6]",
  ATT: "bg-[#C8A45D]"
};

export function FormationPicker({
  selectedFormation,
  onSelectFormation,
  onStart,
  onBack
}: FormationPickerProps) {
  return (
    <main className="soft-grid relative min-h-screen overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="blue-orb absolute right-[-10rem] top-16 h-[30rem] w-[30rem] blur-3xl" />
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col gap-10">
        <button
          type="button"
          onClick={onBack}
          className="w-fit rounded-full border border-[#B8B3AA]/18 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F4EFE6]/70 transition hover:border-[#B8B3AA]/38 hover:text-white"
        >
          Torna al Menu
        </button>

        <div className="max-w-4xl">
          <h1 className="editorial-title mt-4 text-5xl leading-[0.9] text-[#F4EFE6] sm:text-7xl">
            Scegli<br />il sistema.
          </h1>
        </div>

        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {formationIds.map((formationId, index) => {
            const formation = formationConfig[formationId];
            const active = selectedFormation === formationId;

            return (
              <motion.button
                key={formationId}
                type="button"
                onClick={() => onSelectFormation(formationId)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex min-h-80 flex-col justify-between border-b p-0 pb-5 text-left transition duration-300 ${
                  active
                    ? "border-[#008CFF]/60"
                    : "border-[#B8B3AA]/16 hover:border-[#B8B3AA]/34"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="editorial-title text-5xl text-[#F4EFE6]">{formation.name}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#008CFF]">
                        {formation.formation}
                      </p>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${active ? "bg-[#008CFF] shadow-[0_0_16px_rgba(0,140,255,0.55)]" : "bg-[#B8B3AA]/30"}`} />
                  </div>
                  <p className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-[#F4EFE6]/70">
                    {formation.coach}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#B8B3AA]/55">
                    {formation.club} / {formation.era}
                  </p>
                </div>

                <div className="pitch-mini mt-7 flex h-48 flex-col justify-between p-4">
                  {formation.rows.map((row) => (
                    <div
                      key={row.position}
                      className="grid gap-1.5"
                      style={{ gridTemplateColumns: `repeat(${row.slots.length}, minmax(0, 1fr))` }}
                    >
                      {row.slots.map((slot, playerIndex) => (
                        <span
                          key={`${slot.subPosition}-${playerIndex}`}
                          className={`mx-auto h-4 w-4 rounded-full border border-[#F4EFE6]/45 ${positionTone[row.position]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="azzurro-button min-h-16 rounded-[1.5rem] px-6 text-base font-black text-white transition hover:brightness-110"
        >
          Inizia la Draft
        </motion.button>
      </section>
    </main>
  );
}
