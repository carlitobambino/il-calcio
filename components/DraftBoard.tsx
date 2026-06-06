"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PitchPlayerMarker } from "@/components/PitchPlayerMarker";
import { formationConfig } from "@/lib/formations";
import { formatPosition } from "@/lib/labels";
import { formatSeason } from "@/lib/players";
import { useDraftStore } from "@/stores/draftStore";
import type { Player } from "@/lib/types";

function EmptySlot() {
  return (
    <motion.div
      initial={{ opacity: 0.65 }}
      animate={{
        opacity: 0.72,
        scale: 1
      }}
      className="flex min-h-20 items-center justify-center p-2 text-center"
    >
      <span className="h-10 w-10 rounded-full border border-dashed border-[#B8B3AA]/18" />
    </motion.div>
  );
}

function rowWidthClass(count: number) {
  if (count <= 1) {
    return "max-w-[9rem]";
  }
  if (count === 2) {
    return "max-w-xl";
  }
  if (count === 3) {
    return "max-w-3xl";
  }
  if (count === 4) {
    return "max-w-4xl";
  }
  return "max-w-5xl";
}

export function DraftBoard() {
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const slots = useDraftStore((state) => state.slots);
  const formationId = useDraftStore((state) => state.formationId);
  const draftMode = useDraftStore((state) => state.draftMode);
  const rows = formationConfig[formationId].rows;
  const filledSlotIds = slots.filter((slot) => slot.player).map((slot) => slot.id);

  return (
    <div className="grid gap-5">
      <section className="pitch-lines -mx-5 flex min-h-[30rem] flex-1 flex-col justify-between gap-6 px-5 py-10 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div aria-hidden className="absolute inset-x-[28%] top-[8.5%] h-[13%] border border-t-0 border-[#F4EFE6]/10" />
        <div aria-hidden className="absolute inset-x-[38%] top-[8.5%] h-[6.5%] border border-t-0 border-[#F4EFE6]/[0.07]" />
        <div aria-hidden className="absolute inset-x-[28%] bottom-[8.5%] h-[13%] border border-b-0 border-[#F4EFE6]/10" />
        <div aria-hidden className="absolute inset-x-[38%] bottom-[8.5%] h-[6.5%] border border-b-0 border-[#F4EFE6]/[0.07]" />
        {rows.map((row) => {
          const rowSlots = slots.filter((slot) => slot.position === row.position);

          return (
            <div
              key={row.position}
              className={`mx-auto grid w-full items-start gap-2 sm:gap-3 ${rowWidthClass(rowSlots.length)}`}
              style={{ gridTemplateColumns: `repeat(${rowSlots.length}, minmax(0, 1fr))` }}
            >
              {rowSlots.map((slot) => {
                const index = filledSlotIds.indexOf(slot.id);

                return (
                  <div key={slot.id} className="min-w-0">
                    {slot.player ? (
                      <PitchPlayerMarker
                        player={slot.player}
                        index={index}
                        role={slot.subPosition}
                        hideRating={draftMode === "blind"}
                        onInspect={setInspectedPlayer}
                      />
                    ) : (
                      <EmptySlot />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>

      {inspectedPlayer ? (
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 border-t border-[#B8B3AA]/10 pt-4 text-sm">
          <div className="min-w-0">
            <p className="editorial-kicker">Dettaglio Giocatore</p>
            <p className="mt-1 truncate font-black text-[#F4EFE6]">{inspectedPlayer.name}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B8B3AA]/58">
            {inspectedPlayer.sub_positions?.join(" / ") ?? formatPosition(inspectedPlayer.position)} / {inspectedPlayer.club} / {formatSeason(inspectedPlayer.season)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
