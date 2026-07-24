"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

let sharedTexture: THREE.CanvasTexture | null = null;

/**
 * Procedural texture inspired by the official WC2026 ball (Trionda):
 * white base with red / green / blue triangular panels and gold accents.
 */
function getTriondaTexture(): THREE.CanvasTexture {
  if (sharedTexture) return sharedTexture;
  const W = 512;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, W, H);

  // The real Trionda: 3 LARGE swooping triangular panels (red/green/blue)
  // wrapping around the ball, separated by white gaps with gold seams.
  // Each panel = curved triangle drawn with quadratic bezier edges.
  const panel = (
    cx: number,
    cy: number,
    r: number,
    rot: number,
    color: string
  ) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      const a = rot + (i * Math.PI * 2) / 3;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.72]);
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < 3; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % 3];
      // Curved edge: control point pushed outwards for the swooping look
      const mx = (x1 + x2) / 2 + (y2 - y1) * 0.35;
      const my = (y1 + y2) / 2 - (x2 - x1) * 0.35;
      ctx.quadraticCurveTo(mx, my, x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    // Gold seam
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  // Panels distributed so they tile horizontally (equirect wraps in X)
  panel(W * 0.17, H * 0.42, 92, -0.4, "#c8102e"); // red
  panel(W * 0.5, H * 0.58, 96, 0.7, "#007a33"); // green
  panel(W * 0.83, H * 0.42, 92, -0.4, "#0057b8"); // blue
  // Wrap-around halves at the seam (x=0 / x=W show the same red panel)
  panel(W * 1.17, H * 0.42, 92, -0.4, "#c8102e");
  panel(-W * 0.17, H * 0.42, 92, -0.4, "#c8102e");

  // Small gold triangle accents in the white gaps (Trionda detail)
  ctx.fillStyle = "#d4af37";
  const accents: [number, number, number][] = [
    [W * 0.33, H * 0.22, 7], [W * 0.66, H * 0.25, 6],
    [W * 0.35, H * 0.8, 6], [W * 0.68, H * 0.78, 7],
    [W * 0.02, H * 0.75, 6], [W * 0.98, H * 0.72, 6],
  ];
  for (const [x, y, s] of accents) {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.lineTo(x - s, y + s);
    ctx.closePath();
    ctx.fill();
  }

  sharedTexture = new THREE.CanvasTexture(canvas);
  sharedTexture.colorSpace = THREE.SRGBColorSpace;
  return sharedTexture;
}

interface TriondaBallProps {
  position?: [number, number, number];
  radius?: number;
  spinning?: boolean;
}

export function TriondaBall({ position = [0, 0, 0], radius = 0.16, spinning = true }: TriondaBallProps) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(getTriondaTexture, []);

  useFrame((_, delta) => {
    if (spinning && ref.current) {
      ref.current.rotation.y += delta * 0.9;
      ref.current.rotation.x += delta * 0.35;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial map={texture} roughness={0.35} metalness={0.05} />
    </mesh>
  );
}
