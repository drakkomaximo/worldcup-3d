"use client";

import { useAppStore } from "@/store/useAppStore";
import { MusicToggle } from "./MusicPlayer";

/** 2D overlay: title + view toggle. Pure HTML on top of the canvas. */
export function Hud() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const goToMenu = useAppStore((s) => s.goToMenu);
  const enterStage = useAppStore((s) => s.enterStage);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏆</span>
        <div>
          <h1 className="bg-gradient-to-r from-red-400 via-zinc-100 to-blue-400 bg-clip-text text-lg font-black uppercase tracking-wider text-transparent">
            FIFA World Cup 26
          </h1>
          <p className="text-xs text-zinc-400">
            United 2026 · Canada / Mexico / USA · 48 teams · 3D Scoreboard
          </p>
        </div>
      </div>

      <nav className="pointer-events-auto flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
        <button
          onClick={goToMenu}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-[#ffd75e] transition-colors hover:bg-white/10"
        >
          ← Menu
        </button>
        <button
          onClick={() => enterStage("groups")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "groups"
              ? "bg-white text-black"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Group Stage
        </button>
        <button
          onClick={() => setView("knockout")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "knockout"
              ? "bg-white text-black"
              : "text-zinc-300 hover:text-white"
          }`}
        >
          Knockout
        </button>
      </nav>

      <MusicToggle className="pointer-events-auto absolute right-6 top-20" />

      {/* Controls legend */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center overflow-hidden rounded-lg border border-white/10 bg-[#0a0f1d]/80 shadow-lg shadow-black/40 backdrop-blur-md md:flex">
        {[
          ["WASD", "Move"],
          ["+ −", "Zoom"],
          ["Drag", "Pan"],
          ["R-Drag", "Orbit"],
          ["Click", "Team card"],
          ["Esc", "Close"],
        ].map(([key, label], i) => (
          <div
            key={key}
            className={`flex items-center gap-2 px-4 py-2.5 ${
              i > 0 ? "border-l border-white/5" : ""
            }`}
          >
            <kbd className="rounded-md border border-white/15 bg-white/[0.07] px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-zinc-100">
              {key}
            </kbd>
            <span className="text-[11px] font-medium text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
