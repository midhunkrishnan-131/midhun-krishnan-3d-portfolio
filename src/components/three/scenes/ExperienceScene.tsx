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
 * ICICI Prudential IT support: a technician at a workstation, seen over the
 * shoulder. The monitor carries a quiet support console; the figure types.
 * Built only from primitives already used in the portfolio — no new assets.
 */
export default function ExperienceScene({
  track,
  progress,
  active,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const typist = useRef<Group>(null);
  const forearm = useRef<Group>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const rows = useRef<(Group | null)[]>([]);
  const lamps = useRef<(MeshStandardMaterial | null)[]>([]);
  const pips = useRef<(MeshStandardMaterial | null)[]>([]);
  const sp = useMemo(() => createScenePointer(), []);
  const heat = useRef(ROWS.map(() => 0));

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.6;
    const open = MathUtils.smoothstep(p, 0.04, 0.5);
    const t = state.clock.elapsedTime;
    group.current.position.y = MathUtils.lerp(-0.25, 0.06, open);
    group.current.rotation.x = MathUtils.lerp(0.16, 0.05, open);
    group.current.rotation.y = Math.sin(t * 0.12) * 0.03;
    group.current.scale.setScalar(MathUtils.lerp(0.92, 1, open));

    // Typing: the right forearm taps the keyboard while the scene is live.
    if (forearm.current) {
      const tap = animate ? (Math.sin(t * 9) * 0.5 + 0.5) * 0.1 : 0;
      forearm.current.rotation.x = 0.35 + tap;
    }
    if (typist.current) {
      typist.current.rotation.z = Math.sin(t * 1.2) * 0.012;
    }
    if (glow.current) {
      glow.current.emissiveIntensity = 0.45 + Math.sin(t * 2.1) * 0.12;
    }

    readScenePointer(track.current, sp);
    for (let i = 0; i < ROWS.length; i++) {
      const y = 0.18 - i * 0.09;
      const dy = sp.inside ? Math.abs(sp.y * 0.7 - y) : 2;
      const target =
        animate && sp.inside ? MathUtils.smoothstep(0.45, 0.06, dy) : 0;
      heat.current[i] = MathUtils.lerp(heat.current[i], target, damp(7, delta));
      const row = rows.current[i];
      if (row) {
        row.scale.x = 0.7 + heat.current[i] * 0.3;
      }
      const lamp = lamps.current[i];
      if (lamp) {
        lamp.emissiveIntensity = 0.2 + heat.current[i] * 1.15;
        lamp.color.lerpColors(DIM, LIT, 0.35 + heat.current[i] * 0.65);
      }
    }
    pips.current.forEach((mat, i) => {
      if (!mat) return;
      const pulse = animate
        ? 0.3 + (Math.sin(t * 2.4 + i * 1.7) * 0.5 + 0.5) * 0.9
        : 0.35;
      mat.emissiveIntensity = pulse;
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.2, 0.45, 5.1]} fov={34} />
      <StudioLights />
      <pointLight
        position={[0.15, 0.85, 0.55]}
        intensity={2.4}
        color={palette.ember}
        distance={5}
        decay={2}
      />
      <group ref={group}>
        {/* Desk */}
        <mesh position={[0, -0.62, 0.15]} receiveShadow castShadow>
          <boxGeometry args={[2.8, 0.08, 1.35]} />
          <meshStandardMaterial
            color={palette.ink800}
            roughness={0.7}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[-1.05, -1.05, 0.4]} castShadow>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial color={palette.ink700} roughness={0.65} />
        </mesh>
        <mesh position={[1.05, -1.05, 0.4]} castShadow>
          <boxGeometry args={[0.08, 0.8, 0.08]} />
          <meshStandardMaterial color={palette.ink700} roughness={0.65} />
        </mesh>

        {/* Monitor + stand */}
        <mesh position={[0.15, -0.42, -0.28]} castShadow>
          <boxGeometry args={[0.36, 0.28, 0.16]} />
          <meshStandardMaterial color={palette.ink700} roughness={0.55} />
        </mesh>
        <mesh position={[0.15, -0.18, -0.28]} castShadow>
          <boxGeometry args={[0.1, 0.28, 0.1]} />
          <meshStandardMaterial color={palette.ink700} roughness={0.55} />
        </mesh>
        <mesh position={[0.15, 0.42, -0.22]} castShadow>
          <boxGeometry args={[1.55, 1.02, 0.08]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.35} />
        </mesh>
        {/* Screen glass / glow */}
        <mesh position={[0.15, 0.42, -0.175]}>
          <boxGeometry args={[1.42, 0.88, 0.01]} />
          <meshStandardMaterial
            ref={glow}
            color="#14110e"
            emissive={palette.ember}
            emissiveIntensity={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Support console rows on the screen */}
        {ROWS.map((row, i) => (
          <group
            key={row}
            ref={(el) => {
              rows.current[i] = el;
            }}
            position={[0.15, 0.72 - i * 0.15, -0.165]}
          >
            <mesh>
              <boxGeometry args={[1.12, 0.09, 0.008]} />
              <meshStandardMaterial
                ref={(mat) => {
                  lamps.current[i] = mat;
                }}
                color={palette.paperDim}
                emissive={palette.ember}
                emissiveIntensity={0.2}
                roughness={0.45}
              />
            </mesh>
          </group>
        ))}

        {/* Keyboard */}
        <mesh position={[0.05, -0.56, 0.42]} castShadow>
          <boxGeometry args={[0.95, 0.04, 0.34]} />
          <meshStandardMaterial color={palette.ink700} roughness={0.5} />
        </mesh>

        {/* Troubleshooting pips on the desk */}
        {[-0.55, -0.35, -0.15].map((x, i) => (
          <mesh key={x} position={[x, -0.56, 0.72]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial
              ref={(mat) => {
                pips.current[i] = mat;
              }}
              color={palette.ink700}
              emissive={i === 1 ? palette.ember : palette.paperDim}
              emissiveIntensity={0.4}
              roughness={0.35}
            />
          </mesh>
        ))}

        {/* Technician, over the shoulder, slightly to the left */}
        <group ref={typist} position={[-0.15, -0.15, 1.05]}>
          {/* Chair */}
          <mesh position={[-0.05, -0.55, 0.15]} castShadow>
            <boxGeometry args={[0.55, 0.08, 0.5]} />
            <meshStandardMaterial color={palette.ink800} roughness={0.7} />
          </mesh>
          <mesh position={[-0.05, -0.15, 0.36]} castShadow>
            <boxGeometry args={[0.55, 0.7, 0.08]} />
            <meshStandardMaterial color={palette.ink800} roughness={0.7} />
          </mesh>
          {/* Torso */}
          <mesh
            position={[0, 0.05, 0.05]}
            rotation={[0.12, 0.08, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.2, 0.42, 6, 12]} />
            <meshStandardMaterial color={palette.ink700} roughness={0.65} />
          </mesh>
          {/* Head */}
          <mesh position={[0.02, 0.52, 0.08]} castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.7} />
          </mesh>
          {/* Left arm, resting */}
          <mesh
            position={[-0.28, -0.02, 0.12]}
            rotation={[0.9, 0, 0.5]}
            castShadow
          >
            <boxGeometry args={[0.1, 0.42, 0.1]} />
            <meshStandardMaterial color={palette.ink700} roughness={0.65} />
          </mesh>
          {/* Right forearm — typing */}
          <group
            ref={forearm}
            position={[0.26, 0.02, 0.1]}
            rotation={[0.35, 0, -0.4]}
          >
            <mesh position={[0, -0.18, 0]} castShadow>
              <boxGeometry args={[0.1, 0.42, 0.1]} />
              <meshStandardMaterial color={palette.ink700} roughness={0.65} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}
