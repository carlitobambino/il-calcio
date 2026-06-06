"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { isDraftComplete, MAX_CLUB_REROLLS, MAX_ERA_REROLLS } from "@/lib/draft";
import { useDraftStore } from "@/stores/draftStore";

export function RerollButton() {
  const changeClub = useDraftStore((state) => state.changeClub);
  const changeEra = useDraftStore((state) => state.changeEra);
  const clubRerollsUsed = useDraftStore((state) => state.clubRerollsUsed);
  const eraRerollsUsed = useDraftStore((state) => state.eraRerollsUsed);
  const isDrawing = useDraftStore((state) => state.isDrawing);
  const slots = useDraftStore((state) => state.slots);
  const isComplete = useMemo(() => isDraftComplete(slots), [slots]);
  const clubRemaining = MAX_CLUB_REROLLS - clubRerollsUsed;
  const eraRemaining = MAX_ERA_REROLLS - eraRerollsUsed;
  const clubDisabled = clubRemaining <= 0 || isComplete || isDrawing;
  const eraDisabled = eraRemaining <= 0 || isComplete || isDrawing;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      <RerollAction
        label="Cambia Club"
        remaining={clubRemaining}
        disabled={clubDisabled}
        onClick={changeClub}
      />
      <RerollAction
        label="Cambia Era"
        remaining={eraRemaining}
        disabled={eraDisabled}
        onClick={changeEra}
      />
    </div>
  );
}

function RerollAction({
  label,
  remaining,
  disabled,
  onClick
}: {
  label: string;
  remaining: number;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      whileHover={!disabled ? { y: -2 } : undefined}
      className="min-h-11 border border-[#B8B3AA]/18 px-3 text-left text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#F4EFE6] transition hover:border-[#008CFF]/55 disabled:cursor-not-allowed disabled:text-white/28"
    >
      <span className="block">{label}</span>
      <span className="mt-1 block text-[#B8B3AA]/50">{remaining} rimasti</span>
    </motion.button>
  );
}
