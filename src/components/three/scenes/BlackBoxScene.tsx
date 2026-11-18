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
  PointLight,
  Points,
  type PointsMaterial,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { createScenePointer, readScenePointer } from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

type V = [number, number, number];
const W = 0.28; // body half-width
const BOTTOM = -0.8;
const TOP = 0.5;
const APEX = 1.15;

/**
 * 3D Origami paper rocket. A faceted geometric rocket that remains 3D at all times
 * during scroll — it never collapses or flattens into a 2D sheet.
 * Groups: 0 = paper body & nose cone, 1 = ember-tinted aerodynamic fins.
 */
function buildRocket(): BufferGeometry {
  const vertices: number[] = [];
  const push = (triangles: V[]) => {
    vertices.push(...triangles.flat());
  };
  const corners: [number, number][] = [
    [-W, W],
    [W, W],
    [W, -W],
    [-W, -W],
  ];

  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[i];
    const [bx, bz] = corners[(i + 1) % 4];
    // Body panel (two triangles per side).
    push([
      [ax, BOTTOM, az],
      [bx, BOTTOM, bz],
      [bx, TOP, bz],
    ]);
    push([
      [ax, BOTTOM, az],
      [bx, TOP, bz],
      [ax, TOP, az],
    ]);
    // Nose cone triangle.
    push([
      [ax, TOP, az],
      [bx, TOP, bz],
      [0, APEX, 0],
    ]);
  }
  const paperCount = vertices.length / 3;

  // Fins: one aerodynamic fin per corner flared outwards.
  for (let i = 0; i < 4; i++) {
    const [cx, cz] = corners[i];
    push([
      [cx, BOTTOM + 0.5, cz],
      [cx, BOTTOM, cz],
      [cx * 2.6, BOTTOM - 0.25, cz * 2.6],
    ]);
  }

  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  g.computeVertexNormals();
  g.addGroup(0, paperCount, 0);
  g.addGroup(paperCount, vertices.length / 3 - paperCount, 1);
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
 * BlackBox Learning: an origami paper rocket standing proud in 3D.
 *   - Enters smoothly from below as section approaches.
 *   - Hovers, breathes and ignites thrusters with ember sparks during chapter reading.
 *   - Accelerates and launches into the sky as the user scrolls past.
 *   - Fully reversible when scrolling back upwards, staying completely in 3D without flattening.
 */
export default function BlackBoxScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const rocketRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const sparksRef = useRef<Points>(null);
  const smooth = useRef(-1);
  const isFirst = useRef(true);
  const sp = useMemo(() => createScenePointer(), []);
  const hover = useRef(0);
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
    if (!rocket || !mesh) return;

    const target = animate ? progress.current : 0.5;
    if (smooth.current < 0 || !animate) {
      smooth.current = target;
    } else {
      smooth.current = MathUtils.lerp(smooth.current, target, damp(6, delta));
    }

    const p = smooth.current;
    // 0.08–0.26 lifts rocket smoothly from entrance position into center hover stage.
    const enter = MathUtils.smoothstep(p, 0.08, 0.26);
    // 0.24–0.38 ignites thrusters, sparks stream and engine glows.
    const ignite = MathUtils.smoothstep(p, 0.24, 0.38);
    // 0.62–0.92 main booster launch: accelerates rocket up into the sky.
    const lift = MathUtils.smoothstep(p, 0.62, 0.92);

    const t = animate ? state.clock.elapsedTime : 0;
    const k = animate ? damp(5, delta) : 1;

    // Mouse: nose tilts toward cursor inside slot; exhaust bends away.
    if (active.current) {
      readScenePointer(track.current, sp);
    }
    hover.current = MathUtils.lerp(
      hover.current,
      sp.inside && animate && active.current ? 1 : 0,
      damp(4, delta),
    );
    const px = sp.x * hover.current;
    const py = sp.y * hover.current;

    // Subtle engine vibration and gentle idle hover bob while in viewport.
    const shake = ignite * Math.max(0, 1 - lift * 0.7) * 0.009;
    const hoverBob =
      ignite > 0.01 ? Math.sin(t * 2.2) * 0.035 * (1 - lift * 0.8) : 0;
    const liftDistance = lift * lift * 3.2;

    const targetPosX = Math.sin(t * 43) * shake;
    const targetPosY =
      MathUtils.lerp(-0.7, 0, enter) +
      hoverBob +
      liftDistance +
      Math.sin(t * 37) * shake;
    const targetPosZ = 0;

    // Fixed 3/4 isometric hero orientation with gentle, bounded idle sway.
    // Deterministic: no unbound t accumulation so reverse scrolling never unwinds or spins wildly.
    const idleYaw = Math.sin(t * 1.4) * 0.08;
    const targetRotY = 0.75 + idleYaw;
    const targetRotZ = -px * 0.42;
    const targetRotX = py * 0.28 + lift * 0.25;

    if (isFirst.current) {
      rocket.position.set(targetPosX, targetPosY, targetPosZ);
      rocket.rotation.set(targetRotX, targetRotY, targetRotZ);
      isFirst.current = false;
    } else {
      rocket.position.set(targetPosX, targetPosY, targetPosZ);
      rocket.rotation.x = MathUtils.lerp(rocket.rotation.x, targetRotX, k);
      rocket.rotation.y = MathUtils.lerp(rocket.rotation.y, targetRotY, k);
      rocket.rotation.z = MathUtils.lerp(rocket.rotation.z, targetRotZ, k);
    }

    // Dynamic thruster point light attached to rocket base.
    if (lightRef.current) {
      const flicker = Math.sin(t * 32) * 0.6;
      lightRef.current.intensity =
        ignite * Math.max(0, 4.2 + flicker) * Math.max(0, 1 - lift * 0.7);
    }

    // Sparks stream from nozzle; fade cleanly on launch so no orphan sparks linger on reverse scroll.
    const pts = sparksRef.current;
    if (pts) {
      const sparkFade = Math.max(0, 1 - lift * 1.3);
      const sparkAlpha = ignite * sparkFade;

      if (sparkAlpha <= 0.01) {
        pts.visible = false;
      } else {
        pts.visible = true;
        const attr = pts.geometry.getAttribute(
          "position",
        ) as Float32BufferAttribute;
        const nozzleY = rocket.position.y + BOTTOM - 0.05;
        const push = -px * 0.85;
        for (let i = 0; i < count; i++) {
          const [a, b, c] = sparkSeeds[i];
          const life = (t * (0.9 + a * 0.8) + b) % 1;
          const fall = life * (0.9 + ignite * 1.5);
          attr.setXYZ(
            i,
            rocket.position.x +
              (a - 0.5) * 0.28 * life * 3 +
              push * life * life,
            nozzleY - fall,
            (c - 0.5) * 0.28 * life * 3,
          );
        }
        attr.needsUpdate = true;
        (pts.material as PointsMaterial).setValues({
          opacity: sparkAlpha * 0.95,
        });
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 6.6]} fov={36} />
      <StudioLights rim={1.4} />
      <group ref={rocketRef}>
        <mesh ref={meshRef} geometry={res.geo} material={res.mats} />
        <pointLight
          ref={lightRef}
          position={[0, BOTTOM - 0.1, 0.3]}
          intensity={0}
          color={palette.ember}
          distance={5}
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
