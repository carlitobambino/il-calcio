"use client";

import { motion } from "framer-motion";
import { availableEraBounds, eraPresets, getAvailableClubsForEra, getAvailableSeasonsForEra } from "@/lib/players";
import type { EraPresetId, EraSelection } from "@/lib/types";

type EraSelectorProps = {
  era: EraSelection;
  onChange: (era: EraSelection) => void;
  onPreset: (presetId: EraPresetId) => void;
};

const presetIds = Object.keys(eraPresets) as EraPresetId[];

function clampYear(value: number) {
  return Math.max(availableEraBounds.startYear, Math.min(availableEraBounds.endYear, value));
}

export function EraSelector({ era, onChange, onPreset }: EraSelectorProps) {
  const years = Array.from(
    { length: availableEraBounds.endYear - availableEraBounds.startYear + 1 },
    (_, index) => availableEraBounds.startYear + index
  );
  const availableClubs = getAvailableClubsForEra(era).length;
  const availableSeasons = getAvailableSeasonsForEra(era).length;

  return (
    <div className="relative border-b border-[#B8B3AA]/10 pb-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="editorial-kicker">Selezione Era</p>
          <p className="mt-1 text-sm font-medium text-[#F4EFE6]/58">
            {availableClubs} club · {availableSeasons} stagioni disponibili
          </p>
        </div>
        <div className="border-b border-[#B8B3AA]/18 pb-1 text-xs font-black text-[#F4EFE6]/60">
          {era.endYear - era.startYear + 1} stagioni
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <YearSelect
          label="Inizio"
          value={era.startYear}
          years={years}
          onChange={(startYear) => onChange({ startYear, endYear: Math.max(startYear, era.endYear) })}
        />
        <YearSelect
          label="Fine"
          value={era.endYear}
          years={years}
          onChange={(endYear) => onChange({ startYear: Math.min(era.startYear, endYear), endYear })}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {presetIds.map((presetId) => {
          const preset = eraPresets[presetId];
          const active = era.startYear === preset.era.startYear && era.endYear === preset.era.endYear;

          return (
            <motion.button
              key={presetId}
              type="button"
              onClick={() => onPreset(presetId)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`border-b px-0 py-3 text-left transition ${
                active
                  ? "border-[#008CFF]/70"
                  : "border-[#B8B3AA]/14 hover:border-[#B8B3AA]/32"
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-[0.16em] text-[#F4EFE6]">
                {preset.label}
              </span>
              <span className="mt-1 block text-xs font-medium text-[#B8B3AA]/62">{preset.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function YearSelect({
  label,
  value,
  years,
  onChange
}: {
  label: string;
  value: number;
  years: number[];
  onChange: (year: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#B8B3AA]/58">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(clampYear(Number(event.target.value)))}
        className="min-h-11 border-b border-[#B8B3AA]/18 bg-transparent px-0 text-sm font-black text-[#F4EFE6] outline-none transition focus:border-[#008CFF]/70"
      >
        {years.map((year) => (
          <option key={year} value={year} className="bg-[#070A0F] text-white">
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
