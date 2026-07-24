"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Team } from "@/data/types";
import { getPitchTexture } from "./flagTexture";
import { TriondaBall } from "./TriondaBall";

export const PITCH_W = 1.5;
export const PITCH_H = 1.0;

interface MiniPitchProps {
  team: Team;
  position: [number, number, number];
  onSelect?: (team: Team) => void;
  /** Extra label under the pitch (e.g. "1º · 7 pts") */
  caption?: string;
  dimmed?: boolean;
}

/**
 * A team represented as a 3D pitch tile:
 * flag-striped grass, white lines, spinning Trionda ball in the corner.
 * Hover lifts the tile and glows with the team's primary color.
 */
export function MiniPitch({ team, position, onSelect, caption, dimmed }: MiniPitchProps) {
  const group = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => getPitchTexture(team), [team]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetY = position[1] + (hovered ? 0.22 : 0);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 8, delta);
    if (glowMat.current) {
      glowMat.current.opacity = THREE.MathUtils.damp(glowMat.current.opacity, hovered ? 0.55 : 0, 8, delta);
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(team);
      }}
    >
      {/* Pitch base */}
      <mesh>
        <boxGeometry args={[PITCH_W, 0.08, PITCH_H]} />
        <meshStandardMaterial
          color={dimmed ? "#3a3f4a" : "#ffffff"}
          map={texture}
          roughness={0.85}
        />
      </mesh>

      {/* Glow plane under the pitch (team primary color) */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PITCH_W * 1.25, PITCH_H * 1.25]} />
        <meshBasicMaterial
          ref={glowMat}
          color={team.primaryColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Trionda ball in the corner */}
      <TriondaBall position={[PITCH_W / 2 - 0.18, 0.22, -PITCH_H / 2 + 0.18]} radius={0.11} />

      {/* Team code on the pitch */}
      <Text
        position={[0, 0.06, PITCH_H / 2 - 0.16]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.14}
        color="#ffffff"
        outlineWidth={0.008}
        outlineColor="#000000"
        anchorX="center"
      >
        {team.id}
      </Text>

      {/* Caption under the tile */}
      {caption ? (
        <Text
          position={[0, 0.02, PITCH_H / 2 + 0.16]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.09}
          color="#c9d2e0"
          anchorX="center"
        >
          {caption}
        </Text>
      ) : null}
    </group>
  );
}
