"use client";

import type { Team } from "@/data/types";
import { hashStr, SKIN_TONES, HAIR_COLORS } from "@/domain/playerIdentity";

/**
 * Procedural avatar: not a likeness — a stylized bust wearing the
 * national jersey painted with the team's real flag colors.
 */
export function PlayerAvatar({ name, team, size = 120 }: { name: string; team: Team; size?: number }) {
  const h = hashStr(name);
  const skin = SKIN_TONES[h % SKIN_TONES.length];
  const hair = HAIR_COLORS[(h >> 3) % HAIR_COLORS.length];
  const hairStyle = (h >> 6) % 3; // 0 short, 1 buzz, 2 curly
  const [c1, c2, c3] = [
    team.flagColors[0],
    team.flagColors[1] ?? team.flagColors[0],
    team.flagColors[2] ?? team.flagColors[0],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {/* Jersey: three vertical stripes in the flag colors */}
      <path d="M20 100 L22 72 Q26 62 38 60 L62 60 Q74 62 78 72 L80 100 Z" fill={c1} />
      <path d="M39 100 L39 60 L61 60 L61 100 Z" fill={c2} />
      <path d="M56 100 L56 60 L61 60 Q74 62 78 72 L80 100 Z" fill={c3} />
      {/* Collar */}
      <path d="M42 60 L50 68 L58 60 Z" fill="#0a0f1d" opacity={0.85} />
      {/* Neck */}
      <rect x="44" y="48" width="12" height="14" rx="4" fill={skin} />
      {/* Head */}
      <circle cx="50" cy="34" r="16" fill={skin} />
      {/* Hair variants */}
      {hairStyle === 0 ? (
        <path d="M34 32 Q34 16 50 16 Q66 16 66 32 Q66 24 50 22 Q34 24 34 32 Z" fill={hair} />
      ) : hairStyle === 1 ? (
        <path d="M35 28 Q37 17 50 17 Q63 17 65 28 Q58 21 50 21 Q42 21 35 28 Z" fill={hair} />
      ) : (
        <path d="M33 32 Q30 14 50 14 Q70 14 67 32 Q68 20 50 19 Q32 20 33 32 Z" fill={hair} />
      )}
      {/* Eyes */}
      <circle cx="44" cy="34" r="1.8" fill="#1b1b1b" />
      <circle cx="56" cy="34" r="1.8" fill="#1b1b1b" />
      {/* Brow hint */}
      <path d="M41 30 L47 30 M53 30 L59 30" stroke="#1b1b1b" strokeWidth="1.2" strokeLinecap="round" opacity={0.6} />
      {/* Mouth */}
      <path d="M46 41 Q50 44 54 41" stroke="#7a4a2b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
