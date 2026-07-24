"use client";

import { TEAMS } from "@/data/teams";

/** 12×4 character-select roster grid of national flags. */
export function FlagRoster({ idx, onPick }: { idx: number; onPick: (i: number) => void }) {
  return (
    <div className="px-6 pb-3 pt-3">
      <div className="mx-auto grid w-fit grid-cols-12 gap-1.5">
        {TEAMS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onPick(i)}
            title={t.name}
            className={`relative overflow-hidden rounded-md border transition-all duration-150 ${
              i === idx
                ? "scale-110 border-[#ffd75e] shadow-[0_0_16px_rgba(255,215,94,0.4)]"
                : "border-white/15 opacity-60 hover:scale-105 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w40/${t.iso2}.png`}
              alt={t.name}
              className="h-6 w-9 object-cover sm:h-7 sm:w-11"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-6">
        {[
          ["← → ↑ ↓", "Browse"],
          ["Click", "Pick a nation"],
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
      </div>
    </div>
  );
}
