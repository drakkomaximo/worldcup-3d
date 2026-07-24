/**
 * DOMAIN — pure, framework-free logic.
 * Deterministic identity helpers: same player name → same face & stats.
 */

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const SKIN_TONES = ["#8d5524", "#c68642", "#e0ac69", "#f1c27d", "#ffdbac", "#6b4423"];
export const HAIR_COLORS = ["#1b1b1b", "#2e1a0f", "#4a2c14", "#0d0d0d", "#3b2416", "#555555"];

export const STAT_KEYS = ["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

export function playerStats(name: string, teamStrength: number) {
  const h = hashStr(name);
  const stats = STAT_KEYS.map((key, i) => {
    const jitter = ((h >> (i * 5)) % 21) - 10; // -10..+10
    const value = Math.max(52, Math.min(96, teamStrength + jitter));
    return { key, value };
  });
  const ovr = Math.round(stats.reduce((s, x) => s + x.value, 0) / stats.length);
  return { stats, ovr };
}
