import {
  AdditiveBlending,
  Color,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PointsMaterial,
} from "three";
import type { PerfTier } from "@/lib/three/capabilities";
import { palette } from "@/lib/three/presets";

/** Shared material presets. Callers own the returned material and must dispose it. */
export const materials = {
  /** Satin dark lacquer — the base surface of most objects. */
  ink: (tier: PerfTier) =>
    tier === "low"
      ? new MeshStandardMaterial({
          color: palette.ink700,
          roughness: 0.55,
          metalness: 0.2,
        })
      : new MeshPhysicalMaterial({
          color: palette.ink700,
          roughness: 0.42,
          metalness: 0.25,
          clearcoat: 0.6,
          clearcoatRoughness: 0.35,
        }),
  /** Warm paper / bone. */
  paper: () =>
    new MeshStandardMaterial({
      color: palette.paper,
      roughness: 0.75,
      metalness: 0,
    }),
  /** Self-lit ember accent. */
  ember: (intensity = 1.6) =>
    new MeshStandardMaterial({
      color: palette.ember,
      emissive: new Color(palette.ember),
      emissiveIntensity: intensity,
      roughness: 0.4,
    }),
  line: (color: string = palette.paperDim, opacity = 0.35) =>
    new LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  glowPoints: (size: number, color: string = palette.emberSoft) =>
    new PointsMaterial({
      color,
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
};
