"use client";

import { PerspectiveCamera } from "@react-three/drei";
import type { PerfTier } from "@/lib/three/capabilities";
import { lightRig, palette } from "@/lib/three/presets";
import { PaperStack } from "@/components/three/objects/PaperStack";
import type { SceneProps } from "@/types/three";

const PAGE_COUNT: Record<PerfTier, number> = { high: 18, medium: 13, low: 8 };
const SHADOW_SIZE: Record<PerfTier, number> = {
  high: 2048,
  medium: 1024,
  low: 0,
};

/** Hero: the unwritten manuscript as real, thick, shadow-casting paper scrubbed by scroll. */
export default function HeroScene({
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const shadows = tier !== "low";
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0.3, 6.4]}
        fov={35}
        near={0.05}
        far={40}
      />
      <fog attach="fog" args={[palette.ink, 5.5, 13]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={[palette.paper, palette.ink, 0.35]} />
      <directionalLight
        position={[-3.5, 5, 4.5]}
        intensity={lightRig.key.intensity * 1.1}
        color={lightRig.key.color}
        castShadow={shadows}
        shadow-mapSize-width={SHADOW_SIZE[tier]}
        shadow-mapSize-height={SHADOW_SIZE[tier]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-bias={-0.0004}
        shadow-normalBias={0.025}
        shadow-radius={6}
      />
      <pointLight
        position={[4.5, 1.5, -3]}
        intensity={6}
        color={palette.ember}
        distance={14}
        decay={1.6}
      />
      <pointLight
        position={[2, -2.5, 5]}
        intensity={1.2}
        color={palette.paperDim}
        distance={12}
      />
      <PaperStack
        count={PAGE_COUNT[tier]}
        tier={tier}
        animate={animate}
        progress={progress}
        active={active}
      />
    </>
  );
}
