"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Group, MathUtils, MeshStandardMaterial } from "three";
import { createScenePointer, readScenePointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const DIM = new Color("#6a6560");
const LIT = new Color(palette.ember);
const OK = new Color("#5a9a62");
const ROWS = 5;

const SKIN = "#8a7c70";
const SHIRT = "#4a4540";
const PANTS = "#35322e";
const HAIR = "#2a2623";
const CHAIR = "#2c2926";
const DESK = "#1c1b19";

type Joint = Group;

function CameraAim({ at }: { at: [number, number, number] }) {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.lookAt(at[0], at[1], at[2]);
  }, [camera, at]);
  useFrame(() => {
    camera.lookAt(at[0], at[1], at[2]);
  });
  return null;
}

/**
 * ICICI Prudential IT support: a 3/4 side view of a proportioned stylised
 * technician at a workstation. Joints animate through typing, mouse use,
 * looking at the monitor, and a troubleshooting lean; the support console
 * changes with the cycle and the pointer.
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
  const bar = useRef<Group>(null);
  const heat = useRef(Array.from({ length: ROWS }, () => 0));
  const fill = useRef(0);
  const sp = useMemo(() => createScenePointer(), []);
  const cycle = useRef(0);
  const aim = useMemo(() => [0.08, 0.02, 0.18] as [number, number, number], []);

  useFrame((state, delta) => {
    if (!root.current) return;
    // The View only mounts when the slot is near the viewport, so keep the
    // idle cycle running even if the visibility observer is late.
    const p = animate ? progress.current : 0.65;
    const open = MathUtils.smoothstep(p, 0.04, 0.48);
    const t = state.clock.elapsedTime;
    const rate = animate ? 1 : 0.45;
    cycle.current = ((t * rate) % 6) / 6;

    root.current.position.y = MathUtils.lerp(-0.16, 0.02, open);
    root.current.rotation.y = 0.18 + Math.sin(t * 0.08) * 0.02;
    root.current.scale.setScalar(MathUtils.lerp(0.95, 1, open));

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
    const tap = type > 0.4 ? (Math.sin(t * 16) * 0.5 + 0.5) * 0.42 : 0;
    const tapL = type > 0.4 ? (Math.sin(t * 16 + 1.3) * 0.5 + 0.5) * 0.38 : 0;

    if (spine.current) {
      spine.current.rotation.z = -0.04 - trouble * 0.28;
      spine.current.rotation.x = 0.04 + trouble * 0.1;
      spine.current.position.x = trouble * 0.12;
    }
    if (head.current) {
      head.current.rotation.y = 0.35 + reach * 0.22 + Math.sin(t * 0.7) * 0.08;
      head.current.rotation.x = -0.08 + trouble * -0.18 + reach * 0.08;
      head.current.rotation.z = -0.04 - trouble * 0.1;
    }
    if (lArm.current)
      lArm.current.rotation.x = 1.05 + tapL * 0.45 - trouble * 0.55;
    if (lFore.current) lFore.current.rotation.x = 0.35 + tapL * 0.7;
    if (lHand.current) {
      lHand.current.rotation.x = tapL * 0.7;
      lHand.current.position.y = -0.28 - tapL * 0.06;
    }
    if (rArm.current)
      rArm.current.rotation.x = 1.05 + tap * (1 - reach) * 0.45 + reach * 0.35;
    if (rFore.current)
      rFore.current.rotation.x = 0.32 + tap * 0.7 - reach * 0.55;
    if (rHand.current) {
      rHand.current.rotation.x = tap * 0.65;
      rHand.current.position.x = reach * 0.48;
      rHand.current.position.z = 0.02 + reach * 0.18;
      rHand.current.position.y =
        -0.28 - (reach > 0.55 ? Math.sin(t * 10) * 0.045 : tap * 0.04);
    }
    if (glow.current) {
      glow.current.emissiveIntensity =
        0.55 + Math.sin(t * 2.2) * 0.12 + trouble * 0.25;
    }
    fill.current = MathUtils.lerp(
      fill.current,
      trouble > 0.2
        ? 0.25 + trouble * 0.75
        : 0.18 + (c < 0.28 ? c * 0.4 : 0.12),
      damp(5, delta),
    );
    if (bar.current) bar.current.scale.x = Math.max(0.08, fill.current);

    if (active.current) readScenePointer(track.current, sp);
    const activeRow = Math.floor(
      (c * 5 + (sp.inside ? (sp.y + 1) * 1.5 : 0)) % ROWS,
    );
    for (let i = 0; i < ROWS; i++) {
      const target = i === activeRow ? 1 : animate && sp.inside ? 0.28 : 0.14;
      heat.current[i] = MathUtils.lerp(heat.current[i], target, damp(6, delta));
      const lamp = lamps.current[i];
      if (lamp) {
        lamp.emissiveIntensity = 0.2 + heat.current[i] * 1.35;
        lamp.color.lerpColors(
          DIM,
          i === 0 && trouble > 0.4 ? OK : LIT,
          heat.current[i],
        );
      }
    }
    pips.current.forEach((mat, i) => {
      if (!mat) return;
      const pulse = Math.sin(t * 2.6 + i * 1.8) * 0.5 + 0.5;
      mat.emissiveIntensity =
        0.35 + pulse * (i === 0 && trouble > 0.4 ? 1.1 : 0.8);
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[-0.45, 0.7, 6.15]} fov={30} />
      <CameraAim at={aim} />

      <ambientLight intensity={0.28} />
      <directionalLight
        position={[-3.4, 4.2, 3.6]}
        intensity={1.7}
        color="#e9e7e2"
      />
      <pointLight
        position={[2.6, 1.9, -1.6]}
        intensity={3.2}
        color={palette.ember}
        distance={9}
        decay={2}
      />
      <pointLight
        position={[-2.8, 1.3, 3.4]}
        intensity={1.25}
        color="#9aa8b8"
        distance={11}
        decay={2}
      />
      <pointLight
        position={[0.7, 0.7, 0.2]}
        intensity={2.1}
        color={palette.ember}
        distance={3.4}
        decay={2}
      />
      <pointLight
        position={[-0.5, 0.35, 2.0]}
        intensity={1.7}
        color="#d7d2c8"
        distance={5.5}
        decay={2}
      />

      <group ref={root}>
        {/* Desk */}
        <mesh position={[0.15, -0.62, 0.05]} receiveShadow castShadow>
          <boxGeometry args={[3.2, 0.08, 1.5]} />
          <meshStandardMaterial
            color={DESK}
            roughness={0.58}
            metalness={0.08}
          />
        </mesh>
        {[-1.3, 1.4].map((x) => (
          <mesh key={x} position={[x, -1.12, 0.45]} castShadow>
            <boxGeometry args={[0.09, 0.92, 0.09]} />
            <meshStandardMaterial color="#1a1918" roughness={0.6} />
          </mesh>
        ))}

        {/* Monitor — yawed toward the camera so the UI is readable */}
        <group position={[0.95, -0.18, -0.18]} rotation={[0, -0.55, 0]}>
          <mesh position={[0, -0.28, 0]} castShadow>
            <boxGeometry args={[0.38, 0.14, 0.22]} />
            <meshStandardMaterial color="#161616" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.1, 0.42, 0.1]} />
            <meshStandardMaterial color="#161616" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[1.55, 1.12, 0.08]} />
            <meshStandardMaterial color="#0c0c0c" roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.72, 0.05]}>
            <boxGeometry args={[1.4, 0.98, 0.012]} />
            <meshStandardMaterial
              ref={glow}
              color="#16130f"
              emissive={palette.ember}
              emissiveIntensity={0.55}
              roughness={0.22}
            />
          </mesh>
          {/* Header strip */}
          <mesh position={[0, 1.1, 0.06]}>
            <boxGeometry args={[1.22, 0.08, 0.01]} />
            <meshStandardMaterial
              color="#2a211c"
              emissive={palette.ember}
              emissiveIntensity={0.35}
              roughness={0.4}
            />
          </mesh>
          {Array.from({ length: ROWS }, (_, i) => (
            <mesh key={i} position={[0, 0.92 - i * 0.15, 0.06]}>
              <boxGeometry args={[1.18, 0.1, 0.01]} />
              <meshStandardMaterial
                ref={(mat) => {
                  lamps.current[i] = mat;
                }}
                color={palette.paperDim}
                emissive={palette.ember}
                emissiveIntensity={0.22}
                roughness={0.4}
              />
            </mesh>
          ))}
          {/* Progress bar track + fill */}
          <mesh position={[0, 0.22, 0.06]}>
            <boxGeometry args={[1.18, 0.05, 0.008]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
          </mesh>
          <group ref={bar} position={[-0.59, 0.22, 0.07]} scale={[0.2, 1, 1]}>
            <mesh position={[0.59, 0, 0]}>
              <boxGeometry args={[1.18, 0.04, 0.01]} />
              <meshStandardMaterial
                color={palette.ember}
                emissive={palette.ember}
                emissiveIntensity={0.7}
                roughness={0.35}
              />
            </mesh>
          </group>
          {[-0.5, 0, 0.5].map((x, i) => (
            <mesh key={x} position={[x, 1.22, 0.06]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial
                ref={(mat) => {
                  pips.current[i] = mat;
                }}
                color="#222"
                emissive={i === 1 ? palette.ember : "#5a9a62"}
                emissiveIntensity={0.5}
                roughness={0.32}
              />
            </mesh>
          ))}
        </group>

        {/* Keyboard + mouse */}
        <mesh
          position={[-0.55, -0.56, 0.38]}
          rotation={[0.02, 0.15, 0]}
          castShadow
        >
          <boxGeometry args={[0.95, 0.045, 0.34]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.42} />
        </mesh>
        <mesh position={[0.22, -0.555, 0.42]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.15, 0.035, 0.22]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.38} />
        </mesh>

        {/* Chair */}
        <group position={[-1.05, -0.55, 0.55]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <boxGeometry args={[0.62, 0.08, 0.56]} />
            <meshStandardMaterial color={CHAIR} roughness={0.68} />
          </mesh>
          <mesh position={[0, 0.32, -0.26]} rotation={[0.08, 0, 0]} castShadow>
            <boxGeometry args={[0.62, 0.9, 0.08]} />
            <meshStandardMaterial color={CHAIR} roughness={0.68} />
          </mesh>
          <mesh position={[0, -0.52, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.42, 10]} />
            <meshStandardMaterial
              color="#3a3a3a"
              roughness={0.45}
              metalness={0.25}
            />
          </mesh>
          <mesh position={[0, -0.74, 0]} rotation={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.05, 5]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>
        </group>

        {/* Technician — seated, 3/4, facing the monitor */}
        <group
          position={[-0.95, -0.28, 0.42]}
          rotation={[0, Math.PI / 2 - 0.32, 0]}
        >
          {/* Pelvis / thighs */}
          <mesh
            position={[0, -0.22, 0.18]}
            rotation={[Math.PI / 2.15, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.4, 0.18, 0.36]} />
            <meshStandardMaterial
              color={PANTS}
              roughness={0.62}
              metalness={0.04}
            />
          </mesh>
          <mesh
            position={[-0.11, -0.46, 0.38]}
            rotation={[0.2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.42, 0.16]} />
            <meshStandardMaterial color={PANTS} roughness={0.62} />
          </mesh>
          <mesh
            position={[0.11, -0.46, 0.38]}
            rotation={[0.2, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, 0.42, 0.16]} />
            <meshStandardMaterial color={PANTS} roughness={0.62} />
          </mesh>

          <group ref={spine} position={[0, -0.02, 0]}>
            {/* Torso + shoulders */}
            <mesh position={[0, 0.3, 0.02]} rotation={[0.08, 0, 0]} castShadow>
              <boxGeometry args={[0.44, 0.58, 0.26]} />
              <meshStandardMaterial
                color={SHIRT}
                roughness={0.55}
                metalness={0.05}
              />
            </mesh>
            <mesh
              position={[-0.28, 0.5, 0.02]}
              rotation={[0, 0, 0.18]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.14, 0.2]} />
              <meshStandardMaterial color={SHIRT} roughness={0.55} />
            </mesh>
            <mesh
              position={[0.28, 0.5, 0.02]}
              rotation={[0, 0, -0.18]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.14, 0.2]} />
              <meshStandardMaterial color={SHIRT} roughness={0.55} />
            </mesh>

            {/* Neck + head + hair */}
            <group ref={head} position={[0, 0.64, 0.04]}>
              <mesh position={[0, 0.07, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.065, 0.12, 10]} />
                <meshStandardMaterial
                  color={SKIN}
                  roughness={0.55}
                  metalness={0.04}
                />
              </mesh>
              <mesh position={[0, 0.26, 0.02]} castShadow>
                <sphereGeometry args={[0.16, 20, 20]} />
                <meshStandardMaterial
                  color={SKIN}
                  roughness={0.52}
                  metalness={0.04}
                />
              </mesh>
              <mesh
                position={[0, 0.34, -0.02]}
                scale={[1, 0.55, 1.05]}
                castShadow
              >
                <sphereGeometry args={[0.155, 18, 18]} />
                <meshStandardMaterial color={HAIR} roughness={0.72} />
              </mesh>
            </group>

            {/* Left arm (far, on the keyboard) */}
            <group
              ref={lArm}
              position={[-0.32, 0.46, 0.04]}
              rotation={[1.05, 0, 0.28]}
            >
              <mesh position={[0, -0.17, 0]} castShadow>
                <boxGeometry args={[0.11, 0.34, 0.11]} />
                <meshStandardMaterial color={SHIRT} roughness={0.55} />
              </mesh>
              <group
                ref={lFore}
                position={[0, -0.36, 0]}
                rotation={[0.35, 0, 0]}
              >
                <mesh position={[0, -0.15, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.3, 0.1]} />
                  <meshStandardMaterial color={SHIRT} roughness={0.55} />
                </mesh>
                <group ref={lHand} position={[0, -0.28, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.11, 0.08, 0.09]} />
                    <meshStandardMaterial color={SKIN} roughness={0.55} />
                  </mesh>
                  {[-0.03, 0, 0.03].map((x) => (
                    <mesh key={x} position={[x, -0.07, 0.01]} castShadow>
                      <boxGeometry args={[0.025, 0.08, 0.03]} />
                      <meshStandardMaterial color={SKIN} roughness={0.55} />
                    </mesh>
                  ))}
                </group>
              </group>
            </group>

            {/* Right arm (near, types then reaches for the mouse) */}
            <group
              ref={rArm}
              position={[0.32, 0.46, 0.04]}
              rotation={[1.05, 0, -0.22]}
            >
              <mesh position={[0, -0.17, 0]} castShadow>
                <boxGeometry args={[0.11, 0.34, 0.11]} />
                <meshStandardMaterial color={SHIRT} roughness={0.55} />
              </mesh>
              <group
                ref={rFore}
                position={[0, -0.36, 0]}
                rotation={[0.32, 0, 0]}
              >
                <mesh position={[0, -0.15, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.3, 0.1]} />
                  <meshStandardMaterial color={SHIRT} roughness={0.55} />
                </mesh>
                <group ref={rHand} position={[0, -0.28, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[0.11, 0.08, 0.09]} />
                    <meshStandardMaterial color={SKIN} roughness={0.55} />
                  </mesh>
                  {[-0.03, 0, 0.03].map((x) => (
                    <mesh key={x} position={[x, -0.07, 0.01]} castShadow>
                      <boxGeometry args={[0.025, 0.08, 0.03]} />
                      <meshStandardMaterial color={SKIN} roughness={0.55} />
                    </mesh>
                  ))}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
