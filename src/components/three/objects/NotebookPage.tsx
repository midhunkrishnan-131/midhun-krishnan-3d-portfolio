"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  MathUtils,
  Line,
  Mesh,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import {
  createPageGeometry,
  PAGE_HEIGHT,
  PAGE_WIDTH,
} from "@/components/three/objects/pageGeometry";
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const TRAIL = 22;
const PAGE_HALF = { x: PAGE_WIDTH / 2, y: PAGE_HEIGHT / 2 };
const PLANE_POINT = new Vector3();
const PLANE_NORMAL = new Vector3();
const INK_HIT = new Vector3();

/**
 * Midhun's first Python programme, painted on a manuscript leaf so the type
 * stays sharp while the page turns around its spine — the same paper language
 * as the hero stack.
 */
function paintNotebook(): CanvasTexture {
  const width = 1024;
  const height = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.fillStyle = "#e9e7e2";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.015 + Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
  }
  ctx.strokeStyle = "rgba(180, 40, 40, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, height);
  ctx.stroke();
  ctx.strokeStyle = "rgba(40, 70, 140, 0.16)";
  ctx.lineWidth = 1;
  for (let y = 160; y < height - 80; y += 36) {
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "italic 48px 'Instrument Serif', Georgia, serif";
  ctx.fillText("My Programming Journey", 160, 110);

  ctx.font = "italic 22px Georgia, serif";
  ctx.fillStyle = "rgba(40,40,40,0.55)";
  ctx.fillText("— the first page I was proud to write", 160, 148);

  const lines = [
    "# My Programming Journey",
    "",
    "def introduce():",
    '    name = "Midhun Krishnan"',
    '    interest = "Python and Generative AI"',
    "",
    '    print(f"Hello, I\'m {name}")',
    '    print(f"Learning {interest}")',
    "",
    "introduce()",
  ];

  ctx.font = "26px ui-monospace, SFMono-Regular, Menlo, monospace";
  let y = 220;
  for (const line of lines) {
    drawHighlighted(ctx, line, 160, y);
    y += 36;
  }

  ctx.font = "italic 20px Georgia, serif";
  ctx.fillStyle = "#c45a2a";
  ctx.save();
  ctx.translate(width - 70, 520);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("keep going.", 0, 0);
  ctx.restore();

  ctx.fillStyle = "rgba(30,30,30,0.55)";
  ctx.font = "18px ui-monospace, Menlo, monospace";
  ctx.fillText("01", width - 90, height - 48);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

function drawHighlighted(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  if (!text) return;
  const parts = text.split(
    /(#.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|print|return|if|else)\b)/,
  );
  let cx = x;
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith("#")) ctx.fillStyle = "#5a6b4a";
    else if (part.startsWith('"') || part.startsWith("'"))
      ctx.fillStyle = "#8a4a1f";
    else if (/^(def|print|return|if|else)$/.test(part))
      ctx.fillStyle = "#3a4a8a";
    else ctx.fillStyle = "#1a1a1a";
    ctx.fillText(part, cx, y);
    cx += ctx.measureText(part).width;
  }
}

export function NotebookPage({ track, progress, active, animate }: SceneProps) {
  const group = useRef<Group>(null);
  const leaf = useRef<Mesh>(null);
  const texture = useMemo(() => paintNotebook(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  const turn = useRef(0);
  const sp = useMemo(() => createScenePointer(), []);
  const points = useMemo(
    () => Array.from({ length: TRAIL }, () => new Vector3()),
    [],
  );
  const aim = useRef(new Vector3());
  const strength = useRef(0);
  const positions = useRef(new Float32Array(TRAIL * 3));
  const lineRef = useRef<Line | null>(null);
  const [pageGeo, underGeo, paperMat] = useDisposable(
    () => [createPageGeometry(), createPageGeometry(), materials.paper()],
    "notebook-paper",
  );
  const trail = useDisposable(() => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new Float32BufferAttribute(positions.current, 3),
    );
    const mat = materials.line(palette.ember, 0);
    const line = new Line(geo, mat);
    line.frustumCulled = false;
    lineRef.current = line;
    return {
      line,
      dispose() {
        geo.dispose();
        mat.dispose();
      },
    };
  }, 0);

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    // Open early in the section so the programme stays readable for most of the scroll.
    const target = animate
      ? MathUtils.smoothstep(progress.current, 0.06, 0.48)
      : 0.85;
    turn.current = MathUtils.lerp(turn.current, target, damp(4, delta));
    const open = turn.current;
    // Sit to the left of the original hello-world typography so both can be full size.
    group.current.position.set(-2.2, 0.1, -0.15);
    group.current.scale.setScalar(0.95);
    group.current.rotation.x = MathUtils.lerp(0.08, 0.02, open);
    group.current.rotation.y = 0.16;
    if (leaf.current) {
      // Spine-left page turn: starts nearly closed, settles open and readable.
      const mid = Math.sin(open * Math.PI);
      leaf.current.rotation.y = MathUtils.lerp(0.7, -0.1, open);
      leaf.current.rotation.z = mid * 0.06;
      leaf.current.position.y = mid * 0.04;
    }

    readScenePointer(track.current, sp);
    let onPage = false;
    if (animate && sp.inside && open > 0.45 && leaf.current) {
      leaf.current.updateWorldMatrix(true, false);
      leaf.current.getWorldPosition(PLANE_POINT);
      leaf.current.getWorldDirection(PLANE_NORMAL);
      if (
        pointerOnPlane(sp, state.camera, PLANE_POINT, INK_HIT, PLANE_NORMAL)
      ) {
        leaf.current.worldToLocal(INK_HIT);
        if (
          INK_HIT.x >= 0 &&
          INK_HIT.x <= PAGE_WIDTH &&
          Math.abs(INK_HIT.y) <= PAGE_HALF.y
        ) {
          onPage = true;
          INK_HIT.z = 0.012;
        }
      }
    }
    strength.current = MathUtils.lerp(
      strength.current,
      onPage ? 1 : 0,
      damp(6, delta),
    );
    if (onPage) aim.current.copy(INK_HIT);
    points[0].lerp(aim.current, damp(14, delta));
    for (let i = 1; i < TRAIL; i++) {
      points[i].lerp(points[i - 1], damp(12, delta));
    }
    const arr = positions.current;
    for (let i = 0; i < TRAIL; i++) {
      const pt = points[i];
      arr[i * 3] = pt.x;
      arr[i * 3 + 1] = pt.y;
      arr[i * 3 + 2] = pt.z;
    }
    const line = lineRef.current;
    if (line) {
      line.geometry.attributes.position.needsUpdate = true;
      const mat = line.material;
      if (!Array.isArray(mat)) mat.opacity = strength.current * 0.9;
    }
  });

  return (
    <group ref={group}>
      {/* Under-leaf: the rest of the notebook, slightly open for depth and shadow. */}
      <mesh
        geometry={underGeo}
        material={paperMat}
        rotation={[0, 0.04, 0]}
        position={[0, 0, -0.02]}
        castShadow
        receiveShadow
      />
      <mesh
        ref={leaf}
        geometry={pageGeo}
        rotation={[0, 0.72, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0}
          color="#ffffff"
        />
      </mesh>
      <primitive object={trail.line} />
    </group>
  );
}
