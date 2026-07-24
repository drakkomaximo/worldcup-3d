import { GROUPS, TEAMS, TEAMS_BY_ID } from "./teams";
import type {
  GroupId,
  GroupStanding,
  Match,
  Scorer,
  Stage,
  StandingRow,
  Team,
  Tournament,
} from "./types";

/** Deterministic PRNG (mulberry32) so the whole tournament is reproducible. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VENUES = [
  "Estadio Azteca, Mexico City",
  "MetLife Stadium, New York",
  "SoFi Stadium, Los Angeles",
  "AT&T Stadium, Dallas",
  "BC Place, Vancouver",
  "Hard Rock Stadium, Miami",
  "NRG Stadium, Houston",
  "BMO Field, Toronto",
  "Estadio BBVA, Monterrey",
  "Mercedes-Benz Stadium, Atlanta",
  "Levi's Stadium, San Francisco",
  "Arrowhead Stadium, Kansas City",
];

/** Sample goals: stronger sides get a higher expected-goals budget. */
function sampleGoals(attack: number, defense: number, rng: () => number): number {
  const diff = attack - defense;
  const expected = Math.max(0.25, 1.25 + diff * 0.045);
  // Simple Poisson via Knuth
  const L = Math.exp(-expected);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k < 8);
  return k - 1;
}

function pickScorers(team: Team, goals: number, rng: () => number): Scorer[] {
  const scorers: Scorer[] = [];
  for (let i = 0; i < goals; i++) {
    // Key players score most goals; occasionally "someone else"
    const roll = rng();
    const player =
      roll < 0.42
        ? team.keyPlayers[0]
        : roll < 0.68
          ? team.keyPlayers[1]
          : roll < 0.86
            ? team.keyPlayers[2]
            : `${team.id} substitute`;
    scorers.push({
      player,
      minute: 1 + Math.floor(rng() * 90),
      teamId: team.id,
    });
  }
  return scorers.sort((a, b) => a.minute - b.minute);
}

interface SimOptions {
  stage: Stage;
  group?: GroupId;
  index: number;
  date: string;
  rng: () => number;
}

function simulateMatch(home: Team, away: Team, opts: SimOptions): Match {
  const { rng, stage, group, index, date } = opts;
  let homeScore = sampleGoals(home.strength, away.strength, rng);
  let awayScore = sampleGoals(away.strength, home.strength, rng);
  const isKnockout = stage !== "group";

  let penalties: Match["penalties"];
  let winnerId: string | undefined;

  if (isKnockout) {
    if (homeScore === awayScore) {
      // Extra time: one more chance each, weighted by strength
      const extraHome = rng() < home.strength / 220 ? 1 : 0;
      const extraAway = rng() < away.strength / 220 ? 1 : 0;
      homeScore += extraHome;
      awayScore += extraAway;
      if (homeScore === awayScore) {
        // Penalty shootout
        let ph = 0;
        let pa = 0;
        for (let i = 0; i < 5 || ph === pa; i++) {
          if (rng() < 0.72 + home.strength * 0.001) ph++;
          if (rng() < 0.72 + away.strength * 0.001) pa++;
          if (i > 10) {
            ph += 1; // deterministic cutoff safety
            break;
          }
        }
        penalties = { home: ph, away: pa };
        winnerId = ph > pa ? home.id : away.id;
      }
    }
    if (!winnerId) winnerId = homeScore > awayScore ? home.id : away.id;
  }

  const scorers = [
    ...pickScorers(home, homeScore, rng),
    ...pickScorers(away, awayScore, rng),
  ].sort((a, b) => a.minute - b.minute);

  return {
    id: `${stage}-${group ?? "KO"}-${index}`,
    stage,
    group,
    homeId: home.id,
    awayId: away.id,
    homeScore,
    awayScore,
    penalties,
    winnerId,
    date,
    venue: VENUES[index % VENUES.length],
    scorers,
  };
}

