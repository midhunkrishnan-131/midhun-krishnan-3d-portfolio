"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { projectGlyphs } from "@/components/three/objects/projectGlyphs";
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const GREEN = "#5a9a62";
const NODE_COUNT = 10;
const PLANE = new Vector3(0, 0, 0);
const probe = new Vector3();

/**
 * MYX AI: a shield that defends against the cursor as a probe.
 * Nodes flare and a quiet line reaches the nearest threat; the shield leans to cover.
 */
export default function MyxScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const shield = useRef<Group>(null);
  const probeMesh = useRef<Mesh>(null);
  const nodes = useRef<(Mesh | null)[]>([]);
  const lines = useRef<(Mesh | null)[]>([]);
  const sp = useMemo(() => createScenePointer(), []);
  const aim = useRef({ x: 0, y: 0 });
  const resources = useDisposable(() => {
    const geo = new ExtrudeGeometry(projectGlyphs["myx-ai"](), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: tier === "low" ? 1 : 3,
      curveSegments: tier === "low" ? 8 : 18,
    });
    geo.center();
    const shieldMat = new MeshStandardMaterial({
      color: palette.paper,
      roughness: 0.45,
      metalness: 0.12,
      emissive: new Color(GREEN),
      emissiveIntensity: 0.08,
    });
    const nodeMats = Array.from(
      { length: NODE_COUNT },
      () =>
        new MeshStandardMaterial({
          color: palette.paperDim,
          roughness: 0.4,
          metalness: 0.2,
          emissive: new Color(palette.ember),
          emissiveIntensity: 0,
        }),
    );
    const probeMat = new MeshStandardMaterial({
      color: palette.ember,
      roughness: 0.3,
      metalness: 0.2,
      emissive: new Color(palette.ember),
      emissiveIntensity: 0.6,
    });
    return {
      geo,
      shieldMat,
      nodeMats,
      probeMat,
      dispose() {
        geo.dispose();
        shieldMat.dispose();
        nodeMats.forEach((m) => m.dispose());
        probeMat.dispose();
      },
    };
  }, tier);

  const layout = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const a = (i / NODE_COUNT) * Math.PI * 2;
      const r = 1.55 + (i % 3) * 0.18;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.72, z: -0.2 };
    });
  }, []);

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.55;
    const open = MathUtils.smoothstep(p, 0.05, 0.55);
    group.current.scale.setScalar(MathUtils.lerp(0.72, 1, open));
    group.current.rotation.z = MathUtils.lerp(0.12, 0, open);

    readScenePointer(track.current, sp);
    const hit =
      animate &&
      sp.inside &&
      pointerOnPlane(sp, state.camera, PLANE, probe) !== null;
    const tx = hit ? MathUtils.clamp(probe.x, -2.2, 2.2) : 0;
    const ty = hit ? MathUtils.clamp(probe.y, -1.6, 1.6) : 0;
    aim.current.x = MathUtils.lerp(aim.current.x, tx, damp(5, delta));
    aim.current.y = MathUtils.lerp(aim.current.y, ty, damp(5, delta));

    if (probeMesh.current) {
      probeMesh.current.visible =
        Boolean(hit) || probeMesh.current.scale.x > 0.05;
      const show = hit ? 1 : 0;
      const s = MathUtils.lerp(probeMesh.current.scale.x, show, damp(8, delta));
      probeMesh.current.scale.setScalar(s);
      probeMesh.current.position.set(aim.current.x, aim.current.y, 0.55);
    }

    if (shield.current) {
      // Lean toward the probe to cover it — a defence, not a chase.
      shield.current.rotation.y = MathUtils.lerp(
        shield.current.rotation.y,
        aim.current.x * 0.28,
        damp(4, delta),
      );
      shield.current.rotation.x = MathUtils.lerp(
        shield.current.rotation.x,
        -aim.current.y * 0.22,
        damp(4, delta),
      );
    }

    let nearest = 0;
    let nearestD = 99;
    for (let i = 0; i < layout.length; i++) {
      const n = nodes.current[i];
      if (!n) continue;
      const dx = layout[i].x - aim.current.x;
      const dy = layout[i].y - aim.current.y;
      const d = Math.hypot(dx, dy);
      if (d < nearestD) {
        nearestD = d;
        nearest = i;
      }
      const heat = hit ? MathUtils.smoothstep(1.4, 0.15, d) : 0;
      const mat = n.material as MeshStandardMaterial;
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        heat * 0.85,
        damp(7, delta),
      );
      n.scale.setScalar(
        MathUtils.lerp(n.scale.x, 1 + heat * 0.45, damp(7, delta)),
      );
    }

    // A single quiet connector from the nearest node to the probe.
    for (let i = 0; i < layout.length; i++) {
      const line = lines.current[i];
      if (!line) continue;
      const on = hit && i === nearest && nearestD < 1.6;
      const midX = (layout[i].x + aim.current.x) / 2;
      const midY = (layout[i].y + aim.current.y) / 2;
      const len = on ? Math.max(nearestD, 0.05) : 0;
      line.position.set(midX, midY, 0.2);
      line.rotation.z = Math.atan2(
        aim.current.y - layout[i].y,
        aim.current.x - layout[i].x,
      );
      const next = MathUtils.lerp(line.scale.x, len, damp(8, delta));
      line.scale.set(next, 0.012, 0.012);
    }

    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 6.2]} fov={32} />
      <StudioLights rim={1.15} />
      <pointLight
        position={[-2.2, 1.4, 2]}
        intensity={1.1}
        color={GREEN}
        distance={10}
      />
      <pointLight
        position={[2.4, -1.2, 1.6]}
        intensity={0.85}
        color={palette.ember}
        distance={10}
      />
      <group ref={group}>
        <group ref={shield}>
          <mesh
            geometry={resources.geo}
            material={resources.shieldMat}
            scale={1.55}
            rotation={[0, 0, 0]}
          />
        </group>
        {layout.map((n, i) => (
          <mesh
            key={i}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            position={[n.x, n.y, n.z]}
            material={resources.nodeMats[i]}
          >
            <sphereGeometry args={[0.07, 16, 16]} />
          </mesh>
        ))}
        {layout.map((_, i) => (
          <mesh
            key={`l-${i}`}
            ref={(el) => {
              lines.current[i] = el;
            }}
            scale={0}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={palette.ember}
              emissive={palette.ember}
              emissiveIntensity={0.7}
              roughness={0.4}
            />
          </mesh>
        ))}
        <mesh ref={probeMesh} material={resources.probeMat} scale={0}>
          <sphereGeometry args={[0.09, 20, 20]} />
        </mesh>
      </group>
    </>
  );
}
