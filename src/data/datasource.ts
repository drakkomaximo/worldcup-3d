import { mockDataSource } from "./sources/mock";
import { externalDataSource } from "./sources/external";
import type { TeamDetail, Tournament } from "./types";

/**
 * Contract every data provider must fulfill.
 * The frontend and the API routes only know this interface —
 * swapping mock ↔ external API requires zero changes downstream.
 */
export interface TournamentDataSource {
  getTournament(): Promise<Tournament>;
  getTeamDetail(teamId: string): Promise<TeamDetail | null>;
}

/**
 * Factory: selects the active provider via env var.
 * DATA_SOURCE=mock (default) | external
 */
export function getDataSource(): TournamentDataSource {
  switch (process.env.DATA_SOURCE) {
    case "external":
      return externalDataSource;
    default:
      return mockDataSource;
  }
}
