"use client";

import { useEffect, useRef } from "react";
import type { Team } from "@/data/types";
import { useAppStore } from "@/store/useAppStore";
import { hashStr } from "@/domain/playerIdentity";

/**
 * Soft per-nation motif. Priority:
 * 1. /public/audio/anthems/{iso2}.mp3 if present (looped, quiet).
 * 2. Procedural fallback: a gentle plucked arpeggio whose scale is
 *    flavored by confederation and whose melody/tempo are seeded by
 *    the team id — every country sounds distinct, softly.
 */
const SCALES: Record<Team["confederation"], number[]> = {
  UEFA: [0, 4, 7, 11, 12, 7], // maj7 arpeggio — anthemic
  CONMEBOL: [0, 3, 5, 7, 10, 12], // minor pentatonic — south american groove
  CONCACAF: [0, 2, 4, 7, 9, 12], // major pentatonic — bright
  CAF: [0, 2, 4, 7, 10, 12], // mixolydian — afro-pop feel
  AFC: [0, 2, 3, 7, 9, 12], // asian pentatonic flavor
  OFC: [0, 2, 5, 7, 9, 12], // open suspended — islands
};

export function useTeamAnthem(team: Team) {
  const musicOn = useAppStore((s) => s.musicOn);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!musicOn) return;
    let stopped = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let master: GainNode | null = null;

    // Prefer a real anthem file if the user has provided one
    const audio = new Audio(`/audio/anthems/${team.iso2}.mp3`);
    audio.loop = true;
    audio.volume = 0.22;

    const startProcedural = () => {
      if (stopped) return;
      const ctx = ctxRef.current ?? new AudioContext();
      ctxRef.current = ctx;
      ctx.resume().catch(() => {});

      master = ctx.createGain();
      master.gain.value = 0;
      master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 1.2); // fade in
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1400;
      master.connect(lowpass).connect(ctx.destination);

      const h = hashStr(team.id);
      const scale = SCALES[team.confederation];
      const rootMidi = 55 + (h % 8); // G3..D4 — warm register
      const stepMs = 340 + (h % 5) * 40; // relaxed tempo per nation

      let beat = 0;
      const pluck = () => {
        if (!master) return;
        const t = ctx.currentTime;
        // Melody walks the scale in a seeded, wandering pattern
        const deg = scale[(h >> (beat % 8)) % scale.length + 0] ?? scale[beat % scale.length];
        const midi = rootMidi + (beat % 8 === 0 ? 0 : deg) + (beat % 16 >= 8 ? 5 : 0);
        const freq = 440 * Math.pow(2, (midi - 69) / 12);

        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 1);
        beat++;
      };
      pluck();
      interval = setInterval(pluck, stepMs);
    };

    audio.play().catch(startProcedural);

    return () => {
      stopped = true;
      audio.pause();
      audio.src = "";
      if (interval) clearInterval(interval);
      if (master && ctxRef.current) {
        // fade out to avoid clicks
        master.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.3);
        const m = master;
        setTimeout(() => m.disconnect(), 400);
      }
    };
  }, [team, musicOn]);

  // Close the context when the screen unmounts
  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => {});
    },
    []
  );
}
