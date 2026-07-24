"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GROUPS } from "@/data/teams";
import type { GroupId, StandingRow, Team, Tournament } from "@/data/types";
import { flagUrl } from "@/lib/flags";
import { useKeydown } from "@/hooks/useKeydown";
import { useAppStore } from "@/store/useAppStore";

// Coverflow layout
const CARD_W = 350; // px (design size; scaled down responsively)
const TILT = 48; // degrees each side card rotates — strong 3D
const AUTO_MS = 2200; // auto-advance interval — keeps the wheel moving
const SNAP_MS = 420; // transition time between slots
const DRAG_SUPPRESS_CLICK = 8; // px of drag that cancels the click

/** Card content (positioning is handled by the coverflow wrapper). */
function GroupCard({
  group,
  rows,
  teams,
  active,
}: {
  group: GroupId;
  rows: StandingRow[];
  teams: Team[];
  active: boolean;
}) {
  const leader = teams.find((t) => t.id === rows[0]?.teamId);
  return (
    <div
      className={`group relative w-[350px] overflow-hidden rounded-xl border p-6 text-left backdrop-blur transition-colors duration-300 ${
        active
          ? "border-[#ffd75e]/70 bg-[#0d1426]/95 shadow-[0_0_60px_rgba(255,215,94,0.15)]"
          : "border-white/10 bg-[#0a0f1d]/90"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Group</span>
        <span
          className={`text-6xl font-black italic transition-colors duration-300 ${
            active ? "text-[#ffd75e]" : "text-white/80"
          }`}
        >
          {group}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r) => {
          const team = teams.find((t) => t.id === r.teamId)!;
          return (
            <div key={r.teamId} className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagUrl(team.iso2)}
                alt={team.name}
                className="h-4 w-6 rounded-[2px] object-cover"
                loading="lazy"
              />
              <span
                className={`flex-1 truncate text-sm font-semibold ${
                  r.position <= 2 ? "text-zinc-100" : "text-zinc-500"
                }`}
              >
                {team.name}
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  r.position <= 2 ? "text-[#ffd75e]" : "text-zinc-600"
                }`}
              >
                {r.points}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/10 pt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">
        Leader · <span className="text-zinc-300">{leader?.name ?? "—"}</span>
      </div>
    </div>
  );
}

