"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MathUtils,
  Object3D,
  OctahedronGeometry,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { skillGroups } from "@/data/skills";
import { pointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import { useFocusStore } from "@/stores/focusStore";
import type { SceneProps } from "@/types/three";

interface Star {
  pos: Vector3;
  group: number;
  confirmed: boolean;
}

/** One cluster per skill group, laid out on a tilted ellipse; stars inside a cluster are linked. */
function buildConstellation() {
  const stars: Star[] = [];
  const pos: number[] = [];
  skillGroups.forEach((g, gi) => {
    const a = (gi / skillGroups.length) * Math.PI * 2;
    const centre = new Vector3(
      Math.cos(a) * 2.3,
      Math.sin(a * 2) * 0.35,
      Math.sin(a) * 1.3,
    );
    const start = stars.length;
    g.items.forEach((item, ii) => {
      const b = ii * 2.39996 + gi;
      const r = 0.25 + 0.17 * Math.sqrt(ii + 1);
      stars.push({
        pos: centre
          .clone()
          .add(
            new Vector3(
              Math.cos(b) * r,
              Math.sin(b) * r,
              Math.sin(b * 1.7) * 0.2,
            ),
          ),
        group: gi,
        confirmed: item.confirmed,
      });
    });
    for (let i = start + 1; i < stars.length; i++)
      pos.push(...stars[i - 1].pos.toArray(), ...stars[i].pos.toArray());
    if (gi > 0)
      pos.push(
        ...stars[start - 1].pos.toArray(),
        ...stars[start].pos.toArray(),
      );
  });
  const lines = new BufferGeometry();
  lines.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return { stars, lines };
}

/** Skills: a constellation of technology nodes, one cluster per skill group. */
export default function SkillsScene({
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const { stars, lines } = useMemo(() => buildConstellation(), []);
  const [geo, mat, lineMat, lineGeo] = useDisposable(
    () => [
      new OctahedronGeometry(0.075, 0),
      materials.ember(1),
      materials.line(palette.paperDim, 0.3),
      lines,
    ],
    tier,
  );
  const base = useMemo(() => new Color(palette.paperDim), []);
  const hot = useMemo(() => new Color(palette.ember), []);
  const smooth = useRef(-1);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh || !active.current) return;
    const target = animate ? progress.current : 0.5;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const appear = MathUtils.smoothstep(smooth.current, 0.1, 0.45);
    const t = animate ? state.clock.elapsedTime : 0;
    const focusId = useFocusStore.getState().skillGroup;
    const focus = skillGroups.findIndex((g) => g.id === focusId);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const on = focus === s.group ? 1 : 0;
      const twinkle = 0.85 + Math.sin(t * 2 + i * 1.7) * 0.15;
      dummy.position.copy(s.pos).multiplyScalar(0.6 + appear * 0.4);
      dummy.rotation.set(t * 0.4 + i, t * 0.3, 0);
      dummy.scale.setScalar(
        appear * twinkle * (s.confirmed ? 1 : 0.6) * (1 + on * 0.6),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.copy(base).lerp(hot, focus < 0 ? 0.35 : on));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    lineMat.setValues({ opacity: appear * 0.3 });
    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      smooth.current * 1.2 + t * 0.03 + pointer.x * 0.25,
      k,
    );
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      0.28 - pointer.y * 0.12,
      k,
    );
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 6.6]} fov={38} />
      <StudioLights />
      <group ref={groupRef}>
        <lineSegments geometry={lineGeo} material={lineMat} />
        <instancedMesh
          ref={meshRef}
          args={[geo, mat, stars.length]}
          frustumCulled={false}
        />
      </group>
    </>
  );
}
