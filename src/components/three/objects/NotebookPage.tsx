"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  SRGBColorSpace,
} from "three";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

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

export function NotebookPage({
  progress,
  active,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const texture = useMemo(() => paintNotebook(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  const turn = useRef(0);

  useFrame((_, delta) => {
    if (!group.current || !active.current) return;
    const target = animate
      ? MathUtils.smoothstep(progress.current, 0.08, 0.7)
      : 0.65;
    turn.current = MathUtils.lerp(turn.current, target, damp(4, delta));
    // Page turns toward the reader, then settles open and readable.
    const open = turn.current;
    group.current.rotation.y = MathUtils.lerp(0.85, -0.18, open);
    group.current.rotation.x = MathUtils.lerp(0.08, 0.02, open);
    group.current.position.set(-0.15, 0.05, -0.35);
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(open * Math.PI) * 0.04;
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
    </group>
  );
}
