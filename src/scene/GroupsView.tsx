"use client";

import { Text } from "@react-three/drei";
import { GROUPS } from "@/data/teams";
import type { Team, Tournament } from "@/data/types";
import { MiniGoal } from "./MiniGoal";

const COLS = 4;
const CELL_W = 7.2;
const CELL_D = 6.8;
const GOAL_DX = 3.0;
const GOAL_DZ = 2.9;

function ordinal(n: number): string {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}

interface GroupsViewProps {
  tournament: Tournament;
  onSelect: (team: Team, worldPos: [number, number, number], offsetX: number) => void;
}

/**
 * Group-stage dashboard: 12 groups in a 4x3 grid,
 * each group shows its 4 goals (sorted by standing) + group letter.
 */
export function GroupsView({ tournament, onSelect }: GroupsViewProps) {
  return (
    <group>
      {GROUPS.map((g, gi) => {
        const col = gi % COLS;
        const row = Math.floor(gi / COLS);
        const x0 = (col - (COLS - 1) / 2) * CELL_W;
        const z0 = (row - 1) * CELL_D;

        const standing = tournament.standings.find((s) => s.group === g)!;

        return (
          <group key={g} position={[x0, 0, z0]}>
            {/* Group label */}
            <Text
              position={[0, 0.01, -GOAL_DZ - 0.7]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.5}
              color="#8b96ab"
              anchorX="center"
            >
              {`GROUP ${g}`}
            </Text>

            {standing.rows.map((rowData, i) => {
              const team = tournament.teams.find((t) => t.id === rowData.teamId)!;
              const gx = ((i % 2) - 0.5) * GOAL_DX;
              const gz = (Math.floor(i / 2) - 0.5) * GOAL_DZ;
              return (
                <MiniGoal
                  key={team.id}
                  team={team}
                  position={[gx, 0, gz]}
                  caption={`${ordinal(rowData.position)} · ${rowData.points} pts`}
                  dimmed={rowData.position > 2}
                  onSelect={onSelect}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
