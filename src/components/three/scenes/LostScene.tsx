"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils } from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { createScenePointer, readScenePointer } from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const GLYPHS = [
  { ch: "4", x: -1.15, y: 0.1 },
  { ch: "0", x: 0, y: 0.1 },
  { ch: "4", x: 1.15, y: 0.1 },
];

/**
 * A 404 of paper slabs that wander, then settle. The pointer tugs them off
 * course; they always find their way back.
 */
export default function LostScene({
  track,
  progress,
  active,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const tiles = useRef<(Group | null)[]>([]);
  const sp = useMemo(() => createScenePointer(), []);

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.7;
    const settle = MathUtils.smoothstep(p, 0.02, 0.55);
    readScenePointer(track.current, sp);
    const t = state.clock.elapsedTime;
    for (let i = 0; i < GLYPHS.length; i++) {
      const tile = tiles.current[i];
      if (!tile) continue;
      const home = GLYPHS[i];
      const wanderX = Math.sin(t * 0.6 + i * 1.7) * (1 - settle) * 0.55;
      const wanderY = Math.cos(t * 0.5 + i) * (1 - settle) * 0.35;
      const tugX = sp.inside ? sp.x * 0.35 : 0;
      const tugY = sp.inside ? sp.y * 0.25 : 0;
      tile.position.x = MathUtils.lerp(
        tile.position.x,
        home.x + wanderX + tugX,
        damp(4, delta),
      );
      tile.position.y = MathUtils.lerp(
        tile.position.y,
        home.y + wanderY + tugY,
        damp(4, delta),
      );
      tile.rotation.z = MathUtils.lerp(
        tile.rotation.z,
        (1 - settle) * 0.2 * (i - 1),
        damp(4, delta),
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={34} />
      <StudioLights />
      <group ref={group}>
        {GLYPHS.map((g, i) => (
          <group
            key={`${g.ch}-${i}`}
            ref={(el) => {
              tiles.current[i] = el;
            }}
            position={[g.x, g.y, 0]}
          >
            <mesh>
              <boxGeometry args={[0.7, 1.05, 0.08]} />
              <meshStandardMaterial
                color={i === 1 ? "#ff7a45" : "#e9e7e2"}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
