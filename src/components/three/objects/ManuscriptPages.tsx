"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Object3D,
  ShaderMaterial,
} from "three";
import {
  createManuscriptMaterial,
  PAGE_WIDTH,
} from "@/components/three/materials/manuscriptMaterial";
import { createPageGeometry } from "@/components/three/objects/pageGeometry";

interface ManuscriptPagesProps {
  count: number;
  animate: boolean;
}

interface PageSeed {
  angle: number;
  height: number;
  radius: number;
  tilt: number;
  phase: number;
}

const TAU = Math.PI * 2;

function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The "unwritten manuscript": loose pages in a slow spiral, each curling from its spine
 * while lines of handwriting are drawn across it. One instanced draw call.
 */
export function ManuscriptPages({ count, animate }: ManuscriptPagesProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  const geometry = useMemo(() => {
    const g = createPageGeometry(PAGE_WIDTH, 1.9);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = seeded(i + 1);
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
    return g;
  }, [count]);

  const material = useMemo(() => createManuscriptMaterial(), []);

  const pages = useMemo<PageSeed[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * TAU * 0.85 + seeded(i + 7) * 0.4,
        height: (i / Math.max(count - 1, 1) - 0.5) * 2.6,
        radius: 1.35 + seeded(i + 13) * 0.9,
        tilt: (seeded(i + 21) - 0.5) * 0.5,
        phase: seeded(i + 29) * TAU,
      })),
    [count],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;
    const mat = mesh.material as ShaderMaterial;

    const t = animate ? state.clock.elapsedTime : 4;
    mat.uniforms.uTime.value = t;

    // Scroll through the first viewport parts the pages and lifts the camera away.
    const scroll =
      typeof window === "undefined"
        ? 0
        : MathUtils.clamp(window.scrollY / window.innerHeight, 0, 1);
    const spread = 1 + scroll * 0.9;
    mat.uniforms.uCurl.value = 0.35 + scroll * 0.45;

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const a = p.angle + t * 0.04;
      const r = p.radius * spread;
      dummy.position.set(
        Math.cos(a) * r,
        p.height + Math.sin(t * 0.35 + p.phase) * 0.08,
        Math.sin(a) * r - 1.2,
      );
      dummy.rotation.set(
        p.tilt + Math.sin(t * 0.2 + p.phase) * 0.05,
        -a + Math.PI * 0.5,
        p.tilt * 0.4,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Pages sit right of the headline on wide screens and behind it on narrow ones.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const wide = aspect > 1.1;
    group.position.x = wide ? 2.1 : 0.3;
    group.position.y = wide ? 0.1 : 1.1;
    group.scale.setScalar(wide ? 0.85 : 0.62);

    const damp = animate ? 1 - Math.exp(-delta * 3) : 1;
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -state.pointer.y * 0.12,
      damp,
    );
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      state.pointer.x * 0.22 + scroll * 0.5,
      damp,
    );
    state.camera.position.z = MathUtils.lerp(
      state.camera.position.z,
      6.2 + scroll * 1.6,
      damp,
    );
    state.camera.position.y = MathUtils.lerp(
      state.camera.position.y,
      0.15 - scroll * 0.4,
      damp,
    );
    state.camera.lookAt(0, 0, -1.2);
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        frustumCulled={false}
      />
    </group>
  );
}
