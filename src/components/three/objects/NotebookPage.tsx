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
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const TRAIL = 22;
const PAGE_HALF = { x: 1.05, y: 1.32 };
const PLANE_POINT = new Vector3();
const PLANE_NORMAL = new Vector3();
const INK_HIT = new Vector3();

/**
 * A ruled notebook leaf with Midhun's first Python programme painted on a
 * canvas texture so the type stays sharp as the page turns.
 */
function paintNotebook(): CanvasTexture {
  const width = 1024;
  const height = 1280;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const tex = new CanvasTexture(canvas);
    return tex;
  }

  ctx.fillStyle = "#e9e7e2";
  ctx.fillRect(0, 0, width, height);
  // Fibre
  for (let i = 0; i < 1800; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.015 + Math.random() * 0.03})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1.2, 1.2);
  }
  // Red margin
  ctx.strokeStyle = "rgba(180, 40, 40, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, height);
  ctx.stroke();
  // Ruled lines
  ctx.strokeStyle = "rgba(40, 70, 140, 0.16)";
  ctx.lineWidth = 1;
  for (let y = 160; y < height - 80; y += 36) {
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.font = "italic 54px 'Instrument Serif', Georgia, serif";
  ctx.fillText("My First Python Program", 160, 110);

  ctx.font = "italic 22px Georgia, serif";
  ctx.fillStyle = "rgba(40,40,40,0.55)";
  ctx.fillText("— the first page I was proud to write", 160, 148);

  const lines: { text: string; color: string }[] = [
    { text: "# My First Python Program", color: "#5a6b4a" },
    { text: "", color: "#1a1a1a" },
    { text: "def introduce():", color: "#1a1a1a" },
    { text: '    name = "Midhun Krishnan"', color: "#1a1a1a" },
    { text: '    role = "Python & Generative AI Developer"', color: "#1a1a1a" },
    { text: "", color: "#1a1a1a" },
    { text: '    print(f"Hello, I\'m {name}")', color: "#1a1a1a" },
    { text: '    print(f"Exploring the world of {role}")', color: "#1a1a1a" },
    { text: "", color: "#1a1a1a" },
    { text: "introduce()", color: "#1a1a1a" },
  ];

  ctx.font = "26px ui-monospace, SFMono-Regular, Menlo, monospace";
  let y = 220;
  for (const line of lines) {
    drawHighlighted(ctx, line.text, 160, y);
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
  // Very small highlighter: comments, strings, keywords.
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
  const mesh = useRef<Mesh>(null);
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
    const target = animate
      ? MathUtils.smoothstep(progress.current, 0.08, 0.7)
      : 0.65;
    turn.current = MathUtils.lerp(turn.current, target, damp(4, delta));
    // Page turns toward the reader, then settles open and readable.
    const open = turn.current;
    group.current.rotation.y = MathUtils.lerp(0.22, -0.16, open);
    group.current.rotation.x = MathUtils.lerp(0.08, 0.02, open);
    group.current.position.set(-0.55, 0.28, -0.15);
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(open * Math.PI) * 0.04;
    }

    // The Decision: a single ink stroke follows the pointer across the open leaf.
    readScenePointer(track.current, sp);
    let onPage = false;
    if (animate && sp.inside && open > 0.35 && mesh.current) {
      mesh.current.updateWorldMatrix(true, false);
      mesh.current.getWorldPosition(PLANE_POINT);
      mesh.current.getWorldDirection(PLANE_NORMAL);
      if (
        pointerOnPlane(sp, state.camera, PLANE_POINT, INK_HIT, PLANE_NORMAL)
      ) {
        mesh.current.worldToLocal(INK_HIT);
        if (
          Math.abs(INK_HIT.x) <= PAGE_HALF.x &&
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
      <mesh ref={mesh} castShadow receiveShadow>
        <planeGeometry args={[2.2, 2.75]} />
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
