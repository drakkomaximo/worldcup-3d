import { getTeamDetail, getTournament } from "../tournament";
import type { TournamentDataSource } from "../datasource";

/**
 * Mock provider: deterministic in-memory simulation of World Cup 2026.
 * Wraps the seeded simulator behind the TournamentDataSource contract.
 */
export const mockDataSource: TournamentDataSource = {
  async getTournament() {
    return getTournament();
  },
  async getTeamDetail(teamId: string) {
    return getTeamDetail(teamId);
  },
};
