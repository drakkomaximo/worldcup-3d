"use client";

import { useMemo, useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Match, Team, Tournament } from "@/data/types";
import { useAppStore } from "@/store/useAppStore";
import { getFlagMaterial } from "./sharedResources";

/**
 * Knockout bracket laid flat on the pitch: two halves (8 R32 ties each)
 * converging into the Final at the center. Click a team row to open its panel.
 */

// ── Layout constants ──
const CARD_W = 2.4;
const CARD_D = 1.05;
const X_BY_STAGE = { R32: 13.2, R16: 9.4, QF: 6.0, SF: 3.0 } as const;
const Z_SPACING = 2.05;

// Shared geometries/materials (module-level: created once)
const cardGeom = new THREE.PlaneGeometry(1, 1);
const flagGeom = new THREE.PlaneGeometry(0.36, 0.24);
const cardMat = new THREE.MeshBasicMaterial({ color: "#111827", transparent: true, opacity: 0.85 });
const cardHoverMat = new THREE.MeshBasicMaterial({ color: "#1c2740", transparent: true, opacity: 0.95 });
const finalCardMat = new THREE.MeshBasicMaterial({ color: "#1a1505", transparent: true, opacity: 0.92 });
const lineMat = new THREE.MeshBasicMaterial({ color: "#2a3350" });

function teamById(t: Tournament, id: string): Team {
  return t.teams.find((x) => x.id === id)!;
}