/** Expanded detail overlay for one group. */
function GroupDetail({
  group,
  tournament,
  onClose,
}: {
  group: GroupId;
  tournament: Tournament;
  onClose: () => void;
}) {
  const rows = tournament.standings.find((s) => s.group === group)?.rows ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-[min(680px,92vw)] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1d]"
        initial={{ y: 40, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 40, scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#ffd75e]">
              World Cup 2026
            </p>
            <h2 className="text-4xl font-black italic text-white">GROUP {group}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕ Esc
          </button>
        </div>

        {/* Standings table */}
        <div className="px-7 py-5">
          <div className="grid grid-cols-[2rem_1fr_repeat(5,2.6rem)_3rem] gap-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span>#</span>
            <span>Team</span>
            <span className="text-center">P</span>
            <span className="text-center">W</span>
            <span className="text-center">D</span>
            <span className="text-center">L</span>
            <span className="text-center">+/−</span>
            <span className="text-right">Pts</span>
          </div>
          {rows.map((r, i) => {
            const team = tournament.teams.find((t) => t.id === r.teamId)!;
            const qualified = r.position <= 2;
            return (
              <motion.div
                key={r.teamId}
                className={`grid grid-cols-[2rem_1fr_repeat(5,2.6rem)_3rem] items-center gap-1 rounded-lg px-0 py-2.5 ${
                  qualified ? "bg-white/[0.04]" : "opacity-55"
                }`}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: qualified ? 1 : 0.55 }}
                transition={{ delay: 0.08 + i * 0.07 }}
              >
                <span
                  className={`text-center font-mono text-sm font-bold ${
                    qualified ? "text-[#ffd75e]" : "text-zinc-600"
                  }`}
                >
                  {r.position}
                </span>
                <span className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(team.iso2)}
                    alt={team.name}
                    className="h-4.5 w-7 rounded-[2px] object-cover"
                  />
                  <span className="truncate text-sm font-bold text-zinc-100">{team.name}</span>
                  {qualified ? (
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      Qualified
                    </span>
                  ) : null}
                </span>
                <span className="text-center font-mono text-xs text-zinc-400">{r.played}</span>
                <span className="text-center font-mono text-xs text-zinc-400">{r.won}</span>
                <span className="text-center font-mono text-xs text-zinc-400">{r.drawn}</span>
                <span className="text-center font-mono text-xs text-zinc-400">{r.lost}</span>
                <span className="text-center font-mono text-xs text-zinc-400">
                  {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                </span>
                <span className="text-right font-mono text-base font-black text-white">
                  {r.points}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Signed circular distance from the active index, in [-6, 6). */
function circularDelta(i: number, active: number, n: number) {
  let d = (i - active) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
}

/**
 * 2D group-stage screen: 3D coverflow carousel.
 * The center card is enlarged and highlighted; neighbours tilt away in depth.
 * Auto-advances; ←/→ navigate, Enter/click opens the group's standings.
 */
export function GroupSlider() {
  const tournament = useAppStore((s) => s.tournament);
  const goToMenu = useAppStore((s) => s.goToMenu);
  const [openGroup, setOpenGroup] = useState<GroupId | null>(null);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [vw, setVw] = useState(1280);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragMoved = useRef(0);

  const n = GROUPS.length;
  const next = () => setActive((a) => (a + 1) % n);
  const prev = () => setActive((a) => (a + n - 1) % n);

  // Responsive metrics derived from the viewport width
  useEffect(() => {
    const measure = () => setVw(window.innerWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const cardScale = Math.min(1, Math.max(0.6, vw / 1150));
  const sideX = Math.min(360, Math.max(160, vw * 0.28));
  const depthZ = sideX * 1.35;

  // Auto-advance (pauses on hover, drag or while the detail is open)
  useEffect(() => {
    if (hovering || openGroup) return;
    const id = setInterval(() => {
      if (!dragging.current) next();
    }, AUTO_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovering, openGroup]);

  // ── Drag: hold the mouse (or touch) and pull the carousel ──
  // The cards FOLLOW the pointer (drag right → wheel spins right).
  // Pointer capture only starts once a real drag is detected, so plain
  // clicks still reach the cards.
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragMoved.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    dragMoved.current = Math.max(dragMoved.current, Math.abs(dx));
    if (dragMoved.current > DRAG_SUPPRESS_CLICK) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setDragPx(dx);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    // Snap to the nearest slot (cards moved +dragPx, so the wheel advanced -steps)
    setActive((a) => {
      const steps = -Math.round(dragPx / sideX);
      return (a + steps + n * 4) % n;
    });
    setDragPx(0);
  };

  // Keyboard: ←/→ rotate, Enter opens center group, Esc goes back
  useKeydown((e) => {
    if (openGroup) return; // GroupDetail handles its own Esc
    if (e.code === "ArrowRight" || e.code === "KeyD") next();
    else if (e.code === "ArrowLeft" || e.code === "KeyA") prev();
    else if (e.code === "Enter" || e.code === "Space") {
      e.preventDefault();
      setOpenGroup(GROUPS[active]);
    } else if (e.code === "Escape") goToMenu();
  });

  if (!tournament) return null;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex cursor-auto flex-col overflow-hidden bg-[#060a14]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 10%, #101a33 0%, #060a14 55%), radial-gradient(60% 50% at 85% 90%, rgba(255,215,94,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="start-menu-stripes absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #fff 0px, #fff 2px, transparent 2px, transparent 90px)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 pt-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#ffd75e]">
            FIFA World Cup 2026
          </p>
          <h1 className="text-5xl font-black uppercase italic tracking-tight text-white md:text-6xl">
            Group Stage
          </h1>
        </div>
        <button
          onClick={goToMenu}
          className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          ← Menu
        </button>
      </header>

      {/* 3D coverflow — drag to rotate, only 3 cards on stage */}
      <div
        className="relative z-10 mt-auto mb-auto flex h-[min(52vh,460px)] touch-pan-y select-none items-center justify-center"
        style={{ perspective: "900px", cursor: dragging.current ? "grabbing" : "grab" }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {GROUPS.map((g, i) => {
          // Fractional delta while dragging → the wheel follows the mouse live
          const de = circularDelta(i, active, n) + dragPx / sideX; // cards follow the pointer
          const abs = Math.abs(de);
          const hidden = abs > 1.6; // strictly 1 center + 1 per side
          const rows = tournament.standings.find((s) => s.group === g)?.rows ?? [];
          const isCenter = abs < 0.5;
          return (
            <div
              key={g}
              onClick={() => {
                if (dragMoved.current > DRAG_SUPPRESS_CLICK) return; // it was a drag
                if (isCenter) setOpenGroup(g);
                else setActive(i);
              }}
              className="absolute will-change-transform"
              style={{
                width: CARD_W,
                transformStyle: "preserve-3d",
                transform: `translateX(${de * sideX}px) translateZ(${-abs * depthZ}px) rotateY(${
                  -Math.max(-1.2, Math.min(1.2, de)) * TILT
                }deg) scale(${(isCenter ? 1.18 - abs * 0.36 : 1) * cardScale})`,
                opacity: hidden ? 0 : Math.max(0, 1 - Math.max(0, abs - 1) * 1.6 - abs * 0.15),
                zIndex: Math.round(20 - abs * 10),
                pointerEvents: hidden ? "none" : "auto",
                transition: dragging.current
                  ? "none"
                  : `transform ${SNAP_MS}ms cubic-bezier(0.25, 0.9, 0.35, 1), opacity ${SNAP_MS}ms ease`,
              }}
            >
              <GroupCard group={g} rows={rows} teams={tournament.teams} active={isCenter} />
            </div>
          );
        })}

        {/* Floor reflection glow under the center card */}
        <div className="pointer-events-none absolute bottom-4 h-10 w-[min(340px,60vw)] rounded-[50%] bg-[#ffd75e]/10 blur-2xl" />
      </div>

      {/* Footer hint */}
      <footer className="relative z-10 flex items-center gap-6 px-10 pb-8">
        {[
          ["Drag", "Spin"],
          ["← →", "Rotate"],
          ["Enter", "Open group"],
          ["Esc", "Back"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <kbd className="rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-zinc-100">
              {key}
            </kbd>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {label}
            </span>
          </div>
        ))}
      </footer>

      {/* Group detail overlay */}
      <AnimatePresence>
        {openGroup ? (
          <GroupDetail
            key={openGroup}
            group={openGroup}
            tournament={tournament}
            onClose={() => setOpenGroup(null)}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
