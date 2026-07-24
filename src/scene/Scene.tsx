"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { fetchTournament } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { GroupsView } from "./GroupsView";
import { KnockoutView } from "./KnockoutView";
import { BallCursor } from "./BallCursor";
import { AnimatePresence } from "framer-motion";
import { Hud } from "@/components/Hud";
import { TeamPanel } from "@/components/TeamPanel";
import { StartMenu } from "@/features/start-menu/StartMenu";
import { GroupSlider } from "@/features/group-browser/GroupSlider";
import { TeamSelect } from "@/features/team-select/TeamSelect";
import { MusicPlayer } from "@/components/MusicPlayer";
import type { Team } from "@/data/types";

/** Animates each view in with a rise + scale-up when it mounts. */
function ViewTransition({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (!g.current) return;
    t.current += delta;
    const s = THREE.MathUtils.damp(g.current.scale.x, 1, 6, delta);
    g.current.scale.setScalar(s);
    g.current.position.y = THREE.MathUtils.damp(g.current.position.y, 0, 6, delta);
  });

  return (
    <group ref={g} scale={0.88} position={[0, -0.9, 0]}>
      {children}
    </group>
  );
}

/**
 * Camera brain:
 * - WASD / arrow keys pan smoothly across the field (camera-relative)
 * - +/- zoom in/out
 * - re-centers the orbit on the last clicked goal
 */
function CameraRig() {
  const focusTarget = useAppStore((s) => s.focusTarget);
  const setFocusTarget = useAppStore((s) => s.setFocusTarget);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {
    target: THREE.Vector3;
    update: () => void;
  } | null;

  const impact = useAppStore((s) => s.impact);
  const shakeT = useRef(1); // seconds since last impact (>0.35 = idle)
  useEffect(() => {
    if (impact) shakeT.current = 0;
  }, [impact]);

  const keys = useRef<Set<string>>(new Set());
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const move = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Don't steal keys when typing in inputs
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controls) return;
    // Keyboard belongs to the 2D overlays (menu / group slider) while they're open
    if (useAppStore.getState().screen !== "stage") return;
    const k = keys.current;

    let dx = 0;
    let dz = 0;
    if (k.has("KeyW") || k.has("ArrowUp")) dz += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) dz -= 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) dx -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) dx += 1;
    const zoom = (k.has("Equal") || k.has("NumpadAdd") ? 1 : 0) - (k.has("Minus") || k.has("NumpadSubtract") ? 1 : 0);

    if (dx !== 0 || dz !== 0) {
      // Manual movement cancels the goal focus
      if (focusTarget) setFocusTarget(null);
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      right.crossVectors(fwd, camera.up).normalize();
      const speed = 9 * delta;
      move.copy(fwd).multiplyScalar(dz * speed).addScaledVector(right, dx * speed);
      camera.position.add(move);
      controls.target.add(move);
      controls.update();
    }

    if (zoom !== 0) {
      const dir = move.copy(controls.target).sub(camera.position);
      const dist = dir.length();
      if ((zoom > 0 && dist > 2) || (zoom < 0 && dist < 28)) {
        camera.position.addScaledVector(dir.normalize(), zoom * 8 * delta);
        controls.update();
      }
    }

    if (focusTarget) {
      const t = controls.target;
      t.x = THREE.MathUtils.damp(t.x, focusTarget[0], 4, delta);
      t.y = THREE.MathUtils.damp(t.y, focusTarget[1], 4, delta);
      t.z = THREE.MathUtils.damp(t.z, focusTarget[2], 4, delta);
      controls.update();
    }

    // Impact camera shake: tiny decaying jolt (~0.35s)
    if (shakeT.current < 0.35) {
      shakeT.current += delta;
      const amp = 0.05 * Math.exp(-shakeT.current * 9);
      camera.position.x += (Math.random() - 0.5) * amp;
      camera.position.y += (Math.random() - 0.5) * amp;
    }
  });
  return null;
}

export function Scene() {
  const [canvasKey, setCanvasKey] = useState(0);
  const { tournament, loading, error, screen, view, setTournament, setError, setShot, setFocusTarget } =
    useAppStore();

  useEffect(() => {
    fetchTournament().then(setTournament).catch((e) => setError(e.message));
  }, [setTournament, setError]);

  const handleSelect = (team: Team, worldPos: [number, number, number], offsetX: number) => {
    // Shoot the cursor ball into the goal; the panel opens on impact
    setShot({ teamId: team.id, target: worldPos, offsetX });
    // Re-center the orbit on this goal so the user can inspect it freely
    setFocusTarget([worldPos[0] - offsetX, 0.4, worldPos[2] + 0.3]);
  };

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#060a14] text-red-400">
        {error}
      </div>
    );
  }

  const inStage = screen === "stage";

  return (
    <div className={`relative h-screen w-screen ${inStage ? "cursor-none" : ""}`}>
      <MusicPlayer />
      <AnimatePresence>
        {screen === "menu" ? <StartMenu key="start-menu" /> : null}
        {screen === "groups" ? <GroupSlider key="group-slider" /> : null}
        {screen === "teams" ? <TeamSelect key="team-select" /> : null}
      </AnimatePresence>

      {inStage ? (
        <>
          <Hud />
          <TeamPanel />
        </>
      ) : null}

      {loading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#060a14]">
          <div className="animate-bounce text-5xl">⚽</div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-300">
            FIFA World Cup 2026
          </p>
          <p className="text-xs text-zinc-500">Loading group stage…</p>
        </div>
      ) : null}

      <Canvas
        key={canvasKey}
        camera={{ position: [0, 16, 13], fov: 45 }}
        dpr={1}
        gl={{ powerPreference: "high-performance", antialias: false }}
        onCreated={({ gl }) => {
          // Auto-recover: if the GPU drops the WebGL context, remount the canvas
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL context lost — remounting canvas");
            setTimeout(() => setCanvasKey((k) => k + 1), 500);
          });
        }}
      >
        <color attach="background" args={["#060a14"]} />
        <fog attach="fog" args={["#060a14", 22, 55]} />

        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 8, 4]} intensity={1.4} />
        {/* Fill lights instead of external HDR environment */}
        <pointLight position={[-8, 6, -6]} intensity={16} color="#4a6cf7" />
        <pointLight position={[8, 5, 6]} intensity={12} color="#f7c84a" />

        {tournament && view === "groups" ? (
          <ViewTransition key="groups">
            <GroupsView tournament={tournament} onSelect={handleSelect} />
          </ViewTransition>
        ) : null}

        {tournament && view === "knockout" ? (
          <ViewTransition key="knockout">
            <KnockoutView tournament={tournament} />
          </ViewTransition>
        ) : null}

        {/* The ball follows the mouse (stage only) */}
        {inStage ? <BallCursor /> : null}
        <CameraRig />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#0a0f1d" roughness={1} />
        </mesh>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          screenSpacePanning={false}
          panSpeed={1.2}
          zoomToCursor
          minDistance={1.2}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
          mouseButtons={{
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
        />
      </Canvas>
    </div>
  );
}
