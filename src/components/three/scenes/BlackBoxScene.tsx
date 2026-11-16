"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Points,
  type PointsMaterial,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { pointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp, passProgress } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

type V = [number, number, number];
const W = 0.28; // body half-width
const BOTTOM = -0.8;
const TOP = 0.5;
const APEX = 1.15;

/**
 * Folded paper rocket. Every triangle has two positions: where it lies on the flat, unfolded
 * sheet and where it sits on the finished rocket. A single morph target folds one into the
 * other, so scrolling literally folds the sheet. Groups: 0 = paper, 1 = ember-tinted fins.
 */
function buildRocket(): BufferGeometry {
  const folded: number[] = [];
  const flat: number[] = [];
  const push = (f: V[], u: V[]) => {
    folded.push(...f.flat());
    flat.push(...u.flat());
  };
  const corners: [number, number][] = [
    [-W, W],
    [W, W],
    [W, -W],
    [-W, -W],
  ];
  const slant = Math.hypot(APEX - TOP, W);
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i];
    const [bx, bz] = corners[(i + 1) % 4];
    const x0 = (i - 2) * 2 * W;
    const x1 = x0 + 2 * W;
    // Body panel (two triangles).
    push(
      [
        [ax, BOTTOM, az],
        [bx, BOTTOM, bz],
        [bx, TOP, bz],
      ],
      [
        [x0, BOTTOM, 0],
        [x1, BOTTOM, 0],
        [x1, TOP, 0],
      ],
    );
    push(
      [
        [ax, BOTTOM, az],
        [bx, TOP, bz],
        [ax, TOP, az],
      ],
      [
        [x0, BOTTOM, 0],
        [x1, TOP, 0],
        [x0, TOP, 0],
      ],
    );
    // Nose triangle, unfolded above its panel.
    push(
      [
        [ax, TOP, az],
        [bx, TOP, bz],
        [0, APEX, 0],
      ],
      [
        [x0, TOP, 0],
        [x1, TOP, 0],
        [(x0 + x1) / 2, TOP + slant, 0],
      ],
    );
  }
  const paperCount = folded.length / 3;
  // Fins: one per corner, unfolded below the strip.
  for (let i = 0; i < 4; i++) {
    const [cx, cz] = corners[i];
    const x = (i - 1.5) * 2 * W;
    push(
      [
        [cx, BOTTOM + 0.5, cz],
        [cx, BOTTOM, cz],
        [cx * 2.6, BOTTOM - 0.25, cz * 2.6],
      ],
      [
        [x, BOTTOM - 0.05, 0],
        [x - 0.18, BOTTOM - 0.55, 0],
        [x + 0.18, BOTTOM - 0.7, 0],
      ],
    );
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(flat, 3));
  const target = new BufferGeometry();
  target.setAttribute("position", new Float32BufferAttribute(folded, 3));
  g.computeVertexNormals();
  target.computeVertexNormals();
  g.morphAttributes.position = [target.getAttribute("position")];
  g.morphAttributes.normal = [target.getAttribute("normal")];
  g.addGroup(0, paperCount, 0);
  g.addGroup(paperCount, folded.length / 3 - paperCount, 1);
  g.computeBoundingSphere();
  if (g.boundingSphere) g.boundingSphere.radius *= 3;
  return g;
}

