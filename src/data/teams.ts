import type { Team } from "./types";

/**
 * World Cup 2026 — 48 teams across 12 groups (A-L).
 * flagColors paint the procedural pitch stripes; primaryColor drives glow/particles.
 */
export const TEAMS: Team[] = [
  // ── Group A (official draw: Mexico, South Africa, South Korea, Czechia) ──
  { id: "MEX", iso2: "mx", name: "Mexico", group: "A", confederation: "CONCACAF", flagColors: ["#006847", "#ffffff", "#ce1126"], primaryColor: "#006847", strength: 78, keyPlayers: ["Santiago Giménez", "Edson Álvarez", "Hirving Lozano"], fifaRanking: 13 },
  { id: "RSA", iso2: "za", name: "South Africa", group: "A", confederation: "CAF", flagColors: ["#007749", "#ffb612", "#de3831"], primaryColor: "#007749", strength: 64, keyPlayers: ["Percy Tau", "Themba Zwane", "Ronwen Williams"], fifaRanking: 57 },
  { id: "KOR", iso2: "kr", name: "South Korea", group: "A", confederation: "AFC", flagColors: ["#ffffff", "#cd2e3a", "#0047a0"], primaryColor: "#cd2e3a", strength: 74, keyPlayers: ["Son Heung-min", "Lee Kang-in", "Kim Min-jae"], fifaRanking: 22 },
  { id: "CZE", iso2: "cz", name: "Czechia", group: "A", confederation: "UEFA", flagColors: ["#ffffff", "#d7141a", "#11457e"], primaryColor: "#d7141a", strength: 71, keyPlayers: ["Patrik Schick", "Tomáš Souček", "Adam Hložek"], fifaRanking: 39 },

  // ── Group B (Canada, Bosnia and Herzegovina, Qatar, Switzerland) ──
  { id: "CAN", iso2: "ca", name: "Canada", group: "B", confederation: "CONCACAF", flagColors: ["#d80621", "#ffffff", "#d80621"], primaryColor: "#d80621", strength: 73, keyPlayers: ["Alphonso Davies", "Jonathan David", "Stephen Eustáquio"], fifaRanking: 28 },
  { id: "BIH", iso2: "ba", name: "Bosnia and Herzegovina", group: "B", confederation: "UEFA", flagColors: ["#002395", "#fecb00", "#002395"], primaryColor: "#002395", strength: 66, keyPlayers: ["Edin Džeko", "Ermedin Demirović", "Sead Kolašinac"], fifaRanking: 70 },
  { id: "QAT", iso2: "qa", name: "Qatar", group: "B", confederation: "AFC", flagColors: ["#8a1538", "#ffffff", "#8a1538"], primaryColor: "#8a1538", strength: 58, keyPlayers: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos"], fifaRanking: 53 },
  { id: "SUI", iso2: "ch", name: "Switzerland", group: "B", confederation: "UEFA", flagColors: ["#da291c", "#ffffff", "#da291c"], primaryColor: "#da291c", strength: 76, keyPlayers: ["Granit Xhaka", "Dan Ndoye", "Breel Embolo"], fifaRanking: 20 },

  // ── Group C (Brazil, Morocco, Haiti, Scotland) ──
  { id: "BRA", iso2: "br", name: "Brazil", group: "C", confederation: "CONMEBOL", flagColors: ["#009739", "#fedd00", "#012169"], primaryColor: "#009739", strength: 88, keyPlayers: ["Vinícius Jr.", "Rodrygo", "Raphinha"], fifaRanking: 5 },
  { id: "MAR", iso2: "ma", name: "Morocco", group: "C", confederation: "CAF", flagColors: ["#c1272d", "#006233", "#c1272d"], primaryColor: "#c1272d", strength: 79, keyPlayers: ["Achraf Hakimi", "Brahim Díaz", "Yassine Bounou"], fifaRanking: 12 },
  { id: "HAI", iso2: "ht", name: "Haiti", group: "C", confederation: "CONCACAF", flagColors: ["#00209f", "#d21034", "#00209f"], primaryColor: "#00209f", strength: 54, keyPlayers: ["Duckens Nazon", "Danley Jean Jacques", "Frantzdy Pierrot"], fifaRanking: 84 },
  { id: "SCO", iso2: "gb-sct", name: "Scotland", group: "C", confederation: "UEFA", flagColors: ["#005eb8", "#ffffff", "#005eb8"], primaryColor: "#005eb8", strength: 68, keyPlayers: ["Scott McTominay", "Andy Robertson", "John McGinn"], fifaRanking: 45 },

  // ── Group D (United States, Paraguay, Australia, Turkey) ──
  { id: "USA", iso2: "us", name: "United States", group: "D", confederation: "CONCACAF", flagColors: ["#b31942", "#ffffff", "#0a3161"], primaryColor: "#0a3161", strength: 77, keyPlayers: ["Christian Pulisic", "Weston McKennie", "Folarin Balogun"], fifaRanking: 16 },
  { id: "PAR", iso2: "py", name: "Paraguay", group: "D", confederation: "CONMEBOL", flagColors: ["#d52b1e", "#ffffff", "#0038a8"], primaryColor: "#d52b1e", strength: 69, keyPlayers: ["Miguel Almirón", "Julio Enciso", "Antonio Sanabria"], fifaRanking: 43 },
  { id: "AUS", iso2: "au", name: "Australia", group: "D", confederation: "AFC", flagColors: ["#00008b", "#ffcd00", "#00843d"], primaryColor: "#ffcd00", strength: 67, keyPlayers: ["Jackson Irvine", "Craig Goodwin", "Mathew Ryan"], fifaRanking: 26 },
  { id: "TUR", iso2: "tr", name: "Turkey", group: "D", confederation: "UEFA", flagColors: ["#e30a17", "#ffffff", "#e30a17"], primaryColor: "#e30a17", strength: 75, keyPlayers: ["Arda Güler", "Hakan Çalhanoğlu", "Kenan Yıldız"], fifaRanking: 27 },

  // ── Group E (Germany, Curaçao, Ivory Coast, Ecuador) ──
  { id: "GER", iso2: "de", name: "Germany", group: "E", confederation: "UEFA", flagColors: ["#000000", "#dd0000", "#ffce00"], primaryColor: "#dd0000", strength: 85, keyPlayers: ["Jamal Musiala", "Florian Wirtz", "Joshua Kimmich"], fifaRanking: 8 },
  { id: "CUW", iso2: "cw", name: "Curaçao", group: "E", confederation: "CONCACAF", flagColors: ["#002b7f", "#f9e814", "#002b7f"], primaryColor: "#002b7f", strength: 53, keyPlayers: ["Leandro Bacuna", "Kenji Gorré", "Juninho Bacuna"], fifaRanking: 82 },
  { id: "CIV", iso2: "ci", name: "Ivory Coast", group: "E", confederation: "CAF", flagColors: ["#f77f00", "#ffffff", "#009e60"], primaryColor: "#f77f00", strength: 70, keyPlayers: ["Sébastien Haller", "Franck Kessié", "Simon Adingra"], fifaRanking: 39 },
  { id: "ECU", iso2: "ec", name: "Ecuador", group: "E", confederation: "CONMEBOL", flagColors: ["#ffdd00", "#034ea2", "#ed1c24"], primaryColor: "#ffdd00", strength: 73, keyPlayers: ["Moisés Caicedo", "Kendry Páez", "Piero Hincapié"], fifaRanking: 24 },

  // ── Group F (Netherlands, Japan, Sweden, Tunisia) ──
  { id: "NED", iso2: "nl", name: "Netherlands", group: "F", confederation: "UEFA", flagColors: ["#ae1c28", "#ffffff", "#21468b"], primaryColor: "#ff7f00", strength: 84, keyPlayers: ["Cody Gakpo", "Xavi Simons", "Virgil van Dijk"], fifaRanking: 7 },
  { id: "JPN", iso2: "jp", name: "Japan", group: "F", confederation: "AFC", flagColors: ["#ffffff", "#bc002d", "#ffffff"], primaryColor: "#bc002d", strength: 76, keyPlayers: ["Takefusa Kubo", "Kaoru Mitoma", "Wataru Endo"], fifaRanking: 15 },
  { id: "SWE", iso2: "se", name: "Sweden", group: "F", confederation: "UEFA", flagColors: ["#006aa7", "#fecc02", "#006aa7"], primaryColor: "#006aa7", strength: 73, keyPlayers: ["Alexander Isak", "Viktor Gyökeres", "Dejan Kulusevski"], fifaRanking: 37 },
  { id: "TUN", iso2: "tn", name: "Tunisia", group: "F", confederation: "CAF", flagColors: ["#e70013", "#ffffff", "#e70013"], primaryColor: "#e70013", strength: 65, keyPlayers: ["Hannibal Mejbri", "Elias Achouri", "Aïssa Laïdouni"], fifaRanking: 41 },

  // ── Group G (Belgium, Egypt, Iran, New Zealand) ──
  { id: "BEL", iso2: "be", name: "Belgium", group: "G", confederation: "UEFA", flagColors: ["#000000", "#fdda24", "#ef3340"], primaryColor: "#ef3340", strength: 82, keyPlayers: ["Kevin De Bruyne", "Jérémy Doku", "Amadou Onana"], fifaRanking: 9 },
  { id: "EGY", iso2: "eg", name: "Egypt", group: "G", confederation: "CAF", flagColors: ["#ce1126", "#ffffff", "#000000"], primaryColor: "#ce1126", strength: 70, keyPlayers: ["Mohamed Salah", "Omar Marmoush", "Mahmoud Trezeguet"], fifaRanking: 34 },
  { id: "IRN", iso2: "ir", name: "Iran", group: "G", confederation: "AFC", flagColors: ["#239f40", "#ffffff", "#da0000"], primaryColor: "#239f40", strength: 66, keyPlayers: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"], fifaRanking: 18 },
  { id: "NZL", iso2: "nz", name: "New Zealand", group: "G", confederation: "OFC", flagColors: ["#012169", "#ffffff", "#c8102e"], primaryColor: "#012169", strength: 55, keyPlayers: ["Chris Wood", "Matthew Garbett", "Liberato Cacace"], fifaRanking: 86 },

  // ── Group H (Spain, Cape Verde, Saudi Arabia, Uruguay) ──
  { id: "ESP", iso2: "es", name: "Spain", group: "H", confederation: "UEFA", flagColors: ["#aa151b", "#f1bf00", "#aa151b"], primaryColor: "#aa151b", strength: 89, keyPlayers: ["Lamine Yamal", "Pedri", "Nico Williams"], fifaRanking: 3 },
  { id: "CPV", iso2: "cv", name: "Cape Verde", group: "H", confederation: "CAF", flagColors: ["#003893", "#ffffff", "#cf2027"], primaryColor: "#003893", strength: 58, keyPlayers: ["Ryan Mendes", "Bebé", "Jamiro Monteiro"], fifaRanking: 70 },
  { id: "KSA", iso2: "sa", name: "Saudi Arabia", group: "H", confederation: "AFC", flagColors: ["#006c35", "#ffffff", "#006c35"], primaryColor: "#006c35", strength: 62, keyPlayers: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Mohammed Kanno"], fifaRanking: 59 },
  { id: "URU", iso2: "uy", name: "Uruguay", group: "H", confederation: "CONMEBOL", flagColors: ["#ffffff", "#7ab2dd", "#ffffff"], primaryColor: "#7ab2dd", strength: 80, keyPlayers: ["Federico Valverde", "Darwin Núñez", "Ronald Araújo"], fifaRanking: 11 },

  // ── Group I (France, Senegal, Iraq, Norway) ──
  { id: "FRA", iso2: "fr", name: "France", group: "I", confederation: "UEFA", flagColors: ["#002395", "#ffffff", "#ed2939"], primaryColor: "#002395", strength: 89, keyPlayers: ["Kylian Mbappé", "Aurélien Tchouaméni", "Ousmane Dembélé"], fifaRanking: 2 },
  { id: "SEN", iso2: "sn", name: "Senegal", group: "I", confederation: "CAF", flagColors: ["#00853f", "#fdef42", "#e31b23"], primaryColor: "#00853f", strength: 74, keyPlayers: ["Sadio Mané", "Nicolas Jackson", "Pape Matar Sarr"], fifaRanking: 17 },
  { id: "IRQ", iso2: "iq", name: "Iraq", group: "I", confederation: "AFC", flagColors: ["#ce1126", "#ffffff", "#000000"], primaryColor: "#007a3d", strength: 56, keyPlayers: ["Aymen Hussein", "Ali Al-Hamadi", "Ibrahim Bayesh"], fifaRanking: 58 },
  { id: "NOR", iso2: "no", name: "Norway", group: "I", confederation: "UEFA", flagColors: ["#ba0c2f", "#ffffff", "#00205b"], primaryColor: "#ba0c2f", strength: 77, keyPlayers: ["Erling Haaland", "Martin Ødegaard", "Alexander Sørloth"], fifaRanking: 29 },

  // ── Group J (Argentina, Algeria, Austria, Jordan) ──
  { id: "ARG", iso2: "ar", name: "Argentina", group: "J", confederation: "CONMEBOL", flagColors: ["#74acdf", "#ffffff", "#74acdf"], primaryColor: "#74acdf", strength: 90, keyPlayers: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez"], fifaRanking: 1 },
  { id: "ALG", iso2: "dz", name: "Algeria", group: "J", confederation: "CAF", flagColors: ["#006233", "#ffffff", "#d21034"], primaryColor: "#006233", strength: 68, keyPlayers: ["Riyad Mahrez", "Amine Gouiri", "Houssem Aouar"], fifaRanking: 36 },
  { id: "AUT", iso2: "at", name: "Austria", group: "J", confederation: "UEFA", flagColors: ["#ed2939", "#ffffff", "#ed2939"], primaryColor: "#ed2939", strength: 74, keyPlayers: ["Marcel Sabitzer", "Christoph Baumgartner", "Konrad Laimer"], fifaRanking: 23 },
  { id: "JOR", iso2: "jo", name: "Jordan", group: "J", confederation: "AFC", flagColors: ["#000000", "#ffffff", "#007a3d"], primaryColor: "#ce1126", strength: 57, keyPlayers: ["Mousa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan"], fifaRanking: 62 },

  // ── Group K (Portugal, DR Congo, Uzbekistan, Colombia) ──
  { id: "POR", iso2: "pt", name: "Portugal", group: "K", confederation: "UEFA", flagColors: ["#006600", "#ff0000", "#ffe900"], primaryColor: "#006600", strength: 86, keyPlayers: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão"], fifaRanking: 6 },
  { id: "COD", iso2: "cd", name: "DR Congo", group: "K", confederation: "CAF", flagColors: ["#007fff", "#f7d618", "#ce1021"], primaryColor: "#007fff", strength: 62, keyPlayers: ["Cédric Bakambu", "Yoane Wissa", "Chancel Mbemba"], fifaRanking: 56 },
  { id: "UZB", iso2: "uz", name: "Uzbekistan", group: "K", confederation: "AFC", flagColors: ["#0099b5", "#ffffff", "#1eb53a"], primaryColor: "#0099b5", strength: 60, keyPlayers: ["Abbosbek Fayzullaev", "Eldor Shomurodov", "Khojimat Erkinov"], fifaRanking: 60 },
  { id: "COL", iso2: "co", name: "Colombia", group: "K", confederation: "CONMEBOL", flagColors: ["#fcd116", "#003893", "#ce1126"], primaryColor: "#fcd116", strength: 81, keyPlayers: ["Luis Díaz", "James Rodríguez", "Jhon Durán"], fifaRanking: 14 },

  // ── Group L (England, Croatia, Ghana, Panama) ──
  { id: "ENG", iso2: "gb-eng", name: "England", group: "L", confederation: "UEFA", flagColors: ["#ffffff", "#ce1124", "#ffffff"], primaryColor: "#ce1124", strength: 87, keyPlayers: ["Jude Bellingham", "Harry Kane", "Bukayo Saka"], fifaRanking: 4 },
  { id: "CRO", iso2: "hr", name: "Croatia", group: "L", confederation: "UEFA", flagColors: ["#ff0000", "#ffffff", "#171796"], primaryColor: "#ff0000", strength: 78, keyPlayers: ["Luka Modrić", "Joško Gvardiol", "Mateo Kovačić"], fifaRanking: 10 },
  { id: "GHA", iso2: "gh", name: "Ghana", group: "L", confederation: "CAF", flagColors: ["#ce1126", "#fcd116", "#006b3f"], primaryColor: "#fcd116", strength: 66, keyPlayers: ["Mohammed Kudus", "Thomas Partey", "Antoine Semenyo"], fifaRanking: 64 },
  { id: "PAN", iso2: "pa", name: "Panama", group: "L", confederation: "CONCACAF", flagColors: ["#da121a", "#ffffff", "#072357"], primaryColor: "#da121a", strength: 61, keyPlayers: ["Adalberto Carrasquilla", "Ismael Díaz", "José Fajardo"], fifaRanking: 33 },
];

export const TEAMS_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t])
);

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;
