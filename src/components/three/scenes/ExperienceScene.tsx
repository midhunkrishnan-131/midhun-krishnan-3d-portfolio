"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, Group, MathUtils, MeshStandardMaterial } from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { createScenePointer, readScenePointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const DIM = new Color(palette.paperDim);
const LIT = new Color(palette.ember);
const ROWS = ["SYS", "NET", "ACC", "RDP", "DOC"];

/**
 * Experience: a quiet terminal whose status rows react as the pointer passes.
 * Nothing flashes for its own sake — a row comes online only when you attend to it.
 */
export default function ExperienceScene({
  track,
  progress,
  active,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const rows = useRef<(Group | null)[]>([]);
  const lamps = useRef<(MeshStandardMaterial | null)[]>([]);
  const sp = useMemo(() => createScenePointer(), []);
  const heat = useRef(ROWS.map(() => 0));

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.6;
    const open = MathUtils.smoothstep(p, 0.04, 0.5);
    group.current.position.y = MathUtils.lerp(-0.3, 0.1, open);
    group.current.rotation.x = MathUtils.lerp(0.18, 0.04, open);

    readScenePointer(track.current, sp);
    for (let i = 0; i < ROWS.length; i++) {
      const y = 0.7 - i * 0.34;
      const dy = sp.inside ? Math.abs(sp.y * 1.4 - y) : 2;
      const target =
        animate && sp.inside ? MathUtils.smoothstep(0.55, 0.08, dy) : 0;
      heat.current[i] = MathUtils.lerp(heat.current[i], target, damp(7, delta));
      const row = rows.current[i];
      if (row) {
        row.position.x = MathUtils.lerp(
          row.position.x,
          heat.current[i] * 0.08,
          damp(6, delta),
        );
      }
      const lamp = lamps.current[i];
      if (lamp) {
        lamp.emissiveIntensity = 0.15 + heat.current[i] * 1.1;
        lamp.color.lerpColors(DIM, LIT, heat.current[i]);
      }
    }
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.03;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.05, 6]} fov={34} />
      <StudioLights />
      <group ref={group}>
        <mesh position={[0, 0.05, -0.2]} receiveShadow>
          <boxGeometry args={[3.4, 2.2, 0.08]} />
          <meshStandardMaterial color={palette.ink800} roughness={0.7} />
        </mesh>
        {ROWS.map((row, i) => (
          <group
            key={row}
            ref={(el) => {
              rows.current[i] = el;
            }}
            position={[0, 0.7 - i * 0.34, 0.02]}
          >
            <mesh>
              <boxGeometry args={[2.8, 0.26, 0.04]} />
              <meshStandardMaterial color={palette.ink700} roughness={0.65} />
            </mesh>
            <mesh position={[-1.2, 0, 0.04]}>
              <circleGeometry args={[0.06, 16]} />
              <meshStandardMaterial
                ref={(el) => {
                  lamps.current[i] = el;
                }}
                color={palette.paperDim}
                emissive={palette.ember}
                emissiveIntensity={0.15}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
