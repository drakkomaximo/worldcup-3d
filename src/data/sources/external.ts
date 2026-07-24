import type { TournamentDataSource } from "../datasource";
import type { TeamDetail, Tournament } from "../types";

/**
 * External API provider (skeleton).
 *
 * To connect a real football API (e.g. API-Football, football-data.org):
 * 1. Set env vars: DATA_SOURCE=external, FOOTBALL_API_URL, FOOTBALL_API_KEY
 * 2. Implement the two fetchers below, mapping the vendor's payload
 *    into our domain types (Tournament / TeamDetail). The mapping functions
 *    are the ONLY place vendor-specific shapes are allowed to exist —
 *    the rest of the app stays untouched.
 */

const API_URL = process.env.FOOTBALL_API_URL ?? "";
const API_KEY = process.env.FOOTBALL_API_KEY ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "x-apisports-key": API_KEY },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`External API error ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}

export const externalDataSource: TournamentDataSource = {
  async getTournament(): Promise<Tournament> {
    // TODO: fetch fixtures/standings and map to the Tournament domain type, e.g.:
    // const raw = await apiFetch<VendorFixtures>("/fixtures?league=1&season=2026");
    // return mapVendorToTournament(raw);
    void apiFetch;
    throw new Error(
      "externalDataSource.getTournament not implemented yet — set DATA_SOURCE=mock"
    );
  },

  async getTeamDetail(_teamId: string): Promise<TeamDetail | null> {
    // TODO: fetch team fixtures/squad and map to TeamDetail
    throw new Error(
      "externalDataSource.getTeamDetail not implemented yet — set DATA_SOURCE=mock"
    );
  },
};
