"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Team } from "@/data/types";
import { playerStats } from "@/domain/playerIdentity";
import { PlayerAvatar } from "./PlayerAvatar";

/** Character-select style player card with a stat sheet. */
export function PlayerCard({ name, team, index }: { name: string; team: Team; index: number }) {
  const { stats, ovr } = useMemo(() => playerStats(name, team.strength), [name, team.strength]);
  return (
    <motion.div
      className="group relative w-[240px] overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1d]/85 backdrop-blur transition-all duration-200 hover:-translate-y-2 hover:border-[#ffd75e]/60 hover:shadow-[0_0_50px_rgba(255,215,94,0.12)]"
      initial={{ y: 50, opacity: 0, scale: 0.94 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -30, opacity: 0, scale: 0.94 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay: 0.12 + index * 0.08,
      }}
    >
      {/* OVR badge */}
      <div className="absolute left-3 top-3 z-10 text-center">
        <p className="text-3xl font-black italic leading-none text-[#ffd75e]">{ovr}</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">OVR</p>
      </div>

      {/* Avatar on a team-color glow */}
      <div
        className="flex justify-center pt-4"
        style={{
          background: `radial-gradient(70% 90% at 50% 100%, ${team.primaryColor}33 0%, transparent 70%)`,
        }}
      >
        <PlayerAvatar name={name} team={team} size={132} />
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="truncate text-center text-sm font-black uppercase tracking-wide text-white">
          {name}
        </p>

        {/* Stat bars */}
        <div className="mt-3 flex flex-col gap-1.5">
          {stats.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="w-8 font-mono text-[10px] font-bold text-zinc-500">{s.key}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ delay: 0.35 + index * 0.08, duration: 0.6, ease: "easeOut" }}
                >
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      background: s.value >= 85 ? "#ffd75e" : s.value >= 72 ? "#7dd87d" : "#8b96ab",
                    }}
                  />
                </motion.div>
              </div>
              <span className="w-6 text-right font-mono text-[11px] font-bold text-zinc-300">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
