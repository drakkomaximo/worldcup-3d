import { buildTournament } from "./simulator";
import { TEAMS_BY_ID } from "./teams";
import type { TeamDetail, Tournament } from "./types";

let cached: Tournament | null = null;

/** Tournament is generated once per server process (deterministic seed). */
export function getTournament(): Tournament {
  if (!cached) cached = buildTournament();
  return cached;
}

const STAGE_ORDER = ["group", "R32", "R16", "QF", "SF", "3P", "F"] as const;

export function getTeamDetail(teamId: string): TeamDetail | null {
  const team = TEAMS_BY_ID[teamId];
  if (!team) return null;

  const t = getTournament();
  const matches = [...t.groupMatches, ...t.knockoutMatches].filter(
    (m) => m.homeId === teamId || m.awayId === teamId
  );

  const standing = t.standings
    .find((s) => s.group === team.group)
    ?.rows.find((r) => r.teamId === teamId);

  const goals = new Map<string, number>();
  for (const m of matches) {
    for (const s of m.scorers) {
      if (s.teamId === teamId) goals.set(s.player, (goals.get(s.player) ?? 0) + 1);
    }
  }
  const topScorers = [...goals.entries()]
    .map(([player, g]) => ({ player, goals: g }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  let runReached = "group";
  for (const m of matches) {
    if (STAGE_ORDER.indexOf(m.stage) > STAGE_ORDER.indexOf(runReached as typeof STAGE_ORDER[number])) {
      runReached = m.stage;
    }
  }
  if (t.championId === teamId) runReached = "champion";

  const lastMatch = matches[matches.length - 1];
  const eliminated =
    t.championId !== teamId &&
    (runReached === "group"
      ? true
      : lastMatch?.winnerId !== undefined && lastMatch.winnerId !== teamId);

  return { team, matches, standing, group: team.group, topScorers, runReached, eliminated };
}
