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

const DIM = new Color("#8f8c84");
const LIT = new Color(palette.ember);
const OK = new Color("#5a9a62");
const ROWS = 5;

type Joint = Group;

/**
 * ICICI Prudential IT support: a proportioned stylised technician at a
 * workstation, with animated joints (spine, neck, shoulders, elbows, wrists)
 * and a support console that changes as the cycle and the pointer move.
 */
export default function ExperienceScene({
  track,
  progress,
  active,
  animate,
}: SceneProps) {
  const root = useRef<Group>(null);
  const spine = useRef<Joint>(null);
  const head = useRef<Joint>(null);
  const lArm = useRef<Joint>(null);
  const rArm = useRef<Joint>(null);
  const lFore = useRef<Joint>(null);
  const rFore = useRef<Joint>(null);
  const lHand = useRef<Joint>(null);
  const rHand = useRef<Joint>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const lamps = useRef<(MeshStandardMaterial | null)[]>([]);
  const pips = useRef<(MeshStandardMaterial | null)[]>([]);
  const heat = useRef(Array.from({ length: ROWS }, () => 0));
  const sp = useMemo(() => createScenePointer(), []);
  const cycle = useRef(0);

  useFrame((state, delta) => {
    if (!root.current || !active.current) return;
    const p = animate ? progress.current : 0.65;
    const open = MathUtils.smoothstep(p, 0.04, 0.48);
    const t = state.clock.elapsedTime;
    cycle.current = animate ? (t % 8) / 8 : 0.15;

    root.current.position.y = MathUtils.lerp(-0.2, 0.04, open);
    root.current.rotation.x = MathUtils.lerp(0.14, 0.04, open);
    root.current.rotation.y = Math.sin(t * 0.1) * 0.03;
    root.current.scale.setScalar(MathUtils.lerp(0.94, 1, open));

    const c = cycle.current;
    // 0–0.28 type, 0.28–0.42 reach for the mouse, 0.42–0.58 look + click,
    // 0.58–0.8 lean in to troubleshoot, 0.8–1 return to typing.
    const type = c < 0.28 || c > 0.8 ? 1 : Math.max(0, 1 - (c - 0.28) / 0.08);
    const reach =
      MathUtils.smoothstep(c, 0.26, 0.4) *
      (1 - MathUtils.smoothstep(c, 0.55, 0.72));
    const trouble =
      MathUtils.smoothstep(c, 0.56, 0.68) *
      (1 - MathUtils.smoothstep(c, 0.78, 0.9));
    const tap =
      animate && type > 0.4 ? (Math.sin(t * 14) * 0.5 + 0.5) * 0.16 : 0;
    const tapL =
      animate && type > 0.4 ? (Math.sin(t * 14 + 1.3) * 0.5 + 0.5) * 0.14 : 0;

    if (spine.current) {
      spine.current.rotation.x = 0.08 + trouble * 0.18;
      spine.current.position.z = trouble * 0.06;
    }
    if (head.current) {
      head.current.rotation.x = -0.12 + reach * 0.06 - trouble * 0.08;
      head.current.rotation.y = Math.sin(t * 0.7) * 0.04;
    }
    if (lArm.current) lArm.current.rotation.x = 0.85 + tapL + trouble * -0.35;
    if (lFore.current) lFore.current.rotation.x = 0.55 + tapL * 0.6;
    if (lHand.current) lHand.current.rotation.x = tapL * 0.4;
    if (rArm.current)
      rArm.current.rotation.x = 0.85 + tap * (1 - reach) + reach * 0.35;
    if (rFore.current)
      rFore.current.rotation.x = 0.5 + tap * 0.5 - reach * 0.25;
    if (rHand.current) {
      rHand.current.rotation.x = tap * 0.5;
      rHand.current.position.x = 0.02 + reach * 0.22;
      rHand.current.position.z = reach * 0.12;
    }
    if (glow.current) {
      glow.current.emissiveIntensity =
        0.4 + Math.sin(t * 2.2) * 0.1 + trouble * 0.2;
    }

    readScenePointer(track.current, sp);
    const activeRow = Math.floor(
      (c * 5 + (sp.inside ? (sp.y + 1) * 1.5 : 0)) % ROWS,
    );
    for (let i = 0; i < ROWS; i++) {
      const target = i === activeRow ? 1 : animate && sp.inside ? 0.25 : 0.12;
      heat.current[i] = MathUtils.lerp(heat.current[i], target, damp(6, delta));
      const lamp = lamps.current[i];
      if (lamp) {
        lamp.emissiveIntensity = 0.15 + heat.current[i] * 1.2;
        lamp.color.lerpColors(
          DIM,
          i === 0 && trouble > 0.4 ? OK : LIT,
          heat.current[i],
        );
      }
    }
    pips.current.forEach((mat, i) => {
      if (!mat) return;
      mat.emissiveIntensity =
        0.25 + (Math.sin(t * 2.6 + i * 1.8) * 0.5 + 0.5) * 0.85;
    });
  });

  const cloth = palette.ink700;
  const skin = "#3a3a3a";

  return (
    <>
      <PerspectiveCamera makeDefault position={[0.35, 0.55, 5.0]} fov={32} />
      <StudioLights />
      <pointLight
        position={[0.2, 0.9, 0.5]}
        intensity={2.6}
        color={palette.ember}
        distance={5.5}
        decay={2}
      />
      <group ref={root}>
        {/* Desk */}
        <mesh position={[0.1, -0.62, 0.1]} receiveShadow castShadow>
          <boxGeometry args={[2.9, 0.07, 1.45]} />
          <meshStandardMaterial
            color={palette.ink800}
            roughness={0.62}
            metalness={0.06}
          />
        </mesh>
        {[-1.15, 1.25].map((x) => (
          <mesh key={x} position={[x, -1.08, 0.45]} castShadow>
            <boxGeometry args={[0.08, 0.86, 0.08]} />
            <meshStandardMaterial color={palette.ink700} roughness={0.6} />
          </mesh>
        ))}

        {/* Monitor */}
        <mesh position={[0.22, -0.5, -0.38]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        <mesh position={[0.22, -0.22, -0.38]} castShadow>
          <boxGeometry args={[0.1, 0.36, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
        </mesh>
        <mesh position={[0.22, 0.48, -0.28]} castShadow>
          <boxGeometry args={[1.62, 1.08, 0.08]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} />
        </mesh>
        <mesh position={[0.22, 0.48, -0.23]}>
          <boxGeometry args={[1.48, 0.94, 0.012]} />
          <meshStandardMaterial
            ref={glow}
            color="#14110e"
            emissive={palette.ember}
            emissiveIntensity={0.45}
            roughness={0.22}
          />
        </mesh>
        {Array.from({ length: ROWS }, (_, i) => (
          <mesh key={i} position={[0.22, 0.8 - i * 0.16, -0.22]}>
            <boxGeometry args={[1.16, 0.1, 0.01]} />
            <meshStandardMaterial
              ref={(mat) => {
                lamps.current[i] = mat;
              }}
              color={palette.paperDim}
              emissive={palette.ember}
              emissiveIntensity={0.2}
              roughness={0.4}
            />
          </mesh>
        ))}

        {/* Keyboard + mouse */}
        <mesh position={[0.05, -0.57, 0.38]} castShadow>
          <boxGeometry args={[0.98, 0.04, 0.34]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.45} />
        </mesh>
        <mesh position={[0.72, -0.56, 0.42]} castShadow>
          <boxGeometry args={[0.14, 0.03, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
        </mesh>

        {[-0.7, -0.5, -0.3].map((x, i) => (
          <mesh key={x} position={[x, -0.56, 0.72]}>
            <sphereGeometry args={[0.032, 16, 16]} />
            <meshStandardMaterial
              ref={(mat) => {
                pips.current[i] = mat;
              }}
              color={palette.ink700}
              emissive={i === 1 ? palette.ember : "#5a9a62"}
              emissiveIntensity={0.4}
              roughness={0.32}
            />
          </mesh>
        ))}

        {/* Chair */}
        <mesh position={[-0.12, -0.78, 0.95]} castShadow>
          <boxGeometry args={[0.62, 0.08, 0.56]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.12, -0.28, 1.18]} castShadow>
          <boxGeometry args={[0.62, 0.85, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
        <mesh position={[-0.12, -1.15, 0.95]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.36, 10]} />
          <meshStandardMaterial color="#161616" roughness={0.55} />
        </mesh>

        {/* Technician — seated, over the shoulder, proportioned joints */}
        <group position={[-0.08, -0.42, 0.92]}>
          {/* Pelvis / thighs (seated) */}
          <mesh
            position={[0, -0.22, 0.02]}
            rotation={[Math.PI / 2.2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.38, 0.16, 0.42]} />
            <meshStandardMaterial color={cloth} roughness={0.65} />
          </mesh>
          <mesh
            position={[-0.12, -0.42, 0.18]}
            rotation={[0.15, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.14, 0.36, 0.14]} />
            <meshStandardMaterial color={cloth} roughness={0.65} />
          </mesh>
          <mesh
            position={[0.12, -0.42, 0.18]}
            rotation={[0.15, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.14, 0.36, 0.14]} />
            <meshStandardMaterial color={cloth} roughness={0.65} />
          </mesh>

          <group ref={spine} position={[0, -0.02, 0]}>
            {/* Torso */}
            <mesh position={[0, 0.28, 0.02]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[0.42, 0.58, 0.26]} />
              <meshStandardMaterial color={cloth} roughness={0.62} />
            </mesh>
            {/* Neck + head */}
            <group ref={head} position={[0, 0.62, 0.04]}>
              <mesh position={[0, 0.06, 0]} castShadow>
                <boxGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color={skin} roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.24, 0.02]} castShadow>
                <sphereGeometry args={[0.155, 20, 20]} />
                <meshStandardMaterial color={skin} roughness={0.68} />
              </mesh>
            </group>

            {/* Left arm */}
            <group
              ref={lArm}
              position={[-0.26, 0.42, 0.04]}
              rotation={[0.9, 0, 0.35]}
            >
              <mesh position={[0, -0.16, 0]} castShadow>
                <boxGeometry args={[0.1, 0.32, 0.1]} />
                <meshStandardMaterial color={cloth} roughness={0.62} />
              </mesh>
              <group
                ref={lFore}
                position={[0, -0.34, 0]}
                rotation={[0.55, 0, 0]}
              >
                <mesh position={[0, -0.14, 0]} castShadow>
                  <boxGeometry args={[0.09, 0.28, 0.09]} />
                  <meshStandardMaterial color={cloth} roughness={0.62} />
                </mesh>
                <group ref={lHand} position={[0, -0.3, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.09, 0.1, 0.08]} />
                    <meshStandardMaterial color={skin} roughness={0.7} />
                  </mesh>
                </group>
              </group>
            </group>

            {/* Right arm */}
            <group
              ref={rArm}
              position={[0.26, 0.42, 0.04]}
              rotation={[0.9, 0, -0.35]}
            >
              <mesh position={[0, -0.16, 0]} castShadow>
                <boxGeometry args={[0.1, 0.32, 0.1]} />
                <meshStandardMaterial color={cloth} roughness={0.62} />
              </mesh>
              <group
                ref={rFore}
                position={[0, -0.34, 0]}
                rotation={[0.5, 0, 0]}
              >
                <mesh position={[0, -0.14, 0]} castShadow>
                  <boxGeometry args={[0.09, 0.28, 0.09]} />
                  <meshStandardMaterial color={cloth} roughness={0.62} />
                </mesh>
                <group ref={rHand} position={[0, -0.3, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.09, 0.1, 0.08]} />
                    <meshStandardMaterial color={skin} roughness={0.7} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