const SPARKS = 220;
const seeded = (i: number) => {
  const x = Math.sin(i * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * BlackBox Learning: a flat sheet of paper folds itself into a rocket, ignites and lifts off.
 *   0.22–0.48 fold · 0.46–0.60 ignition · 0.58–0.95 lift-off. Fully scrubbed and reversible.
 */
export default function BlackBoxScene({
  track,
  active,
  tier,
  animate,
}: SceneProps) {
  const rocketRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const sparksRef = useRef<Points>(null);
  const smooth = useRef(-1);
  const count = tier === "low" ? 90 : SPARKS;
  const sparkSeeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => [
        seeded(i),
        seeded(i + 99),
        seeded(i + 199),
      ]),
    [count],
  );

  const res = useDisposable(() => {
    const geo = buildRocket();
    const paper = new MeshStandardMaterial({
      color: new Color("#e6dfd3"),
      roughness: 0.85,
      side: DoubleSide,
      flatShading: true,
    });
    const fins = new MeshStandardMaterial({
      color: new Color(palette.ember),
      roughness: 0.7,
      side: DoubleSide,
      flatShading: true,
    });
    const sparkGeo = new BufferGeometry();
    sparkGeo.setAttribute(
      "position",
      new Float32BufferAttribute(new Float32Array(count * 3), 3),
    );
    const sparkMat = materials.glowPoints(tier === "low" ? 0.05 : 0.04);
    return {
      geo,
      mats: [paper, fins],
      sparkGeo,
      sparkMat,
      dispose() {
        geo.dispose();
        paper.dispose();
        fins.dispose();
        sparkGeo.dispose();
        sparkMat.dispose();
      },
    };
  }, `${tier}-${count}`);

  useFrame((state, delta) => {
    const rocket = rocketRef.current;
    const mesh = meshRef.current;
    if (!rocket || !mesh || !active.current) return;
    const target = animate ? passProgress(track.current) : 0.5;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(5, delta));
    const p = smooth.current;
    const fold = MathUtils.smoothstep(p, 0.22, 0.48);
    const ignite = MathUtils.smoothstep(p, 0.46, 0.6);
    const lift = MathUtils.smoothstep(p, 0.58, 0.95);
    const t = animate ? state.clock.elapsedTime : 0;
    const k = animate ? damp(4, delta) : 1;

    if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = fold;

    // Flat sheet faces the camera; as it folds it stands up and turns, then climbs.
    const shake = ignite * (1 - lift * 0.6) * 0.012;
    rocket.position.set(
      Math.sin(t * 40) * shake,
      MathUtils.lerp(-0.1, 0, fold) +
        lift * lift * 2.4 +
        Math.sin(t * 37) * shake,
      0,
    );
    rocket.rotation.y = MathUtils.lerp(
      rocket.rotation.y,
      fold * (0.8 + t * 0.25 * fold),
      k,
    );
    // The nose leans slightly toward the pointer once the rocket exists.
    rocket.rotation.z = MathUtils.lerp(
      rocket.rotation.z,
      -pointer.x * 0.25 * fold,
      k,
    );
    rocket.rotation.x = MathUtils.lerp(
      rocket.rotation.x,
      (1 - fold) * -0.25 + pointer.y * 0.15 * fold,
      k,
    );

    // Sparks stream from the nozzle and bend away from the pointer.
    const pts = sparksRef.current;
    if (pts) {
      const attr = pts.geometry.getAttribute(
        "position",
      ) as Float32BufferAttribute;
      const nozzleY = rocket.position.y + BOTTOM - 0.05;
      const push = -pointer.x * 0.6;
      for (let i = 0; i < count; i++) {
        const [a, b, c] = sparkSeeds[i];
        const life = (t * (0.9 + a * 0.8) + b) % 1;
        const fall = life * (0.9 + ignite * 1.6);
        attr.setXYZ(
          i,
          rocket.position.x + (a - 0.5) * 0.3 * life * 3 + push * life * life,
          nozzleY - fall,
          (c - 0.5) * 0.3 * life * 3,
        );
      }
      attr.needsUpdate = true;
      (pts.material as PointsMaterial).setValues({ opacity: ignite * 0.95 });
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 6.6]} fov={36} />
      <StudioLights rim={1.4} />
      <pointLight
        position={[0, -1.6, 0.8]}
        intensity={4}
        color={palette.ember}
        distance={5}
      />
      <group ref={rocketRef}>
        <mesh
          ref={meshRef}
          geometry={res.geo}
          material={res.mats}
          morphTargetInfluences={[0]}
        />
      </group>
      <points
        ref={sparksRef}
        geometry={res.sparkGeo}
        material={res.sparkMat}
        frustumCulled={false}
      />
    </>
  );
}
