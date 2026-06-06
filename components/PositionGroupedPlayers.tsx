"use client";

import { motion } from "framer-motion";
import { PlayerCard } from "@/components/PlayerCard";
import type { Player, Position } from "@/lib/types";

type PositionGroupedPlayersProps = {
  players: Player[];
  onSelect: (player: Player) => void;
  hideRating?: boolean;
};

const groups: { position: Position; label: string }[] = [
  { position: "GK", label: "Portieri" },
  { position: "DEF", label: "Difensori" },
  { position: "MID", label: "Centrocampisti" },
  { position: "ATT", label: "Attaccanti" }
];

export function PositionGroupedPlayers({ players, onSelect, hideRating = false }: PositionGroupedPlayersProps) {
  return (
    <div className="grid gap-5">
      {groups.map((group) => {
        const groupPlayers = players.filter((player) => player.position === group.position);

        if (groupPlayers.length === 0) {
          return null;
        }

        return (
          <motion.section
            key={group.position}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-2"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="editorial-kicker">{group.label}</p>
              <span className="brushed-silver rounded-full border border-[#B8B3AA]/16 px-3 py-1 text-xs font-black text-[#F4EFE6]/66">
                {groupPlayers.length}
              </span>
            </div>
            <div className="grid gap-1">
              {groupPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={() => onSelect(player)}
                  hideRating={hideRating}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
