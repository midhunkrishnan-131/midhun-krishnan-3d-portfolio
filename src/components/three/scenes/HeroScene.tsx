"use client";

import { Canvas } from "@react-three/fiber";
import type { PerfTier } from "@/lib/three/capabilities";
import { ManuscriptPages } from "@/components/three/objects/ManuscriptPages";

export interface HeroSceneProps {
  dpr: [number, number];
  tier: PerfTier;
  reducedMotion: boolean;
  active: boolean;
  onReady: () => void;
  onContextLost: () => void;
}

const PAGE_COUNT: Record<PerfTier, number> = { high: 16, medium: 11, low: 7 };

export default function HeroScene({
  dpr,
  tier,
  reducedMotion,
  active,
  onReady,
  onContextLost,
}: HeroSceneProps) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
      camera={{ position: [0, 0.15, 6.2], fov: 35, near: 0.1, far: 30 }}
      gl={{
        antialias: tier !== "low",
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onContextLost();
          },
          { once: true },
        );
        requestAnimationFrame(() => onReady());
      }}
    >
      <ManuscriptPages count={PAGE_COUNT[tier]} animate={!reducedMotion} />
    </Canvas>
  );
}
