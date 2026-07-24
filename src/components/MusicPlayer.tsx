"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

const THEME_URL = "/audio/worldcup-theme.mp3";

/**
 * Procedural "stadium vibes" built with Web Audio:
 * crowd ambience (filtered noise with slow swells) + a samba-style
 * percussion loop (surdo, shaker, agogô-ish blips). Evokes a World Cup
 * broadcast without using any copyrighted anthem.
 */
function startProceduralStadium(ctx: AudioContext, master: GainNode) {
  const stop: (() => void)[] = [];

  // ── Crowd ambience: looped noise → bandpass → slow LFO swells ──
  const noiseLen = 4 * ctx.sampleRate;
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  let lp = 0;
  for (let i = 0; i < noiseLen; i++) {
    // Brown-ish noise: smoother, more like a distant crowd
    lp = (lp + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = lp * 3.5;
  }
  const crowd = ctx.createBufferSource();
  crowd.buffer = noiseBuf;
  crowd.loop = true;
  const crowdFilter = ctx.createBiquadFilter();
  crowdFilter.type = "bandpass";
  crowdFilter.frequency.value = 520;
  crowdFilter.Q.value = 0.4;
  const crowdGain = ctx.createGain();
  crowdGain.gain.value = 0.16;
  // Slow random swells (like chants rising and falling)
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.06;
  lfo.connect(lfoGain).connect(crowdGain.gain);
  crowd.connect(crowdFilter).connect(crowdGain).connect(master);
  crowd.start();
  lfo.start();
  stop.push(() => {
    crowd.stop();
    lfo.stop();
  });

  // ── Samba percussion loop (~104 BPM, 2-bar pattern) ──
  const BPM = 104;
  const STEP = 60 / BPM / 4; // 16th note
  const PATTERN_STEPS = 32;

  const playSurdo = (t: number, accent: boolean) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.setValueAtTime(accent ? 95 : 75, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.18);
    g.gain.setValueAtTime(accent ? 0.5 : 0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.3);
  };

  const playShaker = (t: number, loud: boolean) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(loud ? 0.09 : 0.045, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(f).connect(g).connect(master);
    src.start(t, Math.random() * 3, 0.06);
  };

  const playBlip = (t: number, hi: boolean) => {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = hi ? 740 : 555; // agogô two-bell feel
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.1);
  };

  // Simple look-ahead scheduler
  let step = 0;
  let nextT = ctx.currentTime + 0.1;
  const surdoSteps = new Set([0, 8, 16, 24]); // beats 1 & 3 of each bar
  const surdoAccents = new Set([8, 24]);
  const blipSteps: Record<number, boolean> = { 2: true, 6: false, 10: true, 18: true, 22: false, 26: true, 30: false };
  const interval = setInterval(() => {
    while (nextT < ctx.currentTime + 0.25) {
      if (surdoSteps.has(step)) playSurdo(nextT, surdoAccents.has(step));
      playShaker(nextT, step % 4 === 0);
      if (step in blipSteps) playBlip(nextT, blipSteps[step]);
      nextT += STEP;
      step = (step + 1) % PATTERN_STEPS;
    }
  }, 100);
  stop.push(() => clearInterval(interval));

  return () => stop.forEach((fn) => fn());
}

/**
 * Background music with a graceful fallback:
 * 1. If /audio/worldcup-theme.mp3 exists in /public, it loops.
 * 2. Otherwise, a procedural stadium-samba ambience plays.
 * Starts on the first user gesture (browser autoplay policy).
 */
export function MusicPlayer() {
  const musicOn = useAppStore((s) => s.musicOn);
  const screen = useAppStore((s) => s.screen);
  // Duck the stadium music while the per-country anthem plays in TEAMS
  const ducked = screen === "teams";
  const started = useRef(false);
  const masterRef = useRef<GainNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const stopProcedural = useRef<(() => void) | null>(null);

  // Start everything on the first click/keypress
  useEffect(() => {
    const start = () => {
      if (started.current) return;
      started.current = true;

      const audio = new Audio(THEME_URL);
      audio.loop = true;
      audio.volume = 0.35;
      audioElRef.current = audio;

      audio
        .play()
        .then(() => {
          if (!useAppStore.getState().musicOn) audio.pause();
        })
        .catch(() => {
          // No mp3 in /public/audio → procedural stadium ambience
          const ctx = new AudioContext();
          const master = ctx.createGain();
          master.gain.value = useAppStore.getState().musicOn ? 0.5 : 0;
          master.connect(ctx.destination);
          ctxRef.current = ctx;
          masterRef.current = master;
          stopProcedural.current = startProceduralStadium(ctx, master);
        });
    };

    window.addEventListener("pointerdown", start, { once: false });
    window.addEventListener("keydown", start, { once: false });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      stopProcedural.current?.();
      ctxRef.current?.close().catch(() => {});
      audioElRef.current?.pause();
    };
  }, []);

  // React to the mute toggle and screen-based ducking
  useEffect(() => {
    const audio = audioElRef.current;
    if (audio && !audio.error) {
      if (musicOn) {
        audio.volume = ducked ? 0.08 : 0.35;
        audio.play().catch(() => {});
      } else audio.pause();
    }
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(
        musicOn ? (ducked ? 0.12 : 0.5) : 0,
        ctxRef.current.currentTime + 0.4
      );
    }
  }, [musicOn, ducked]);

  return null;
}

/** Round mute/unmute button, usable from any screen. */
export function MusicToggle({ className = "" }: { className?: string }) {
  const musicOn = useAppStore((s) => s.musicOn);
  const toggleMusic = useAppStore((s) => s.toggleMusic);
  return (
    <button
      onClick={toggleMusic}
      title={musicOn ? "Mute music" : "Play music"}
      className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg backdrop-blur transition-colors hover:bg-white/15 ${className}`}
    >
      {musicOn ? "🔊" : "🔇"}
    </button>
  );
}
