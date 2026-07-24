import * as THREE from "three";
import type { Team } from "@/data/types";

const cache = new Map<string, THREE.CanvasTexture>();
const flagCache = new Map<string, THREE.CanvasTexture>();

/** Plain flag texture (horizontal stripes) for the country badge. */
export function getFlagTexture(team: Team): THREE.CanvasTexture {
  const hit = flagCache.get(team.id);
  if (hit) return hit;

  const W = 128;
  const H = 84;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const colors = team.flagColors;
  const bandH = H / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, bandH * i, W, bandH + 1);
  });
  // Subtle border
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, W, H);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  flagCache.set(team.id, texture);
  return texture;
}

/**
 * Procedural pitch texture: flag-colored grass stripes + white field lines.
 * Generated once per team and cached (48 textures max).
 */
export function getPitchTexture(team: Team): THREE.CanvasTexture {
  const hit = cache.get(team.id);
  if (hit) return hit;

  const W = 512;
  const H = 340;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Flag stripes as grass base ──
  const stripes = 6;
  const colors = team.flagColors;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect((W / stripes) * i, 0, W / stripes + 1, H);
  }

  // Darken + alternate mowing bands so it reads as grass, not a flag
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(0,0,0,0.30)" : "rgba(0,0,0,0.42)";
    ctx.fillRect((W / stripes) * i, 0, W / stripes + 1, H);
  }

  // ── Field lines ──
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 4;
  const m = 24; // margin
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  // Halfway line + center circle
  ctx.beginPath();
  ctx.moveTo(W / 2, m);
  ctx.lineTo(W / 2, H - m);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 5, 0, Math.PI * 2);
  ctx.fill();
  // Penalty boxes
  const boxH = 150;
  const boxW = 70;
  ctx.strokeRect(m, (H - boxH) / 2, boxW, boxH);
  ctx.strokeRect(W - m - boxW, (H - boxH) / 2, boxW, boxH);
  // Goal areas
  const gaH = 76;
  const gaW = 30;
  ctx.strokeRect(m, (H - gaH) / 2, gaW, gaH);
  ctx.strokeRect(W - m - gaW, (H - gaH) / 2, gaW, gaH);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(team.id, texture);
  return texture;
}
