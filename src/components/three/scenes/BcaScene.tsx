"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Shape,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import {
  createScenePointer,
  readScenePointer,
  screenDistance,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const SLABS = 6;

function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

/** BCA: structured blocks — scattered slabs that lock into an ordered stack, layer by layer. */
export default function BcaScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const slabs = useRef<(Group | null)[]>([]);
  const [slabGeo, edgeGeo, ink, ember, line] = useDisposable(() => {
    const geo = new ExtrudeGeometry(roundedRect(1.8, 1.15, 0.12), {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: tier === "low" ? 1 : 3,
      curveSegments: tier === "low" ? 4 : 8,
    });
    geo.rotateX(-Math.PI / 2);
    geo.center();
    return [
      geo,
      new EdgesGeometry(geo, 30),
      materials.ink(tier),
      materials.ember(0.9),
      materials.line(palette.paper, 0.6),
    ];
  }, tier);
  const smooth = useRef(-1);
  const sp = useMemo(() => createScenePointer(), []);
  const hover = useRef(0);
  const world = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = animate ? progress.current : 0.6;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(5, delta));
    const t = animate ? state.clock.elapsedTime : 0;
    if (active.current) {
      readScenePointer(track.current, sp);
    }
    hover.current = MathUtils.lerp(
      hover.current,
      sp.inside && animate && active.current ? 1 : 0,
      damp(5, delta),
    );
    slabs.current.forEach((slab, i) => {
      if (!slab) return;
      const k = MathUtils.smoothstep(
        smooth.current,
        0.18 + i * 0.06,
        0.38 + i * 0.06,
      );
      const e = 1 - Math.pow(1 - k, 3);
      const scatter = i - (SLABS - 1) / 2;
      slab.position.set(
        MathUtils.lerp(scatter * 0.7, 0, e),
        MathUtils.lerp(scatter * 0.55 + 0.2, (i - (SLABS - 1) / 2) * 0.3, e) +
          Math.sin(t + i) * 0.02 * (1 - e),
        MathUtils.lerp(-Math.abs(scatter) * 0.6, 0, e),
      );
      // Mouse: the slab under the cursor tilts up toward it; its neighbours follow a little.
      let tx = 0;
      let ty = 0;
      if (hover.current > 0.001) {
        slab.getWorldPosition(world);
        const near = Math.max(
          0,
          1 - screenDistance(world, state.camera, sp) / 0.9,
        );
        const f = hover.current * e * near * near;
        world.project(state.camera);
        tx = -(sp.y - world.y) * 1.2 * f;
        ty = (sp.x - world.x) * sp.aspect * 1.2 * f;
        slab.position.z += f * 0.25;
      }
      slab.rotation.set(
        (1 - e) * (i % 2 ? 0.6 : -0.5) + tx,
        (1 - e) * (i - 2) * 0.5 + ty,
        (1 - e) * 0.3,
      );
    });
    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      -0.6 + smooth.current * 0.6,
      k,
    );
    group.rotation.x = MathUtils.lerp(group.rotation.x, 0.35, k);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 7]} fov={36} />
      <StudioLights />
      <group ref={groupRef}>
        {Array.from({ length: SLABS }, (_, i) => (
          <group
            key={i}
            ref={(g) => {
              slabs.current[i] = g;
            }}
          >
            <mesh geometry={slabGeo} material={i === SLABS - 1 ? ember : ink} />
            <lineSegments geometry={edgeGeo} material={line} />
          </group>
        ))}
      </group>
    </>
  );
}
