"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEAMS } from "@/data/teams";
import { flagUrl } from "@/lib/flags";
import { useKeydown } from "@/hooks/useKeydown";
import { useAppStore } from "@/store/useAppStore";
import { TeamBackdrop } from "./TeamBackdrop";
import { PlayerCard } from "./PlayerCard";
import { TeamFactsCard } from "./TeamFactsCard";
import { FlagRoster } from "./FlagRoster";
import { useTeamAnthem } from "./useTeamAnthem";

const COLS = 12; // roster grid columns — ↑↓ jump one row

/**
 * Character-select screen: pick a nation from the flag grid,
 * see a country-themed backdrop, its anthem-motif, the squad's star
 * player cards and the nation's World Cup record.
 */
export function TeamSelect() {
  const goToMenu = useAppStore((s) => s.goToMenu);
  const [idx, setIdx] = useState(0);
  const team = TEAMS[idx];
  const n = TEAMS.length;

  // Soft per-country music while browsing
  useTeamAnthem(team);

  // Keyboard: ←→ step, ↑↓ jump a roster row, Esc back
  useKeydown((e) => {
    if (e.code === "ArrowRight" || e.code === "KeyD") setIdx((i) => (i + 1) % n);
    else if (e.code === "ArrowLeft" || e.code === "KeyA") setIdx((i) => (i + n - 1) % n);
    else if (e.code === "ArrowDown" || e.code === "KeyS") setIdx((i) => (i + COLS) % n);
    else if (e.code === "ArrowUp" || e.code === "KeyW") setIdx((i) => (i + n - COLS) % n);
    else if (e.code === "Escape") goToMenu();
  });

  return (
    <motion.div
      className="absolute inset-0 z-30 flex cursor-auto flex-col overflow-hidden bg-[#060a14]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Country backdrop: giant blurred flag + national color glow ── */}
      <TeamBackdrop team={team} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-10 pt-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#ffd75e]">
            FIFA World Cup 2026
          </p>
          <h1 className="text-4xl font-black uppercase italic tracking-tight text-white md:text-5xl">
            Select Team
          </h1>
        </div>
        <button
          onClick={goToMenu}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          ← Menu
        </button>
      </header>

      {/* ── Team identity + player cards ──
          One single animated wrapper per team: the whole block crossfades
          in place, so the layout (and the flag roster below) never shifts. */}
      <div className="relative z-10 mt-2 flex flex-1 flex-col px-6">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={team.id}
            className="flex h-full w-full flex-1 flex-col items-center justify-center gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Identity */}
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagUrl(team.iso2, 160)}
                alt={team.name}
                className="h-12 w-[72px] rounded-md border border-white/20 object-cover shadow-lg"
              />
              <div>
                <h2 className="text-3xl font-black uppercase italic leading-none text-white md:text-4xl">
                  {team.name}
                </h2>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
                  {team.confederation} · Group {team.group} · FIFA #{team.fifaRanking}
                </p>
              </div>
            </div>

            {/* Squad stars + nation scorecard */}
            <div className="flex flex-wrap items-stretch justify-center gap-5">
              {team.keyPlayers.map((p, i) => (
                <PlayerCard key={p} name={p} team={team} index={i} />
              ))}
              <TeamFactsCard team={team} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Flag grid: the character-select roster ── */}
      <div className="relative z-10">
        <FlagRoster idx={idx} onPick={setIdx} />
      </div>
    </motion.div>
  );
}
