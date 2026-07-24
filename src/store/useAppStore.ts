import { create } from "zustand";
import type { Tournament } from "@/data/types";

export type View = "groups" | "knockout";
/** "menu" = start screen, "groups" = 2D group slider, "teams" = character-select, "stage" = 3D scoreboard */
export type Screen = "menu" | "groups" | "teams" | "stage";

interface AppState {
  tournament: Tournament | null;
  screen: Screen;
  /** Background music on/off */
  musicOn: boolean;
  loading: boolean;
  error: string | null;
  view: View;
  /** Team whose detail panel is open */
  selectedTeamId: string | null;
  /** Active shot: the cursor ball flies into this goal, then the panel opens */
  shot: { teamId: string; target: [number, number, number]; offsetX: number } | null;
  /** Net-impact event: which goal + horizontal hit point (local x) */
  impact: { teamId: string; x: number } | null;
  /** Orbit-controls target: set to a goal position on click to inspect it */
  focusTarget: [number, number, number] | null;

  setTournament: (t: Tournament) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setView: (v: View) => void;
  /** Pick a mode from the start menu and jump into the 3D stage */
  enterStage: (v: View) => void;
  /** Back to the start menu */
  goToMenu: () => void;
  /** Open the character-select style team browser */
  openTeams: () => void;
  toggleMusic: () => void;
  selectTeam: (id: string | null) => void;
  setShot: (s: { teamId: string; target: [number, number, number]; offsetX: number } | null) => void;
  setImpact: (i: { teamId: string; x: number } | null) => void;
  setFocusTarget: (t: [number, number, number] | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tournament: null,
  screen: "menu",
  musicOn: true,
  loading: true,
  error: null,
  view: "groups",
  selectedTeamId: null,
  shot: null,
  impact: null,
  focusTarget: null,

  setTournament: (tournament) => set({ tournament, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setView: (view) =>
    set({ view, selectedTeamId: null, shot: null, impact: null, focusTarget: null }),
  enterStage: (view) =>
    set({
      // Group Stage opens the new 2D slider; Knockout goes straight to the 3D stage
      screen: view === "groups" ? "groups" : "stage",
      view,
      selectedTeamId: null,
      shot: null,
      impact: null,
      focusTarget: null,
    }),
  goToMenu: () =>
    set({ screen: "menu", selectedTeamId: null, shot: null, impact: null, focusTarget: null }),
  openTeams: () =>
    set({ screen: "teams", selectedTeamId: null, shot: null, impact: null, focusTarget: null }),
  toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
  selectTeam: (selectedTeamId) => set({ selectedTeamId }),
  setShot: (shot) => set({ shot }),
  setImpact: (impact) => set({ impact }),
  setFocusTarget: (focusTarget) => set({ focusTarget }),
}));
