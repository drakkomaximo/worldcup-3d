import type { TeamDetail, Tournament } from "@/data/types";

/**
 * Typed client for the internal API routes.
 * The frontend never touches data sources directly — only these endpoints.
 */
export async function fetchTournament(): Promise<Tournament> {
  const res = await fetch("/api/tournament");
  if (!res.ok) throw new Error(`Failed to load tournament (${res.status})`);
  return res.json();
}

export async function fetchTeamDetail(teamId: string): Promise<TeamDetail> {
  const res = await fetch(`/api/teams/${teamId}`);
  if (!res.ok) throw new Error(`Failed to load team ${teamId} (${res.status})`);
  return res.json();
}
