"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { formatSeason, getAvailableClubsForEra, getAvailableSeasonsForEra } from "@/lib/players";
import { useDraftStore } from "@/stores/draftStore";

const ITEM_HEIGHT = 56;
const REEL_ITEMS = 24;

function hashValue(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function buildReel(items: string[], target: string) {
  if (!target || items.length === 0) {
    return ["-"];
  }

  const seed = hashValue(target);
  const reel = Array.from({ length: REEL_ITEMS }, (_, index) => items[(seed + index * 5) % items.length]);

  return [...reel, target];
}

export function ClubDraw() {
  const draw = useDraftStore((state) => state.currentDraw);
  const drawAnimationType = useDraftStore((state) => state.drawAnimationType);
  const era = useDraftStore((state) => state.era);
  const isDrawing = useDraftStore((state) => state.isDrawing);
  const finishDrawAnimation = useDraftStore((state) => state.finishDrawAnimation);
  const picked = useDraftStore((state) => state.selectedPlayerIds.length);
  const eraClubs = useMemo(() => getAvailableClubsForEra(era), [era]);
  const seasonLabels = useMemo(() => getAvailableSeasonsForEra(era).map(formatSeason), [era]);
  const clubReel = useMemo(
    () => (drawAnimationType === "era" && draw?.club ? [draw.club] : buildReel(eraClubs, draw?.club ?? "")),
    [draw, drawAnimationType, eraClubs]
  );
  const seasonReel = useMemo(
    () => buildReel(seasonLabels, draw?.seasonLabel ?? ""),
    [draw, seasonLabels]
  );

  useEffect(() => {
    if (!draw || !isDrawing) {
      return;
    }

    const timeout = window.setTimeout(finishDrawAnimation, 2450);

    return () => window.clearTimeout(timeout);
  }, [draw, finishDrawAnimation, isDrawing]);

  return (
    <motion.section
      key={`${draw?.club}-${draw?.season}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative py-4"
    >
      <div className="flex items-center justify-between gap-6">
        <p className="editorial-kicker">Estrazione</p>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8B3AA]/48">
          {Math.min(picked + 1, 11)} / 11
        </p>
      </div>

      <div className="mt-8 grid gap-7">
        <Reel label="Club" values={clubReel} active={isDrawing && drawAnimationType === "club"} variant="club" />
        <Reel label="Stagione" values={seasonReel} active={isDrawing} delay={drawAnimationType === "club" ? 0.1 : 0} />
      </div>

      <div className="editorial-divider mt-8" />
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#B8B3AA]/42">
        {isDrawing
          ? drawAnimationType === "club"
            ? "Club e stagione in movimento"
            : "Stagione in movimento"
          : "Scegli con calma"}
      </p>
    </motion.section>
  );
}

function Reel({
  label,
  values,
  active,
  delay = 0,
  variant = "season"
}: {
  label: string;
  values: string[];
  active: boolean;
  delay?: number;
  variant?: "club" | "season";
}) {
  const itemHeight = variant === "club" ? 80 : ITEM_HEIGHT;
  const offset = -(values.length - 1) * itemHeight;

  return (
    <div className="overflow-hidden">
      <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.24em] text-[#008CFF]">{label}</p>
      <div className={`${variant === "club" ? "h-20" : "h-14"} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 bg-gradient-to-b from-[#070A0F]/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-5 bg-gradient-to-t from-[#070A0F]/85 to-transparent" />
        <motion.div
          key={`${label}-${values[values.length - 1]}`}
          initial={{ y: 0 }}
          animate={{ y: offset }}
          transition={{
            duration: active ? 2.25 : 0.01,
            delay,
            ease: [0.12, 0.78, 0.12, 1]
          }}
        >
          {values.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className={`${variant === "club" ? "h-20 text-6xl sm:text-7xl" : "h-14 text-4xl"} editorial-title flex items-center text-[#F4EFE6]`}
            >
              <span className="truncate">{value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
