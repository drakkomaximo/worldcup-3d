import * as THREE from "three";
import type { Team } from "@/data/types";
import { getFlagTexture } from "./flagTexture";
import { flagUrl } from "@/lib/flags";

/**
 * GPU-friendly shared resources: 48 goals reuse the SAME geometries and
 * materials instead of creating ~500 unique GPU objects (fixes Context Lost).
 */

export const GOAL_W = 1.4;
export const GOAL_H = 0.85;
export const GOAL_DEPTH = 0.6;
/** Height of the rear net frame (real goals slope down towards the back) */
export const REAR_H = GOAL_H * 0.45;
const POST_R = 0.03;

// ── Geometries (one of each, ever) ──
export const postGeom = new THREE.CylinderGeometry(POST_R, POST_R, GOAL_H, 8);
export const crossbarGeom = new THREE.CylinderGeometry(POST_R, POST_R, GOAL_W + POST_R * 2, 8);

// Top net: slopes from the crossbar down-back to the rear frame
const TOP_SLOPE = Math.hypot(GOAL_DEPTH, GOAL_H - REAR_H);
export const TOP_NET_ANGLE = Math.atan2(GOAL_DEPTH, GOAL_H - REAR_H);
export const topNetGeom = new THREE.PlaneGeometry(GOAL_W, TOP_SLOPE);
// Rear net: vertical, from the rear frame down to the ground
export const rearNetGeom = new THREE.PlaneGeometry(GOAL_W, REAR_H);
// Side nets: real trapezoid profile (front tall → rear low)
const sideShape = new THREE.Shape();
sideShape.moveTo(0, 0);
sideShape.lineTo(0, GOAL_H);
sideShape.lineTo(GOAL_DEPTH, REAR_H);
sideShape.lineTo(GOAL_DEPTH, 0);
sideShape.closePath();
export const sideNetGeom = new THREE.ShapeGeometry(sideShape);
sideNetGeom.rotateY(Math.PI / 2); // lies in the ZY plane, x=0
// Rear support stanchions (crossbar ends → rear ground corners)
export const STANCHION_LEN = Math.hypot(GOAL_H, GOAL_DEPTH);
export const STANCHION_ANGLE = Math.atan2(GOAL_DEPTH, GOAL_H);
export const stanchionGeom = new THREE.CylinderGeometry(POST_R * 0.6, POST_R * 0.6, STANCHION_LEN, 6);

export const flagGeom = new THREE.PlaneGeometry(0.3, 0.2);
export const glowGeom = new THREE.CircleGeometry(GOAL_W * 0.75, 24);

// ── Net texture (shared) ──
let netTexture: THREE.CanvasTexture | null = null;
function getNetTexture(): THREE.CanvasTexture {
  if (netTexture) return netTexture;
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= S; i += 12) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
  }
  netTexture = new THREE.CanvasTexture(canvas);
  netTexture.wrapS = netTexture.wrapT = THREE.RepeatWrapping;
  netTexture.repeat.set(3, 2);
  return netTexture;
}

// ── Materials (shared per visual state) ──
function makeMaterials() {
  const net = getNetTexture();
  return {
    post: new THREE.MeshStandardMaterial({ color: "#f5f5f5", roughness: 0.4 }),
    postDimmed: new THREE.MeshStandardMaterial({ color: "#6b7280", roughness: 0.4 }),
    backNet: new THREE.MeshBasicMaterial({
      map: net, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
    }),
    backNetDimmed: new THREE.MeshBasicMaterial({
      map: net, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false,
    }),
    sideNet: new THREE.MeshBasicMaterial({
      map: net, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false,
    }),
    sideNetDimmed: new THREE.MeshBasicMaterial({
      map: net, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false,
    }),
  };
}

let materials: ReturnType<typeof makeMaterials> | null = null;
export function getGoalMaterials() {
  if (!materials) materials = makeMaterials();
  return materials;
}

// ── Flag materials (one per team, cached) ──
// Starts with the procedural stripes, then upgrades to the REAL flag
// (flagcdn.com, public domain) once it loads. Offline-safe fallback.
const flagMats = new Map<string, THREE.MeshBasicMaterial>();
const flagLoader = new THREE.TextureLoader();
flagLoader.setCrossOrigin("anonymous");

export function getFlagMaterial(team: Team): THREE.MeshBasicMaterial {
  const hit = flagMats.get(team.id);
  if (hit) return hit;
  const mat = new THREE.MeshBasicMaterial({
    map: getFlagTexture(team),
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  flagMats.set(team.id, mat);

  flagLoader.load(
    flagUrl(team.iso2, 160),
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      mat.map = tex;
      mat.needsUpdate = true;
    },
    undefined,
    () => {
      /* network failed — keep procedural stripes */
    }
  );
  return mat;
}