function computeStandings(group: GroupId, matches: Match[]): GroupStanding {
  const rows = new Map<string, StandingRow>();
  const teams = TEAMS.filter((t) => t.group === group);
  for (const t of teams) {
    rows.set(t.id, {
      teamId: t.id,
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0, position: 0,
    });
  }
  for (const m of matches) {
    const h = rows.get(m.homeId)!;
    const a = rows.get(m.awayId)!;
    h.played++; a.played++;
    h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
    a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
    if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.points += 3; }
    else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.points += 3; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }
  const sorted = [...rows.values()]
    .map((r) => ({ ...r, goalDiff: r.goalsFor - r.goalsAgainst }))
    .sort(
      (x, y) =>
        y.points - x.points ||
        y.goalDiff - x.goalDiff ||
        y.goalsFor - x.goalsFor ||
        TEAMS_BY_ID[x.teamId].fifaRanking - TEAMS_BY_ID[y.teamId].fifaRanking
    );
  sorted.forEach((r, i) => (r.position = i + 1));
  return { group, rows: sorted };
}

/**
 * Builds the entire 2026 tournament deterministically:
 * 72 group matches → standings → R32 (12 winners + 12 runners-up + 8 best 3rds) → final.
 */
export function buildTournament(seed = 20260719): Tournament {
  const rng = mulberry32(seed);

  // ── Group stage: round robin (6 matches per group) ──
  const groupMatches: Match[] = [];
  let idx = 0;
  const pairs: [number, number][] = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
  const dates = ["2026-06-11", "2026-06-12", "2026-06-16", "2026-06-17", "2026-06-21", "2026-06-22"];
  for (const g of GROUPS) {
    const teams = TEAMS.filter((t) => t.group === g);
    pairs.forEach(([i, j], p) => {
      groupMatches.push(
        simulateMatch(teams[i], teams[j], {
          stage: "group", group: g, index: idx++, date: dates[p], rng,
        })
      );
    });
  }

  const standings = GROUPS.map((g) =>
    computeStandings(g, groupMatches.filter((m) => m.group === g))
  );

  // ── Qualified: winners, runners-up, 8 best third-placed ──
  const winners = standings.map((s) => s.rows[0].teamId);
  const runners = standings.map((s) => s.rows[1].teamId);
  const thirds = standings
    .map((s) => s.rows[2])
    .sort((x, y) => y.points - x.points || y.goalDiff - x.goalDiff || y.goalsFor - x.goalsFor)
    .slice(0, 8)
    .map((r) => r.teamId);

  // R32 seeding: winners vs (runners shifted + best thirds), avoiding same group
  const potB = [...runners.slice(6), ...thirds, ...runners.slice(0, 6)];
  const r32Pairs: [string, string][] = winners.map((w, i) => {
    let opp = potB[i];
    if (TEAMS_BY_ID[opp].group === TEAMS_BY_ID[w].group) {
      const swapWith = (i + 1) % potB.length;
      [potB[i], potB[swapWith]] = [potB[swapWith], potB[i]];
      opp = potB[i];
    }
    return [w, opp];
  });
  // 12 winner-led ties + 4 ties among remaining pot B teams
  const remaining = potB.slice(12);
  for (let i = 0; i < remaining.length; i += 2) {
    r32Pairs.push([remaining[i], remaining[i + 1]]);
  }

  // ── Knockout rounds ──
  const knockoutMatches: Match[] = [];
  const playRound = (stage: Stage, teamIds: string[], date: string): string[] => {
    const next: string[] = [];
    for (let i = 0; i < teamIds.length; i += 2) {
      const m = simulateMatch(TEAMS_BY_ID[teamIds[i]], TEAMS_BY_ID[teamIds[i + 1]], {
        stage, index: idx++, date, rng,
      });
      knockoutMatches.push(m);
      next.push(m.winnerId!);
    }
    return next;
  };

  const r32Teams = r32Pairs.flat();
  const r16Teams = playRound("R32", r32Teams, "2026-06-29");
  const qfTeams = playRound("R16", r16Teams, "2026-07-04");
  const sfTeams = playRound("QF", qfTeams, "2026-07-09");
  const finalists = playRound("SF", sfTeams, "2026-07-14");

  // Third place: losers of the semifinals
  const sfMatches = knockoutMatches.filter((m) => m.stage === "SF");
  const sfLosers = sfMatches.map((m) => (m.winnerId === m.homeId ? m.awayId : m.homeId));
  playRound("3P", sfLosers, "2026-07-18");

  const [championId] = playRound("F", finalists, "2026-07-19");

  return { teams: TEAMS, groupMatches, knockoutMatches, standings, championId };
}
