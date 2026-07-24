"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchTeamDetail } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import type { Match, TeamDetail } from "@/data/types";

const STAGE_LABELS: Record<string, string> = {
  group: "Group Stage",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  "3P": "Third place",
  F: "Final",
  champion: "CHAMPION 🏆",
};

function MatchRow({ match, teamId }: { match: Match; teamId: string }) {
  const isHome = match.homeId === teamId;
  const us = isHome ? match.homeScore : match.awayScore;
  const them = isHome ? match.awayScore : match.homeScore;
  const rival = isHome ? match.awayId : match.homeId;
  const won = match.winnerId ? match.winnerId === teamId : us > them;
  const drawn = us === them && !match.winnerId;

  return (
    <li className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
      <span className="text-zinc-400">
        {match.stage === "group" ? `vs ${rival}` : `${match.stage} · vs ${rival}`}
      </span>
      <span
        className={`font-mono font-bold ${
          drawn ? "text-zinc-300" : won ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {us} - {them}
        {match.penalties ? (
          <span className="ml-1 text-xs text-zinc-500">
            ({match.penalties.home}-{match.penalties.away} pens)
          </span>
        ) : null}
      </span>
    </li>
  );
}

/** Slide-in panel with the full team card. Opens after the goal animation. */
export function TeamPanel() {
  const selectedTeamId = useAppStore((s) => s.selectedTeamId);
  const selectTeam = useAppStore((s) => s.selectTeam);
  const [detail, setDetail] = useState<TeamDetail | null>(null);

  useEffect(() => {
    if (!selectedTeamId) return;
    setDetail(null);
    fetchTeamDetail(selectedTeamId).then(setDetail).catch(() => selectTeam(null));
  }, [selectedTeamId, selectTeam]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") selectTeam(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectTeam]);

  return (
    <AnimatePresence>
      {selectedTeamId ? (
        <motion.aside
          key={selectedTeamId}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="no-scrollbar absolute inset-y-0 right-0 z-30 w-full max-w-md cursor-auto overflow-y-auto border-l border-white/10 bg-[#0a0f1d]/95 p-6 backdrop-blur"
        >
          <button
            onClick={() => selectTeam(null)}
            className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close panel"
          >
            ✕
          </button>

          {!detail ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              Loading team…
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <img
                  src={`https://flagcdn.com/w80/${detail.team.iso2}.png`}
                  alt={`${detail.team.name} flag`}
                  className="h-12 w-auto rounded shadow"
                />
                <div>
                  <h2 className="text-2xl font-black text-white">{detail.team.name}</h2>
                  <p className="text-xs text-zinc-400">
                    FIFA #{detail.team.fifaRanking} · {detail.team.confederation} · Group{" "}
                    {detail.group}
                  </p>
                </div>
              </div>

              {/* Run reached */}
              <div
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  detail.runReached === "champion"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : detail.eliminated
                      ? "bg-red-500/10 text-red-300"
                      : "bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {detail.runReached === "champion"
                  ? "World Champion 🏆"
                  : `Reached: ${STAGE_LABELS[detail.runReached] ?? detail.runReached}`}
              </div>

              {/* Group standing */}
              {detail.standing ? (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Group {detail.group} record
                  </h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      ["Pts", detail.standing.points],
                      ["W", detail.standing.won],
                      ["D", detail.standing.drawn],
                      ["L", detail.standing.lost],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-white/5 py-2">
                        <div className="text-lg font-bold text-white">{value}</div>
                        <div className="text-xs text-zinc-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Matches */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Matches
                </h3>
                <ul className="space-y-1.5">
                  {detail.matches.map((m) => (
                    <MatchRow key={m.id} match={m} teamId={detail.team.id} />
                  ))}
                </ul>
              </div>

              {/* Top scorers */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Top scorers
                </h3>
                <ul className="space-y-1">
                  {detail.topScorers.length === 0 ? (
                    <li className="text-sm text-zinc-500">No goals scored</li>
                  ) : (
                    detail.topScorers.map((s) => (
                      <li key={s.player} className="flex justify-between text-sm">
                        <span className="text-zinc-200">{s.player}</span>
                        <span className="font-mono text-zinc-400">
                          {s.goals} ⚽
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Key players */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Key players
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detail.team.keyPlayers.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
