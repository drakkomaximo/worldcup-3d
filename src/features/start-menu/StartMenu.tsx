"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type View } from "@/store/useAppStore";
import { useKeydown } from "@/hooks/useKeydown";
import { MusicToggle } from "@/components/MusicPlayer";

type OptionId = View | "teams";

const OPTIONS: { id: OptionId; title: string; subtitle: string; accent: string }[] = [
  {
    id: "groups",
    title: "GROUP STAGE",
    subtitle: "12 groups · 48 teams · Matchdays 1–3",
    accent: "#ffd75e",
  },
  {
    id: "knockout",
    title: "KNOCKOUT",
    subtitle: "Round of 32 → Final · Jul 19 · New Jersey",
    accent: "#4a6cf7",
  },
  {
    id: "teams",
    title: "TEAMS",
    subtitle: "48 nations · Star players · Scouting cards",
    accent: "#7dd87d",
  },
];

/**
 * Fighting-game / PES-style start screen.
 * ↑↓ / W S to move, Enter to confirm; hover also selects.
 */
export function StartMenu() {
  const enterStage = useAppStore((s) => s.enterStage);
  const openTeams = useAppStore((s) => s.openTeams);
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState<OptionId | null>(null);

  // Confirm → brief flash, then route to the picked screen
  const confirm = (id: OptionId) => {
    if (confirmed) return;
    setConfirmed(id);
    setTimeout(() => (id === "teams" ? openTeams() : enterStage(id)), 550);
  };

  useKeydown((e) => {
    if (confirmed) return;
    if (e.code === "ArrowUp" || e.code === "KeyW") {
      setIndex((i) => (i + OPTIONS.length - 1) % OPTIONS.length);
    } else if (e.code === "ArrowDown" || e.code === "KeyS") {
      setIndex((i) => (i + 1) % OPTIONS.length);
    } else if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      confirm(OPTIONS[index].id);
    }
  });

  return (
    <motion.div
      className="absolute inset-0 z-30 flex cursor-auto flex-col overflow-hidden bg-[#060a14]"
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      {/* ── Backdrop: diagonal sweep + stripes ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 10%, #101a33 0%, #060a14 55%), radial-gradient(60% 50% at 85% 90%, rgba(74,108,247,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="start-menu-stripes absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0px, #fff 2px, transparent 2px, transparent 90px)",
        }}
      />
      {/* Giant watermark year */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-8 bottom-[-10%] select-none text-[42vh] font-black leading-none tracking-tighter text-white/[0.035]"
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        2026
      </motion.span>

      {/* ── Header ── */}
      <motion.header
        className="relative z-10 flex items-center gap-3 px-10 pt-8"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-2xl">🏆</span>
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-zinc-400">
          United 2026 · Canada / Mexico / USA
        </span>
        <MusicToggle className="ml-auto" />
      </motion.header>

      {/* ── Title ── */}
      <div className="relative z-10 px-10 pt-[9vh]">
        <motion.p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.5em] text-[#ffd75e]"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          FIFA World Cup
        </motion.p>
        <motion.h1
          className="text-6xl font-black uppercase italic leading-none tracking-tight text-white md:text-8xl"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Select
          <span className="bg-gradient-to-r from-[#ffd75e] to-[#f7934a] bg-clip-text text-transparent"> Mode</span>
        </motion.h1>
      </div>

      {/* ── Options ── */}
      <nav className="relative z-10 mt-[7vh] flex flex-col gap-4 px-10 md:max-w-3xl">
        {OPTIONS.map((opt, i) => {
          const active = i === index;
          const isConfirmed = confirmed === opt.id;
          return (
            <motion.button
              key={opt.id}
              onMouseEnter={() => !confirmed && setIndex(i)}
              onClick={() => confirm(opt.id)}
              className="group relative block text-left outline-none"
              initial={{ x: -80, opacity: 0 }}
              animate={{
                x: active ? 24 : 0,
                opacity: confirmed && !isConfirmed ? 0.25 : 1,
                scale: isConfirmed ? 1.03 : 1,
              }}
              transition={{
                delay: confirmed ? 0 : 0.45 + i * 0.12,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                x: { type: "spring", stiffness: 300, damping: 26 },
              }}
            >
              {/* Skewed bar */}
              <div
                className="relative overflow-hidden border-l-4 py-5 pl-8 pr-12 transition-colors duration-200"
                style={{
                  transform: "skewX(-8deg)",
                  borderColor: active ? opt.accent : "rgba(255,255,255,0.12)",
                  background: active
                    ? `linear-gradient(90deg, ${opt.accent}26 0%, rgba(255,255,255,0.04) 60%, transparent 100%)`
                    : "rgba(255,255,255,0.03)",
                }}
              >
                {/* Confirm flash */}
                <AnimatePresence>
                  {isConfirmed ? (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="h-full w-full" style={{ background: opt.accent }} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div style={{ transform: "skewX(8deg)" }}>
                  <div className="flex items-center gap-4">
                    {/* Selector arrow */}
                    <motion.span
                      animate={{ opacity: active ? 1 : 0, x: active ? 0 : -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <span className="text-xl font-black" style={{ color: opt.accent }}>
                        ▶
                      </span>
                    </motion.span>
                    <h2
                      className={`text-3xl font-black uppercase italic tracking-wide transition-colors md:text-4xl ${
                        active ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {opt.title}
                    </h2>
                  </div>
                  <p
                    className={`mt-1 pl-9 text-xs font-medium uppercase tracking-[0.25em] transition-colors ${
                      active ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* ── Footer hints ── */}
      <motion.footer
        className="relative z-10 mt-auto flex items-center gap-6 px-10 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {[
          ["↑ ↓", "Select"],
          ["Enter", "Confirm"],
          ["Click", "Also works"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-zinc-100">
              {key}
            </kbd>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
          </div>
        ))}
      </motion.footer>
    </motion.div>
  );
}
