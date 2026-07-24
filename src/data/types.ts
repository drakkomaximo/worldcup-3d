export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type Stage = "group" | "R32" | "R16" | "QF" | "SF" | "3P" | "F";

export interface Team {
  /** ISO-3 style code, e.g. "ARG" */
  id: string;
  /** ISO 3166-1 alpha-2 code (lowercase) for real flag images, e.g. "ar" */
  iso2: string;
  name: string;
  group: GroupId;
  confederation: "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";
  /** Flag stripe colors (hex) used to paint the 3D pitch */
  flagColors: string[];
  /** Primary accent color for glows / particles */
  primaryColor: string;
  /** Relative strength 1-100 used by the deterministic simulator */
  strength: number;
  /** Representative players used for mock scorers */
  keyPlayers: string[];
  fifaRanking: number;
}

export interface Scorer {
  player: string;
  minute: number;
  teamId: string;
}

export interface Match {
  id: string;
  stage: Stage;
  group?: GroupId;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  /** Present only for knockout matches decided on penalties */
  penalties?: { home: number; away: number };
  /** Winner team id (knockout only) */
  winnerId?: string;
  date: string;
  venue: string;
  scorers: Scorer[];
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  position: number;
}

export interface GroupStanding {
  group: GroupId;
  rows: StandingRow[];
}

export interface Tournament {
  teams: Team[];
  groupMatches: Match[];
  knockoutMatches: Match[];
  standings: GroupStanding[];
  championId: string;
}

export interface TeamDetail {
  team: Team;
  matches: Match[];
  standing?: StandingRow;
  group: GroupId;
  topScorers: { player: string; goals: number }[];
  /** Stage reached: "group" | "R32" | ... | "F" | "champion" */
  runReached: string;
  eliminated: boolean;
}
