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
  type LineBasicMaterial,
  LineSegments,
  MathUtils,
  Object3D,
  OctahedronGeometry,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { skillGroups } from "@/data/skills";
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
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

const LINKS = 4;

/** Skills: a constellation of technology nodes, one cluster per skill group. */
export default function SkillsScene({
  track,
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
  const [geo, mat, lineMat, lineGeo, linkGeo, linkMat] = useDisposable(() => {
    const links = new BufferGeometry();
    links.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(LINKS * 6), 3),
    );
    return [
      new OctahedronGeometry(0.075, 0),
      materials.ember(1),
      materials.line(palette.paperDim, 0.3),
      lines,
      links,
      materials.line(palette.ember, 0),
    ];
  }, tier);
  const linksRef = useRef<LineSegments>(null);
  const sp = useMemo(() => createScenePointer(), []);
  const hit = useMemo(() => new Vector3(), []);
  const world = useMemo(() => new Vector3(), []);
  const hover = useRef(0);
  const nearestRef = useRef<number[]>(new Array<number>(LINKS).fill(-1));
  const nearestDRef = useRef<number[]>(new Array<number>(LINKS).fill(Infinity));
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

    // Mouse: the cursor becomes a temporary star, linking itself to the nearest nodes.
    readScenePointer(track.current, sp);
    let near = false;
    if (sp.inside && animate && appear > 0.5) {
      group.updateMatrixWorld();
      near =
        pointerOnPlane(sp, state.camera, group.getWorldPosition(world), hit) !==
        null;
    }
    hover.current = MathUtils.lerp(hover.current, near ? 1 : 0, damp(6, delta));
    const nearest = nearestRef.current;
    const nearestD = nearestDRef.current;
    nearest.fill(-1);
    nearestD.fill(Infinity);
    if (near) {
      group.worldToLocal(hit);
      for (let i = 0; i < stars.length; i++) {
        const d = world
          .copy(stars[i].pos)
          .multiplyScalar(0.6 + appear * 0.4)
          .distanceTo(hit);
        if (d > 1.4) continue;
        for (let j = 0; j < LINKS; j++) {
          if (d < nearestD[j]) {
            nearest.splice(j, 0, i);
            nearestD.splice(j, 0, d);
            nearest.length = LINKS;
            nearestD.length = LINKS;
            break;
          }
        }
      }
    }
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const on = focus === s.group ? 1 : 0;
      const twinkle = 0.85 + Math.sin(t * 2 + i * 1.7) * 0.15;
      dummy.position.copy(s.pos).multiplyScalar(0.6 + appear * 0.4);
      dummy.rotation.set(t * 0.4 + i, t * 0.3, 0);
      const linked = nearest.includes(i) ? hover.current : 0;
      dummy.scale.setScalar(
        appear *
          twinkle *
          (s.confirmed ? 1 : 0.6) *
          (1 + on * 0.6 + linked * 0.5),
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.copy(base).lerp(hot, focus < 0 ? 0.35 : on));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    lineMat.setValues({ opacity: appear * 0.3 });
    const links = linksRef.current;
    if (links) {
      const attr = links.geometry.getAttribute(
        "position",
      ) as Float32BufferAttribute;
      for (let j = 0; j < LINKS; j++) {
        const i = nearest[j];
        if (i < 0) {
          attr.setXYZ(j * 2, 0, 0, 0);
          attr.setXYZ(j * 2 + 1, 0, 0, 0);
          continue;
        }
        world.copy(stars[i].pos).multiplyScalar(0.6 + appear * 0.4);
        attr.setXYZ(j * 2, hit.x, hit.y, hit.z);
        attr.setXYZ(j * 2 + 1, world.x, world.y, world.z);
      }
      attr.needsUpdate = true;
      (links.material as LineBasicMaterial).setValues({
        opacity: hover.current * 0.75,
      });
    }
    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      smooth.current * 1.2 + t * 0.03,
      k,
    );
    group.rotation.x = MathUtils.lerp(group.rotation.x, 0.28, k);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 6.6]} fov={38} />
      <StudioLights />
      <group ref={groupRef}>
        <lineSegments geometry={lineGeo} material={lineMat} />
        <lineSegments
          ref={linksRef}
          geometry={linkGeo}
          material={linkMat}
          frustumCulled={false}
        />
        <instancedMesh
          ref={meshRef}
          args={[geo, mat, stars.length]}
          frustumCulled={false}
        />
      </group>
    </>
  );
}
