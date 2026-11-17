"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Object3D,
  type PerspectiveCamera,
} from "three";
import type { PerfTier } from "@/lib/three/capabilities";
import {
  createPaperMaterials,
  paperUniformsOf,
} from "@/components/three/materials/manuscriptMaterial";
import {
  createPageGeometry,
  PAGE_THICKNESS,
} from "@/components/three/objects/pageGeometry";
import { pointer, pointerSpeed } from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";

interface PaperStackProps {
  count: number;
  tier: PerfTier;
  animate: boolean;
  progress: RefObject<number>;
  active: RefObject<boolean>;
}

const PI = Math.PI;
const { clamp, lerp, smoothstep } = MathUtils;
/** Normalised 0..1 window of `p` between a and b, eased. */
const win = (p: number, a: number, b: number) => smoothstep(p, a, b);
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Scroll-scrubbed composition used when motion is reduced. */
const STILL_PROGRESS = 0.16;

/**
 * The manuscript as a real stack of thick paper sheets bound at a common spine.
 * Scroll choreography through the pinned hero (fully scrubbed and reversible):
 *   0.00–0.30  the closed stack fans open around its spine, depth appears
 *   0.15–0.65  pages turn one after another, curling hardest mid-turn
 *   0.30–0.75  the stack separates in depth while the camera dollies in through it
 *   0.70–1.00  pages lift, scatter and fly past the camera as About arrives
 */