/** Flat elbow connector between two bracket nodes (strips lying on the ground). */
function Connector({ from, to }: { from: [number, number]; to: [number, number] }) {
  const midX = (from[0] + to[0]) / 2;
  const H = 0.03; // strip thickness
  const segs: { pos: [number, number]; len: number; alongX: boolean }[] = [
    { pos: [(from[0] + midX) / 2, from[1]], len: Math.abs(midX - from[0]), alongX: true },
    { pos: [midX, (from[1] + to[1]) / 2], len: Math.abs(to[1] - from[1]) + H, alongX: false },
    { pos: [(midX + to[0]) / 2, to[1]], len: Math.abs(to[0] - midX), alongX: true },
  ];
  return (
    <>
      {segs.map((s, i) =>
        s.len > 0.001 ? (
          <mesh
            key={i}
            geometry={cardGeom}
            material={lineMat}
            position={[s.pos[0], 0.005, s.pos[1]]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={s.alongX ? [s.len, H, 1] : [H, s.len, 1]}
          />
        ) : null
      )}
    </>
  );
}

interface MatchCardProps {
  tournament: Tournament;
  match: Match;
  position: [number, number];
  highlight?: boolean;
  label?: string;
  /** Part of the selected team's run: ring in that team's color */
  ringColor?: string;
  /** A team is selected elsewhere: fade this card */
  faded?: boolean;
}

function MatchCard({ tournament, match, position, highlight, label, ringColor, faded }: MatchCardProps) {
  const selectTeam = useAppStore((s) => s.selectTeam);
  const setFocusTarget = useAppStore((s) => s.setFocusTarget);
  const [hovered, setHovered] = useState(false);

  const home = teamById(tournament, match.homeId);
  const away = teamById(tournament, match.awayId);
  const homeMat = useMemo(() => getFlagMaterial(home), [home]);
  const awayMat = useMemo(() => getFlagMaterial(away), [away]);

  const pick = (teamId: string) => {
    selectTeam(teamId);
    setFocusTarget([position[0], 0.4, position[1] + 0.3]);
  };

  const row = (team: Team, mat: THREE.Material, score: number, z: number, pens?: number) => {
    const isWinner = match.winnerId === team.id;
    const color = isWinner ? "#ffffff" : "#5a637a";
    return (
      <group
        position={[0, 0.02, z]}
        onClick={(e) => {
          e.stopPropagation();
          pick(team.id);
        }}
      >
        <mesh geometry={flagGeom} material={mat} position={[-CARD_W / 2 + 0.35, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <Text position={[-CARD_W / 2 + 0.62, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.22} color={color} anchorX="left" anchorY="middle">
          {team.id}
        </Text>
        <Text position={[CARD_W / 2 - 0.28, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.24} color={isWinner ? "#ffd75e" : color} anchorX="right" anchorY="middle">
          {pens !== undefined ? `${score} (${pens})` : `${score}`}
        </Text>
      </group>
    );
  };

  return (
    <group
      position={[position[0], 0.01, position[1]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.06 : 1}
    >
      <mesh
        geometry={cardGeom}
        material={highlight ? finalCardMat : hovered ? cardHoverMat : cardMat}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[CARD_W, CARD_D, 1]}
      />
      {highlight || ringColor ? (
        <mesh geometry={cardGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} scale={[CARD_W + 0.08, CARD_D + 0.08, 1]}>
          <meshBasicMaterial color={ringColor ?? "#ffd75e"} transparent opacity={ringColor ? 0.55 : 0.35} />
        </mesh>
      ) : null}
      {faded ? (
        <mesh geometry={cardGeom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} scale={[CARD_W, CARD_D, 1]}>
          <meshBasicMaterial color="#060a14" transparent opacity={0.62} depthWrite={false} />
        </mesh>
      ) : null}
      {label ? (
        <Text position={[0, 0.02, -CARD_D / 2 - 0.18]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#8b96ab" anchorX="center">
          {label}
        </Text>
      ) : null}
      {row(home, homeMat, match.homeScore, -0.24, match.penalties?.home)}
      {row(away, awayMat, match.awayScore, 0.24, match.penalties?.away)}
    </group>
  );
}

interface KnockoutViewProps {
  tournament: Tournament;
}

export function KnockoutView({ tournament }: KnockoutViewProps) {
  const selectedTeamId = useAppStore((s) => s.selectedTeamId);
  const selectedTeam = selectedTeamId ? teamById(tournament, selectedTeamId) : null;
  const inRun = (m: Match) =>
    selectedTeamId !== null && (m.homeId === selectedTeamId || m.awayId === selectedTeamId);
  const byStage = useMemo(() => {
    const pick = (s: string) => tournament.knockoutMatches.filter((m) => m.stage === s);
    return { R32: pick("R32"), R16: pick("R16"), QF: pick("QF"), SF: pick("SF"), F: pick("F"), P3: pick("3P") };
  }, [tournament]);

  // z position of every match, computed from its children (pairs feed forward)
  const positions = useMemo(() => {
    const z: Record<string, number[]> = {};
    z.R32 = byStage.R32.map((_, i) => ((i % 8) - 3.5) * Z_SPACING);
    const parent = (child: number[]) => child.filter((_, i) => i % 2 === 0).map((v, i) => (v + child[i * 2 + 1]) / 2);
    z.R16 = parent(z.R32);
    z.QF = parent(z.R16);
    z.SF = parent(z.QF);
    return z;
  }, [byStage]);

  const xOf = (stage: keyof typeof X_BY_STAGE, i: number, count: number) =>
    i < count / 2 ? -X_BY_STAGE[stage] : X_BY_STAGE[stage];

  const champion = teamById(tournament, tournament.championId);
  const championFlag = useMemo(() => getFlagMaterial(champion), [champion]);

  const stages: (keyof typeof X_BY_STAGE)[] = ["R32", "R16", "QF", "SF"];
  const headers: Record<string, string> = { R32: "ROUND OF 32", R16: "ROUND OF 16", QF: "QUARTERS", SF: "SEMIS" };

  return (
    <group>
      {/* Column headers on both halves */}
      {stages.map((s) =>
        [-1, 1].map((side) => (
          <Text
            key={`${s}${side}`}
            position={[side * X_BY_STAGE[s], 0.01, -9.3]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.32}
            color="#4a5468"
            anchorX="center"
          >
            {headers[s]}
          </Text>
        ))
      )}

      {/* Connectors: child card → parent card */}
      {(["R16", "QF", "SF"] as const).map((s) => {
        const childStage = s === "R16" ? "R32" : s === "QF" ? "R16" : "QF";
        return byStage[s].map((_, i) => {
          const px = xOf(s, i, byStage[s].length);
          const pz = positions[s][i];
          return [0, 1].map((k) => {
            const ci = i * 2 + k;
            const cx = xOf(childStage, ci, byStage[childStage].length);
            const cz = positions[childStage][ci];
            const sign = cx < 0 ? 1 : -1;
            return (
              <Connector
                key={`${s}-${i}-${k}`}
                from={[cx + (sign * CARD_W) / 2, cz]}
                to={[px - (sign * CARD_W) / 2, pz]}
              />
            );
          });
        });
      })}
      {/* SF → Final connectors */}
      {byStage.SF.map((_, i) => {
        const cx = xOf("SF", i, 2);
        const sign = cx < 0 ? 1 : -1;
        return (
          <Connector
            key={`f${i}`}
            from={[cx + (sign * CARD_W) / 2, positions.SF[i]]}
            to={[(-sign * CARD_W) / 2, 0]}
          />
        );
      })}

      {/* Round cards */}
      {stages.map((s) =>
        byStage[s].map((m, i) => (
          <MatchCard
            key={m.id}
            tournament={tournament}
            match={m}
            position={[xOf(s, i, byStage[s].length), positions[s][i]]}
            ringColor={inRun(m) ? selectedTeam?.primaryColor : undefined}
            faded={selectedTeamId !== null && !inRun(m)}
          />
        ))
      )}

      {/* Final + Third place */}
      {byStage.F[0] ? (
        <MatchCard
          tournament={tournament}
          match={byStage.F[0]}
          position={[0, 0]}
          highlight
          label="FINAL · Jul 19 · New Jersey"
          ringColor={inRun(byStage.F[0]) ? selectedTeam?.primaryColor : undefined}
          faded={selectedTeamId !== null && !inRun(byStage.F[0])}
        />
      ) : null}
      {byStage.P3[0] ? (
        <MatchCard
          tournament={tournament}
          match={byStage.P3[0]}
          position={[0, 2.6]}
          label="THIRD PLACE"
          ringColor={inRun(byStage.P3[0]) ? selectedTeam?.primaryColor : undefined}
          faded={selectedTeamId !== null && !inRun(byStage.P3[0])}
        />
      ) : null}

      {/* Champion banner above the Final */}
      <group position={[0, 0.02, -2.4]}>
        <Text position={[0, 0, -0.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.34} color="#ffd75e" anchorX="center">
          🏆 CHAMPION
        </Text>
        <mesh geometry={flagGeom} material={championFlag} position={[-0.75, 0.001, 0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={1.6} />
        <Text position={[-0.35, 0, 0.1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#ffffff" anchorX="left" anchorY="middle">
          {champion.name}
        </Text>
      </group>
    </group>
  );
}
