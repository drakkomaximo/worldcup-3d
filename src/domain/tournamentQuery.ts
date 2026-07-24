/**
 * DOMAIN — pure queries over a simulated Tournament.
 * No React, no IO: takes data in, returns answers.
 */
import type { Team, Tournament } from "@/data/types";

const STAGE_LABEL: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  "3P": "3rd place match",
  F: "Final",
};

/** Where did this team finish in the simulated 2026 tournament? */
export function runIn2026(team: Team, tournament: Tournament | null): string {
  if (!tournament) return "—";
  if (tournament.championId === team.id) return "🏆 Champion";
  const played = tournament.knockoutMatches.filter(
    (m) => m.homeId === team.id || m.awayId === team.id
  );
  if (played.length === 0) return "Group stage";
  // Deepest knockout round reached
  const order = ["R32", "R16", "QF", "SF", "3P", "F"];
  const deepest = played.reduce((best, m) =>
    order.indexOf(m.stage) > order.indexOf(best.stage) ? m : best
  );
  return STAGE_LABEL[deepest.stage] ?? deepest.stage;
}
