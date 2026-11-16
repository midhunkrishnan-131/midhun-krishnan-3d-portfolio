"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  TorusGeometry,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { pointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp, passProgress } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

/** A small site graph: home → sections → pages, crawled in breadth-first order. */
function buildGraph() {
  const nodes: Vector3[] = [new Vector3(0, 1.3, 0)];
  const edges: [number, number][] = [];
  const level1 = 3;
  for (let i = 0; i < level1; i++) {
    const a = (i / level1) * Math.PI * 2;
    nodes.push(new Vector3(Math.cos(a) * 1.2, 0.2, Math.sin(a) * 1.2));
    edges.push([0, nodes.length - 1]);
  }
  for (let i = 0; i < level1; i++) {
    for (let j = 0; j < 3; j++) {
      const a = (i / level1) * Math.PI * 2 + (j - 1) * 0.45;
      nodes.push(
        new Vector3(Math.cos(a) * 2.2, -1 + (j % 2) * 0.2, Math.sin(a) * 2.2),
      );
      edges.push([1 + i, nodes.length - 1]);
    }
  }
  const pos: number[] = [];
  for (const [a, b] of edges)
    pos.push(...nodes[a].toArray(), ...nodes[b].toArray());
  const lines = new BufferGeometry();
  lines.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return { nodes, lines };
}

/** Perception SEO: a crawler lens moving through a site graph, indexing pages as it goes. */
export default function PerceptionScene({
  track,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const lensRef = useRef<Mesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const { nodes, lines } = useMemo(() => buildGraph(), []);
  const [nodeGeo, lensGeo, nodeMat, lensMat, lineMat, lineGeo] = useDisposable(
    () => [
      new BoxGeometry(0.16, 0.2, 0.02),
      new TorusGeometry(0.3, 0.018, 12, 64),
      materials.paper(),
      materials.ember(2),
      materials.line(palette.paperDim, 0.3),
      lines,
    ],
    tier,
  );
  const dim = useMemo(() => new Color(palette.ink700), []);
  const lit = useMemo(() => new Color(palette.paper), []);
  const smooth = useRef(-1);
  const lensPos = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mesh = nodesRef.current;
    if (!group || !mesh || !active.current) return;
    const target = animate ? passProgress(track.current) : 0.7;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const crawl =
      MathUtils.smoothstep(smooth.current, 0.2, 0.75) * (nodes.length - 1);
    const t = animate ? state.clock.elapsedTime : 0;
    const camera = state.camera;

    for (let i = 0; i < nodes.length; i++) {
      const indexed = MathUtils.clamp(crawl - i + 1, 0, 1);
      dummy.position.copy(nodes[i]);
      dummy.translateY(Math.sin(t + i) * 0.03);
      dummy.lookAt(camera.position);
      dummy.scale.setScalar(i === 0 ? 1.6 : 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.copy(dim).lerp(lit, indexed));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const lens = lensRef.current;
    if (lens) {
      const a = Math.floor(MathUtils.clamp(crawl, 0, nodes.length - 1));
      const b = Math.min(a + 1, nodes.length - 1);
      lensPos.lerpVectors(nodes[a], nodes[b], crawl - a);
      lens.position.lerp(lensPos, animate ? damp(6, delta) : 1);
      lens.lookAt(camera.position);
    }
    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      smooth.current * 1.4 - 0.5 + pointer.x * 0.25,
      k,
    );
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      0.25 - pointer.y * 0.1,
      k,
    );
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 7]} fov={36} />
      <StudioLights />
      <group ref={groupRef}>
        <lineSegments geometry={lineGeo} material={lineMat} />
        <instancedMesh
          ref={nodesRef}
          args={[nodeGeo, nodeMat, nodes.length]}
          frustumCulled={false}
        />
        <mesh ref={lensRef} geometry={lensGeo} material={lensMat} />
      </group>
    </>
  );
}