export function PaperStack({
  count,
  tier,
  animate,
  progress,
  active,
}: PaperStackProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const smooth = useRef({ p: -1, breeze: 0 });

  const geometry = useMemo(() => {
    const g = createPageGeometry();
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = seeded(i + 1);
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
    g.setAttribute(
      "aCurl",
      new InstancedBufferAttribute(new Float32Array(count), 1),
    );
    g.setAttribute(
      "aOcc",
      new InstancedBufferAttribute(new Float32Array(count), 1),
    );
    return g;
  }, [count]);

  const paper = useMemo(() => createPaperMaterials(tier), [tier]);

  const pages = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        k: count > 1 ? i / (count - 1) : 0,
        jitter: (seeded(i + 7) - 0.5) * 0.06,
        lean: (seeded(i + 13) - 0.5) * 0.08,
        phase: seeded(i + 29) * PI * 2,
        flyX: (seeded(i + 41) - 0.35) * 9,
        flyY: 3 + seeded(i + 53) * 3,
        spin: (seeded(i + 61) - 0.5) * 2.4,
        curl: 0.08 + seeded(i + 71) * 0.18,
      })),
    [count],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      paper.dispose();
    },
    [geometry, paper],
  );

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group || !active.current) return;
    const camera = state.camera as PerspectiveCamera;

    // Damped scroll progress gives a scrubbed, inertial feel and stays fully reversible.
    const target = animate ? progress.current : STILL_PROGRESS;
    const s = smooth.current;
    s.p = s.p < 0 || !animate ? target : lerp(s.p, target, damp(5, delta));
    const p = s.p;
    const t = animate ? state.clock.elapsedTime : 6;
    const uniforms = paperUniformsOf(mesh.material);
    if (uniforms) {
      uniforms.uTime.value = t;
      // Mouse: moving the cursor is a breeze — the faster it moves, the more the pages flutter.
      const gust = animate && pointer.enabled ? pointerSpeed() : 0;
      s.breeze = lerp(s.breeze, gust, damp(gust > s.breeze ? 6 : 1.5, delta));
      uniforms.uFlutter.value = animate ? 1 + s.breeze * 3.5 : 0;
    }

    const fan = win(p, 0, 0.28);
    const separate = win(p, 0.32, 0.72);
    const dolly = win(p, 0.38, 0.8);
    const curls = mesh.geometry.getAttribute(
      "aCurl",
    ) as InstancedBufferAttribute;
    const occ = mesh.geometry.getAttribute("aOcc") as InstancedBufferAttribute;
    const gap = PAGE_THICKNESS * 2.6;

    for (let i = 0; i < pages.length; i++) {
      const pg = pages[i];
      const breathe = Math.sin(t * 0.5 + pg.phase);
      // Each page turns in sequence (top of the stack first).
      const turnStart = 0.12 + (1 - pg.k) * 0.36;
      const turn = win(p, turnStart, turnStart + 0.2);
      const fly = win(p, 0.62 + (1 - pg.k) * 0.18, 0.9 + (1 - pg.k) * 0.1);

      // Fan: pages open around the spine like a book riffled by a thumb.
      const fanAngle = lerp(0.12, 0.9, fan) * (pg.k - 0.5) * 1.4 + pg.jitter;
      const turnAngle = -turn * PI * 0.88;
      const rotY = fanAngle + turnAngle + breathe * 0.015;

      // Depth separation: tight stack -> airy corridor of pages.
      const z =
        (pg.k - 0.5) * lerp(count * gap, 3.6, separate) +
        Math.sin(turn * PI) * 0.25;

      dummy.position.set(
        lerp(0, pg.flyX, fly * fly),
        lerp(breathe * 0.03 + (pg.k - 0.5) * 0.12 * fan, pg.flyY, fly * fly),
        z + fly * fly * 1.15,
      );
      dummy.rotation.set(
        pg.lean + fly * pg.spin,
        rotY + fly * pg.spin * 0.6,
        pg.lean * 0.5 + fly * pg.spin * 0.4,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Curl: resting droop, hardest mid-turn, fluttering open as it flies.
      curls.setX(
        i,
        pg.curl +
          Math.sin(turn * PI) * 1.25 +
          fan * 0.12 +
          fly * (0.6 + pg.spin * 0.3),
      );
      // Neighbours occlude each other while the stack is tight.
      occ.setX(
        i,
        (1 - fan * 0.6) *
          (1 - separate) *
          (1 - fly) *
          (0.35 + 0.65 * (1 - Math.abs(pg.k - 0.5) * 2)),
      );
    }
    mesh.instanceMatrix.needsUpdate = true;
    curls.needsUpdate = true;
    occ.needsUpdate = true;

    // Composition: right of the headline on wide screens, above it on narrow ones; centred
    // as the camera dollies through.
    const wide = (camera.aspect ?? 1) > 1.1;
    const k = animate ? damp(3, delta) : 1;
    const baseX = wide ? 1.35 : -0.25;
    const baseY = wide ? -0.05 : 0.95;
    // The stack eases away from the pointer — blank paper that resists a probe, not a toy that chases it.
    const resist = animate && pointer.enabled ? 1 : 0;
    group.position.x = lerp(
      group.position.x,
      lerp(baseX, wide ? 0.9 : -0.4, dolly) - resist * pointer.x * 0.22,
      k,
    );
    group.position.y = lerp(
      group.position.y,
      lerp(baseY, 0.2, dolly) - resist * pointer.y * 0.14,
      k,
    );
    group.scale.setScalar(wide ? 1.12 : 0.74);
    group.rotation.x = lerp(group.rotation.x, lerp(-0.3, -0.08, separate), k);
    group.rotation.y = lerp(
      group.rotation.y,
      lerp(0.3, 0.85, separate) + p * 0.2 + s.breeze * pointer.x * 0.12,
      k,
    );
    group.rotation.z = lerp(group.rotation.z, lerp(0.12, 0, fan), k);

    camera.position.set(
      lerp(camera.position.x, 0, k),
      lerp(camera.position.y, lerp(0.3, 0.05, dolly), k),
      lerp(camera.position.z, lerp(6.4, 4.1, dolly), k),
    );
    camera.lookAt(
      group.position.x * clamp(1 - dolly, 0.25, 1),
      group.position.y * 0.5,
      -1.5,
    );
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, paper.material, count]}
        customDepthMaterial={paper.depthMaterial}
        castShadow={tier !== "low"}
        receiveShadow={tier !== "low"}
        frustumCulled={false}
      />
    </group>
  );
}
