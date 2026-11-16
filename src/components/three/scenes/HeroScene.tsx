"use client";

import { PerspectiveCamera } from "@react-three/drei";
import type { PerfTier } from "@/lib/three/capabilities";
import { ManuscriptPages } from "@/components/three/objects/ManuscriptPages";
import type { SceneProps } from "@/types/three";

const PAGE_COUNT: Record<PerfTier, number> = { high: 16, medium: 11, low: 7 };

/** Hero: the unwritten manuscript, drawn into the hero slot of the shared canvas. */
export default function HeroScene({
  scroll,
  active,
  tier,
  animate,
}: SceneProps) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0.15, 6.2]}
        fov={35}
        near={0.1}
        far={30}
      />
      <ManuscriptPages
        count={PAGE_COUNT[tier]}
        animate={animate}
        scroll={scroll}
        active={active}
      />
    </>
  );
}
