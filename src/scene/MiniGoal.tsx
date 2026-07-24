"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { Team } from "@/data/types";
import { useAppStore } from "@/store/useAppStore";
import {
  GOAL_W,
  GOAL_H,
  GOAL_DEPTH,
  REAR_H,
  TOP_NET_ANGLE,
  STANCHION_ANGLE,
  postGeom,
  crossbarGeom,
  topNetGeom,
  rearNetGeom,
  sideNetGeom,
  stanchionGeom,
  flagGeom,
  glowGeom,
  getGoalMaterials,
  getFlagMaterial,
} from "./sharedResources";

export { GOAL_W, GOAL_H, GOAL_DEPTH };

/**
 * Physical net reaction: the mesh bulges BACKWARD at the exact hit point
 * (like a real net absorbing the ball), then springs back with a damped
 * oscillation. No particles — just cloth-like deformation.
 */
function NetImpact({ impactX }: { impactX: number }) {
  const netRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  const geom = useMemo(() => new THREE.PlaneGeometry(GOAL_W, REAR_H, 20, 8), []);
  const basePos = useMemo(() => geom.attributes.position.array.slice(), [geom]);

  useFrame((_, delta) => {
    t.current += delta;
    const time = t.current;
    if (!netRef.current) return;

    // Bulge envelope: fast punch out (~90ms), then damped spring back
    const PUNCH_T = 0.07;
    const depth =
      time < PUNCH_T
        ? 0.42 * (time / PUNCH_T)
        : Math.max(-0.05, 0.42 * Math.cos((time - PUNCH_T) * 17) * Math.exp(-(time - PUNCH_T) * 5.5));

    const pos = netRef.current.geometry.attributes.position;
    const impactY = 0.16 - REAR_H / 2; // ball hits low (plane is centered at REAR_H/2)
    for (let i = 0; i < pos.count; i++) {
      const bx = basePos[i * 3];
      const by = basePos[i * 3 + 1];
      const dist = Math.hypot(bx - impactX, by - impactY);
      // Gaussian pocket around the hit point — like a ball-sized dent
      const pocket = Math.exp(-(dist * dist) / (2 * 0.18 * 0.18));
      pos.setZ(i, basePos[i * 3 + 2] - depth * pocket);
    }
    pos.needsUpdate = true;
  });

  const mats = getGoalMaterials();
  return (
    <mesh
      ref={netRef}
      geometry={geom}
      material={mats.backNet}
      position={[0, REAR_H / 2, -GOAL_DEPTH - 0.005]}
    />
  );
}

interface MiniGoalProps {
  team: Team;
  position: [number, number, number];
  /** worldPos = shot landing point; offsetX = hit point relative to goal center */
  onSelect?: (team: Team, worldPos: [number, number, number], offsetX: number) => void;
  /** Extra label under the goal (e.g. "1st · 7 pts") */
  caption?: string;
  dimmed?: boolean;
}

/**
 * A team represented as a 3D goal:
 * white posts + crossbar, netting, country flag badge on the corner,
 * team code on the ground. Hover lifts the goal and glows in team color.
 */
export function MiniGoal({ team, position, onSelect, caption, dimmed }: MiniGoalProps) {
  const group = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const impact = useAppStore((s) => s.impact);
  const setImpact = useAppStore((s) => s.setImpact);
  const impacting = impact?.teamId === team.id;

  useEffect(() => {
    if (!impacting) return;
    const timer = setTimeout(() => setImpact(null), 900);
    return () => clearTimeout(timer);
  }, [impacting, setImpact]);

  const mats = useMemo(getGoalMaterials, []);
  const flagMat = useMemo(() => getFlagMaterial(team), [team]);

  const postMat = dimmed ? mats.postDimmed : mats.post;
  const backNetMat = dimmed ? mats.backNetDimmed : mats.backNet;
  const sideNetMat = dimmed ? mats.sideNetDimmed : mats.sideNet;

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetY = position[1] + (hovered ? 0.12 : 0);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 8, delta);
    if (glowMat.current) {
      glowMat.current.opacity = THREE.MathUtils.damp(glowMat.current.opacity, hovered ? 0.5 : 0, 8, delta);
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Single invisible hitbox: keeps the raycaster to 1 object per goal (48 total)
          instead of every post/net mesh (~600 objects) */}
      <mesh
        position={[0, GOAL_H / 2, -GOAL_DEPTH / 2]}
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (!group.current) return;
          const wp = new THREE.Vector3();
          group.current.getWorldPosition(wp);
          // Land INSIDE the goal at a random spot along the net, low
          const offsetX = (Math.random() - 0.5) * GOAL_W * 0.55;
          onSelect?.(team, [wp.x + offsetX, 0.16, wp.z - GOAL_DEPTH * 0.8], offsetX);
        }}
      >
        <boxGeometry args={[GOAL_W + 0.5, GOAL_H + 0.4, GOAL_DEPTH + 1.2]} />
      </mesh>
      {/* Posts (shared geometry + material) */}
      <mesh geometry={postGeom} material={postMat} position={[-GOAL_W / 2, GOAL_H / 2, 0]} />
      <mesh geometry={postGeom} material={postMat} position={[GOAL_W / 2, GOAL_H / 2, 0]} />
      {/* Crossbar */}
      <mesh
        geometry={crossbarGeom}
        material={postMat}
        position={[0, GOAL_H, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />

      {/* Rear support stanchions */}
      {[-1, 1].map((s) => (
        <mesh
          key={`st${s}`}
          geometry={stanchionGeom}
          material={postMat}
          position={[(GOAL_W / 2) * s, GOAL_H / 2, -GOAL_DEPTH / 2]}
          rotation={[STANCHION_ANGLE, 0, 0]}
        />
      ))}

      {/* Top net: crossbar → rear frame */}
      <mesh
        geometry={topNetGeom}
        material={backNetMat}
        position={[0, (GOAL_H + REAR_H) / 2, -GOAL_DEPTH / 2]}
        rotation={[TOP_NET_ANGLE, 0, 0]}
      />
      {/* Rear net: rear frame → ground (hidden while rippling) */}
      {!impacting ? (
        <mesh
          geometry={rearNetGeom}
          material={backNetMat}
          position={[0, REAR_H / 2, -GOAL_DEPTH]}
        />
      ) : null}
      {/* Side nets (trapezoid profile) */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          geometry={sideNetGeom}
          material={sideNetMat}
          position={[(GOAL_W / 2) * s, 0, 0]}
        />
      ))}

      {/* Impact: cloth-like net deformation at the hit point */}
      {impacting ? <NetImpact impactX={impact.x} /> : null}

      {/* Country flag badge on the top corner of the goal */}
      <mesh
        geometry={flagGeom}
        material={flagMat}
        position={[GOAL_W / 2 + 0.02, GOAL_H + 0.16, 0]}
      />

      {/* Glow disc on the ground (team primary color, per-instance material) */}
      <mesh geometry={glowGeom} position={[0, 0.005, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshBasicMaterial
          ref={glowMat}
          color={team.primaryColor}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Single text per goal: code + caption */}
      <Text
        position={[0, 0.01, 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.14}
        lineHeight={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
        textAlign="center"
      >
        {caption ? `${team.id}\n${caption}` : team.id}
      </Text>
    </group>
  );
}
