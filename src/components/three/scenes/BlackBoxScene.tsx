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
  LineSegments,
  MathUtils,
  Mesh,
  Object3D,
  OctahedronGeometry,
  type LineBasicMaterial,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { pointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp, passProgress } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const LAYERS = [4, 6, 6, 3];
const SIZE = 1.6;

/** Face panels: [normal axis, sign]. */
const FACES: [0 | 1 | 2, 1 | -1][] = [
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [2, 1],
  [2, -1],
];

function buildNetwork() {
  const nodes: [number, number, number, number][] = []; // x,y,z,layer
  LAYERS.forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      const x = (l / (LAYERS.length - 1) - 0.5) * SIZE * 0.75;
      const y = (n > 1 ? i / (n - 1) - 0.5 : 0) * SIZE * 0.7;
      const z = Math.sin(i * 2.3 + l) * 0.25;
      nodes.push([x, y, z, l]);
    }
  });
  const positions: number[] = [];
  let offset = 0;
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const next = offset + LAYERS[l];
    for (let a = 0; a < LAYERS[l]; a++)
      for (let b = 0; b < LAYERS[l + 1]; b++) {
        const A = nodes[offset + a];
        const B = nodes[next + b];
        positions.push(A[0], A[1], A[2], B[0], B[1], B[2]);
      }
    offset = next;
  }
  const lines = new BufferGeometry();
  lines.setAttribute("position", new Float32BufferAttribute(positions, 3));
  return { nodes, lines };
}

/** BlackBox Learning: a black box that unfolds to reveal the neural lattice learning inside it. */
export default function BlackBoxScene({
  track,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const panels = useRef<(Mesh | null)[]>([]);
  const nodesRef = useRef<InstancedMesh>(null);
  const linesRef = useRef<LineSegments>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const color = useMemo(() => new Color(), []);
  const { nodes, lines } = useMemo(() => buildNetwork(), []);
  const [panelGeo, nodeGeo, ink, nodeMat, lineMat, lineGeo] = useDisposable(
    () => [
      new BoxGeometry(SIZE, SIZE, 0.05),
      new OctahedronGeometry(0.06, 0),
      materials.ink(tier),
      materials.ember(1.2),
      materials.line(palette.emberSoft, 0),
      lines,
    ],
    tier,
  );
  const smooth = useRef(-1);
  const dark = useMemo(() => new Color(palette.ink700), []);
  const hot = useMemo(() => new Color(palette.ember), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const net = nodesRef.current;
    if (!group || !net || !active.current) return;
    const target = animate ? passProgress(track.current) : 0.55;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const open = MathUtils.smoothstep(smooth.current, 0.25, 0.6);
    const t = animate ? state.clock.elapsedTime : 1.2;

    panels.current.forEach((panel, i) => {
      if (!panel) return;
      const [axis, sign] = FACES[i];
      const d = SIZE / 2 + open * (1.1 + i * 0.05);
      panel.position.set(0, 0, 0);
      panel.position.setComponent(axis, sign * d);
      panel.rotation.set(0, 0, 0);
      if (axis === 0) panel.rotation.y = Math.PI / 2 + sign * open * 0.6;
      if (axis === 1) panel.rotation.x = Math.PI / 2 + sign * open * 0.6;
      if (axis === 2) panel.rotation.y = sign * open * 0.5;
      panel.scale.setScalar(1 - open * 0.25);
    });

    for (let i = 0; i < nodes.length; i++) {
      const [x, y, z, layer] = nodes[i];
      // A signal sweeps through the layers.
      const wave = Math.max(0, Math.sin(t * 2 - layer * 1.2 + i * 0.3));
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(open * (0.7 + wave * 0.7));
      dummy.rotation.set(t * 0.5, t * 0.3, 0);
      dummy.updateMatrix();
      net.setMatrixAt(i, dummy.matrix);
      net.setColorAt(i, color.copy(dark).lerp(hot, 0.25 + wave * 0.75));
    }
    net.instanceMatrix.needsUpdate = true;
    if (net.instanceColor) net.instanceColor.needsUpdate = true;
    (linesRef.current?.material as LineBasicMaterial | undefined)?.setValues({
      opacity: open * 0.28,
    });

    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      0.6 + smooth.current * 0.8 + pointer.x * 0.25,
      k,
    );
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      -0.35 - pointer.y * 0.12,
      k,
    );
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6.2]} fov={36} />
      <StudioLights rim={1.2} />
      <group ref={groupRef}>
        {FACES.map((_, i) => (
          <mesh
            key={i}
            ref={(m) => {
              panels.current[i] = m;
            }}
            geometry={panelGeo}
            material={ink}
          />
        ))}
        <instancedMesh
          ref={nodesRef}
          args={[nodeGeo, nodeMat, nodes.length]}
          frustumCulled={false}
        />
        <lineSegments ref={linesRef} geometry={lineGeo} material={lineMat} />
      </group>
    </>
  );
}
