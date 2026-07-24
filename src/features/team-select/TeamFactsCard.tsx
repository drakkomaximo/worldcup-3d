"use client";

import { motion } from "framer-motion";
import type { Team } from "@/data/types";
import { TEAM_FACTS } from "@/data/teamFacts";
import { runIn2026 } from "@/domain/tournamentQuery";
import { useAppStore } from "@/store/useAppStore";

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-2 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <span className="text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

/** Compact nation scorecard shown next to the player cards.
 * `index` continues the PlayerCard stagger so all cards move in sync. */
export function TeamFactsCard({ team, index = 3 }: { team: Team; index?: number }) {
  const tournament = useAppStore((s) => s.tournament);
  const facts = TEAM_FACTS[team.id];
  if (!facts) return null;

  return (
    <motion.div
      className="w-[240px] self-stretch overflow-hidden rounded-xl border border-white/10 bg-[#0a0f1d]/85 backdrop-blur"
      initial={{ y: 50, opacity: 0, scale: 0.94 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.12 + index * 0.08 }}
    >
      <div
        className="px-4 py-3"
        style={{
          background: `linear-gradient(120deg, ${team.primaryColor}2e 0%, transparent 70%)`,
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ffd75e]">
          Nation Card
        </p>
        <p className="text-lg font-black uppercase italic leading-tight text-white">
          World Cup Record
        </p>
      </div>

      <div className="px-4 pb-4">
        <FactRow label="Appearances" value={`${facts.apps}`} />
        <FactRow label="Titles" value={facts.titles > 0 ? `🏆 ${facts.titles}` : "0"} />
        <FactRow label="Best finish" value={facts.best} />
        <FactRow label="Run in 2026" value={runIn2026(team, tournament)} />
        <FactRow
          label="Host nation"
          value={facts.hosted.length > 0 ? facts.hosted.join(" · ") : "Never"}
        />
      </div>
    </motion.div>
  );
}
