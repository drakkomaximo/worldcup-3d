/**
 * Historical World Cup facts per nation (through the 2026 edition).
 * apps = total appearances incl. 2026 · titles = trophies won
 * best = best historical finish · hosted = years the country (co-)hosted
 */
export interface TeamFacts {
  apps: number;
  titles: number;
  best: string;
  hosted: number[];
}

export const TEAM_FACTS: Record<string, TeamFacts> = {
  MEX: { apps: 18, titles: 0, best: "Quarter-finals", hosted: [1970, 1986, 2026] },
  RSA: { apps: 4, titles: 0, best: "Group stage", hosted: [2010] },
  KOR: { apps: 12, titles: 0, best: "4th place (2002)", hosted: [2002] },
  CZE: { apps: 10, titles: 0, best: "Runners-up ×2*", hosted: [] },
  CAN: { apps: 3, titles: 0, best: "Group stage", hosted: [2026] },
  BIH: { apps: 2, titles: 0, best: "Group stage (2014)", hosted: [] },
  QAT: { apps: 2, titles: 0, best: "Group stage (2022)", hosted: [2022] },
  SUI: { apps: 13, titles: 0, best: "Quarter-finals", hosted: [1954] },
  BRA: { apps: 23, titles: 5, best: "Champions ×5", hosted: [1950, 2014] },
  MAR: { apps: 7, titles: 0, best: "4th place (2022)", hosted: [] },
  HAI: { apps: 2, titles: 0, best: "Group stage (1974)", hosted: [] },
  SCO: { apps: 9, titles: 0, best: "Group stage", hosted: [] },
  USA: { apps: 12, titles: 0, best: "3rd place (1930)", hosted: [1994, 2026] },
  PAR: { apps: 9, titles: 0, best: "Quarter-finals (2010)", hosted: [] },
  AUS: { apps: 7, titles: 0, best: "Round of 16", hosted: [] },
  TUR: { apps: 3, titles: 0, best: "3rd place (2002)", hosted: [] },
  GER: { apps: 21, titles: 4, best: "Champions ×4", hosted: [1974, 2006] },
  CUW: { apps: 1, titles: 0, best: "Debut", hosted: [] },
  CIV: { apps: 4, titles: 0, best: "Group stage", hosted: [] },
  ECU: { apps: 5, titles: 0, best: "Round of 16 (2006)", hosted: [] },
  NED: { apps: 12, titles: 0, best: "Runners-up ×3", hosted: [] },
  JPN: { apps: 8, titles: 0, best: "Round of 16", hosted: [2002] },
  SWE: { apps: 13, titles: 0, best: "Runners-up (1958)", hosted: [1958] },
  TUN: { apps: 7, titles: 0, best: "Group stage", hosted: [] },
  BEL: { apps: 15, titles: 0, best: "3rd place (2018)", hosted: [] },
  EGY: { apps: 4, titles: 0, best: "Group stage", hosted: [] },
  IRN: { apps: 7, titles: 0, best: "Group stage", hosted: [] },
  NZL: { apps: 3, titles: 0, best: "Group stage", hosted: [] },
  ESP: { apps: 17, titles: 1, best: "Champions (2010)", hosted: [1982] },
  CPV: { apps: 1, titles: 0, best: "Debut", hosted: [] },
  KSA: { apps: 7, titles: 0, best: "Round of 16 (1994)", hosted: [] },
  URU: { apps: 15, titles: 2, best: "Champions ×2", hosted: [1930] },
  FRA: { apps: 17, titles: 2, best: "Champions ×2", hosted: [1938, 1998] },
  SEN: { apps: 4, titles: 0, best: "Quarter-finals (2002)", hosted: [] },
  IRQ: { apps: 2, titles: 0, best: "Group stage (1986)", hosted: [] },
  NOR: { apps: 4, titles: 0, best: "Round of 16 (1998)", hosted: [] },
  ARG: { apps: 19, titles: 3, best: "Champions ×3", hosted: [1978] },
  ALG: { apps: 5, titles: 0, best: "Round of 16 (2014)", hosted: [] },
  AUT: { apps: 8, titles: 0, best: "3rd place (1954)", hosted: [] },
  JOR: { apps: 1, titles: 0, best: "Debut", hosted: [] },
  POR: { apps: 9, titles: 0, best: "3rd place (1966)", hosted: [] },
  COD: { apps: 2, titles: 0, best: "Group stage (1974)", hosted: [] },
  UZB: { apps: 1, titles: 0, best: "Debut", hosted: [] },
  COL: { apps: 7, titles: 0, best: "Quarter-finals (2014)", hosted: [] },
  ENG: { apps: 17, titles: 1, best: "Champions (1966)", hosted: [1966] },
  CRO: { apps: 7, titles: 0, best: "Runners-up (2018)", hosted: [] },
  GHA: { apps: 5, titles: 0, best: "Quarter-finals (2010)", hosted: [] },
  PAN: { apps: 2, titles: 0, best: "Group stage (2018)", hosted: [] },
};
