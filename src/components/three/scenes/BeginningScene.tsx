"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  MathUtils,
  Object3D,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";
import { NotebookPage } from "@/components/three/objects/NotebookPage";

/** 5×7 bitmap glyphs (rows top→bottom). */
const GLYPHS: Record<string, string[]> = {
  ">": ["10000", "01000", "00100", "00010", "00100", "01000", "10000"],
  h: ["10000", "10000", "10110", "11001", "10001", "10001", "10001"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  w: ["00000", "00000", "10001", "10001", "10101", "10101", "01010"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  d: ["00001", "00001", "01101", "10011", "10001", "10001", "01111"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};
const LINES = ["> hello, world"];
const CELL = 0.06;

interface Pixel {
  x: number;
  y: number;
  order: number;
  sx: number;
  sy: number;
  sz: number;
}

/** Cell centre of a character position (line, column). */
const slotAt = (
  line: number,
  col: number,
  totalCols: number,
): [number, number] => [
  (col * 6 + 2 - totalCols / 2) * CELL,
  (-(line * 9 + 3) + 7) * CELL,
];

function buildPixels(): { pixels: Pixel[]; slots: [number, number][] } {
  const pixels: Pixel[] = [];
  const slots: [number, number][] = [];
  let charIndex = 0;
  const totalCols = Math.max(...LINES.map((l) => l.length)) * 6;
  LINES.forEach((line, li) => {
    [...line].forEach((ch, ci) => {
      slots.push(slotAt(li, ci, totalCols));
      const glyph = GLYPHS[ch] ?? GLYPHS[" "];
      glyph.forEach((row, ry) =>
        [...row].forEach((bit, rx) => {
          if (bit !== "1") return;
          const seed = Math.sin((pixels.length + 1) * 91.7) * 43758.5;
          const r = seed - Math.floor(seed);
          pixels.push({
            x: (ci * 6 + rx - totalCols / 2) * CELL,
            y: (-(li * 9 + ry) + 7) * CELL,
            order: charIndex,
            sx: (r - 0.5) * 6,
            sy: (Math.cos(r * 40) - 0.2) * 3,
            sz: -2 - r * 4,
          });
        }),
      );
      charIndex++;
    });
  });
  // One extra slot after the final character: where the cursor rests once typing is done.
  slots.push(
    slotAt(LINES.length - 1, LINES[LINES.length - 1].length, totalCols),
  );
  return { pixels, slots };
}

/** The beginning: a first line of code assembling itself from scattered terminal pixels. */
export default function BeginningScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const cursorRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const { pixels, slots } = useMemo(() => buildPixels(), []);
  const totalChars = LINES.join("").length;
  const [geometry, ink, ember] = useDisposable(
    () => [
      new BoxGeometry(CELL * 0.86, CELL * 0.86, CELL * 0.86),
      materials.paper(),
      materials.ember(2.2),
    ],
    tier,
  );
  const smooth = useRef(-1);
  const sp = useMemo(() => createScenePointer(), []);
  const hit = useMemo(() => new Vector3(), []);
  const origin = useMemo(() => new Vector3(), []);
  const hover = useRef(0);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group || !active.current) return;
    const target = animate ? progress.current : 0.6;
    // Restart cleanly when the section is re-entered (hash links, reverse scroll).
    if (animate && target < 0.06) {
      smooth.current = target;
    } else {
      smooth.current =
        smooth.current < 0 || !animate
          ? target
          : MathUtils.lerp(smooth.current, target, damp(5, delta));
    }
    const typed =
      MathUtils.smoothstep(smooth.current, 0.15, 0.55) * (totalChars + 1);
    const t = state.clock.elapsedTime;

    // Mouse: glyph cubes near the cursor scatter outward and tumble, then re-form behind it.
    readScenePointer(track.current, sp);
    let near = false;
    if (sp.inside && animate) {
      group.updateMatrixWorld();
      near =
        pointerOnPlane(
          sp,
          state.camera,
          group.getWorldPosition(origin),
          hit,
        ) !== null;
      if (near) group.worldToLocal(hit);
    }
    hover.current = MathUtils.lerp(hover.current, near ? 1 : 0, damp(6, delta));
    const h = hover.current;

    for (let i = 0; i < pixels.length; i++) {
      const px = pixels[i];
      const k = MathUtils.clamp(typed - px.order, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      let x = MathUtils.lerp(px.sx, px.x, e);
      let y = MathUtils.lerp(px.sy, px.y, e);
      let z =
        MathUtils.lerp(px.sz, 0, e) +
        (animate ? Math.sin(t * 2 + i) * 0.004 : 0);
      let f = 0;
      if (h > 0.001) {
        const dx = x - hit.x;
        const dy = y - hit.y;
        const d = Math.hypot(dx, dy) + 1e-4;
        f = h * e * Math.max(0, 1 - d / 0.55) ** 2;
        x += (dx / d) * f * 0.35;
        y += (dy / d) * f * 0.35;
        z += f * 0.5;
      }
      dummy.position.set(x, y, z);
      dummy.rotation.set((1 - e) * 3 + f * 2.4, (1 - e) * 2 + f * 1.6, 0);
      dummy.scale.setScalar(0.25 + e * 0.75);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const c = cursorRef.current;
    if (c) {
      // The cursor sits in the slot *after* the character being typed, never on top of it,
      // and only blinks once the line is finished.
      const slot = slots[Math.min(Math.floor(typed) + 1, slots.length - 1)];
      const blink = !animate || Math.sin(t * 6) > 0 ? 1 : 0.08;
      dummy.position.set(slot[0], slot[1], 0);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(5 * blink, 7 * blink, 1.2 * blink);
      dummy.updateMatrix();
      c.setMatrixAt(0, dummy.matrix);
      c.instanceMatrix.needsUpdate = true;
    }

    const k = animate ? damp(3, delta) : 1;
    group.rotation.y = MathUtils.lerp(
      group.rotation.y,
      -0.35 + smooth.current * 0.5,
      k,
    );
    group.rotation.x = MathUtils.lerp(group.rotation.x, 0.12, k);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 6]} fov={35} />
      <StudioLights />
      <NotebookPage
        track={track}
        progress={progress}
        active={active}
        tier={tier}
        animate={animate}
      />
      <group ref={groupRef} position={[0.15, 0.35, 0.55]} scale={0.92}>
        <instancedMesh
          ref={meshRef}
          args={[geometry, ink, pixels.length]}
          frustumCulled={false}
        />
        <instancedMesh
          ref={cursorRef}
          args={[geometry, ember, 1]}
          frustumCulled={false}
        />
        <gridHelper
          args={[8, 32, "#3a3a40", "#1f1f23"]}
          position={[0, -1, -0.6]}
        />
      </group>
    </>
  );
}
