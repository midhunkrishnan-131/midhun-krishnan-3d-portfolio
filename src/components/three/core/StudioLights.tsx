"use client";

import { lightRig } from "@/lib/three/presets";

/** Shared cinematic three-point rig: cool paper key, ember rim, soft fill. */
export function StudioLights({ rim = 1 }: { rim?: number }) {
  return (
    <>
      <ambientLight intensity={lightRig.ambient} />
      <directionalLight
        position={[...lightRig.key.position]}
        intensity={lightRig.key.intensity}
        color={lightRig.key.color}
      />
      <pointLight
        position={[...lightRig.rim.position]}
        intensity={lightRig.rim.intensity * rim}
        color={lightRig.rim.color}
        distance={18}
        decay={1.4}
      />
      <pointLight
        position={[...lightRig.fill.position]}
        intensity={lightRig.fill.intensity}
        color={lightRig.fill.color}
        distance={14}
      />
    </>
  );
}
