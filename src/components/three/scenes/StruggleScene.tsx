"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  CatmullRomCurve3,
  Group,
  MathUtils,
  Mesh,
  TubeGeometry,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { pointer } from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const THREADS = 7;
const POINTS = 14;
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** A tangled thread and its untangled twin share topology, so one morph target resolves it. */
function buildThread(i: number, segments: number): TubeGeometry {
  const tangled: Vector3[] = [];
  const calm: Vector3[] = [];
  for (let j = 0; j < POINTS; j++) {
    const u = j / (POINTS - 1);
    const r = 0.6 + rand(i * 50 + j) * 0.9;
    const a = rand(i * 70 + j) * Math.PI * 2;
    tangled.push(
      new Vector3(
        Math.cos(a) * r,
        (rand(i * 90 + j) - 0.5) * 2.2,
        Math.sin(a) * r,
      ),
    );
    calm.push(
      new Vector3(
        (u - 0.5) * 4.4,
        (i - (THREADS - 1) / 2) * 0.22 + Math.sin(u * 6 + i) * 0.05,
        0,
      ),
    );
  }
  const radius = i === 3 ? 0.035 : 0.022;
  const geo = new TubeGeometry(
    new CatmullRomCurve3(tangled),
    segments,
    radius,
    8,
    false,
  );
  const target = new TubeGeometry(
    new CatmullRomCurve3(calm),
    segments,
    radius,
    8,
    false,
  );
  geo.morphAttributes.position = [target.getAttribute("position")];
  geo.morphAttributes.normal = [target.getAttribute("normal")];
  target.dispose();
  return geo;
}

/** The struggle: a knot of threads that slowly works itself straight as you scroll. */
export default function StruggleScene({
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const meshes = useRef<(Mesh | null)[]>([]);
  const segments = tier === "low" ? 80 : 160;
  const geometries = useDisposable(
    () => Array.from({ length: THREADS }, (_, i) => buildThread(i, segments)),
    segments,
  );
  const [ink, ember] = useDisposable(
    () => [materials.ink(tier), materials.ember(1.4)],
    tier,
  );
  const smooth = useRef(-1);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || !active.current) return;
    const target = animate ? progress.current : 0.35;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const resolve = MathUtils.smoothstep(smooth.current, 0.3, 0.78);
    meshes.current.forEach((mesh, i) => {
      if (!mesh?.morphTargetInfluences) return;
      const stagger = MathUtils.clamp(resolve * 1.4 - i * 0.06, 0, 1);
      mesh.morphTargetInfluences[0] = stagger;
    });
    const t = animate ? state.clock.elapsedTime : 0;
    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      (1 - resolve) * (t * 0.15 + 0.6) + pointer.x * 0.2,
      k,
    );
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      (1 - resolve) * 0.4 - pointer.y * 0.1,
      k,
    );
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={38} />
      <StudioLights rim={1.4} />
      <group ref={groupRef}>
        {geometries.map((geo, i) => (
          <mesh
            key={i}
            ref={(m) => {
              meshes.current[i] = m;
            }}
            geometry={geo}
            material={i === 3 ? ember : ink}
            morphTargetInfluences={[0]}
          />
        ))}
      </group>
    </>
  );
}
