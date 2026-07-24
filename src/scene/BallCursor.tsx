"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TriondaBall } from "./TriondaBall";
import { useAppStore } from "@/store/useAppStore";

const FLOOR_Y = 0.14;

let shadowTexture: THREE.CanvasTexture | null = null;

/** Soft radial-gradient blob shadow. */
function getShadowTexture(): THREE.CanvasTexture {
  if (shadowTexture) return shadowTexture;
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(0,0,0,0.45)");
  grad.addColorStop(0.6, "rgba(0,0,0,0.18)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);
  shadowTexture = new THREE.CanvasTexture(canvas);
  return shadowTexture;
}

/**
 * The Trionda ball IS the mouse pointer: it rolls across the ground
 * following the cursor (ray-plane intersection + damping).
 */
export function BallCursor() {
  const group = useRef<THREE.Group>(null);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y), []);
  const target = useMemo(() => new THREE.Vector3(0, FLOOR_Y, 2), []);
  const prev = useMemo(() => new THREE.Vector3(), []);

  const shot = useAppStore((s) => s.shot);
  const setShot = useAppStore((s) => s.setShot);
  const selectTeam = useAppStore((s) => s.selectTeam);
  const setImpact = useAppStore((s) => s.setImpact);

  // Shot animation state (refs to avoid re-renders inside the frame loop)
  const shotProgress = useRef(0);
  const reboundProgress = useRef(-1); // -1 = flight phase, >=0 = bouncing off the net
  const shotStart = useMemo(() => new THREE.Vector3(), []);
  const activeShotTeam = useRef<string | null>(null);

  useFrame(({ raycaster, pointer, camera }, delta) => {
    if (!group.current) return;
    const pos = group.current.position;

    // ── Shot mode: driven shot into the net, then a physical bounce-back ──
    if (shot) {
      if (activeShotTeam.current !== shot.teamId) {
        activeShotTeam.current = shot.teamId;
        shotProgress.current = 0;
        reboundProgress.current = -1;
        shotStart.copy(pos);
      }

      if (reboundProgress.current < 0) {
        // Flight: LINEAR speed (a real strike doesn't ease out before the net)
        shotProgress.current = Math.min(shotProgress.current + delta * 4.5, 1);
        const t = shotProgress.current;
        pos.x = THREE.MathUtils.lerp(shotStart.x, shot.target[0], t);
        pos.z = THREE.MathUtils.lerp(shotStart.z, shot.target[2], t);
        pos.y = THREE.MathUtils.lerp(shotStart.y, shot.target[1], t) + Math.sin(t * Math.PI) * 0.12;
        group.current.rotation.x -= delta * 30; // heavy topspin
        // Slight stretch along the direction of travel (motion feel)
        group.current.scale.set(1, 1, 1 + t * 0.12);

        if (t >= 1) {
          // Contact! Net absorbs the ball and the panel opens
          setImpact({ teamId: shot.teamId, x: shot.offsetX });
          selectTeam(shot.teamId);
          reboundProgress.current = 0;
        }
      } else {
        // Rebound: squash on contact, then the net spits the ball back out
        reboundProgress.current = Math.min(reboundProgress.current + delta * 2.4, 1);
        const r = reboundProgress.current;

        // Squash & recover: compressed against the net for the first ~25%
        const squash = r < 0.25 ? 1 - 0.45 * Math.sin((r / 0.25) * Math.PI) : 1;
        group.current.scale.set(2 - squash, 1, squash);

        // The ball only leaves the net after the squash releases
        const out = Math.max(0, (r - 0.2) / 0.8);
        const ease = 1 - (1 - out) * (1 - out);
        pos.z = shot.target[2] + ease * 0.6;
        pos.y = FLOOR_Y + Math.sin(Math.min(out * 1.5, 1) * Math.PI) * 0.09;
        // Spin freezes while pressed into the net, then a slow backspin
        if (r >= 0.25) group.current.rotation.x += delta * 4;

        if (r >= 1) {
          group.current.scale.set(1, 1, 1);
          setShot(null);
          activeShotTeam.current = null;
        }
      }
      return;
    }

    // ── Cursor mode: follow the mouse on the ground ──
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, target);

    prev.copy(pos);
    pos.x = THREE.MathUtils.damp(pos.x, target.x, 10, delta);
    pos.z = THREE.MathUtils.damp(pos.z, target.z, 10, delta);
    pos.y = THREE.MathUtils.damp(pos.y, FLOOR_Y, 6, delta);

    // Roll according to travel distance/direction
    const dx = pos.x - prev.x;
    const dz = pos.z - prev.z;
    group.current.rotation.z -= dx * 6;
    group.current.rotation.x += dz * 6;
  });

  return (
    <group ref={group} position={[0, FLOOR_Y, 2]}>
      <TriondaBall radius={0.14} spinning={false} />
      {/* Soft shadow blob */}
      <mesh position={[0, -FLOOR_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial map={getShadowTexture()} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}
