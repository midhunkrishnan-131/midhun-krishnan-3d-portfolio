"use client";

import { useEffect, useRef } from "react";
import { gsap, STORY_EASE } from "@/lib/animations/gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useRenderStore } from "@/stores/renderStore";
import { cn } from "@/lib/utils/cn";
import { withBasePath } from "@/lib/env";

const SIZE = 200;
const FRAME = 360;
const TAGS = ["python", "gen ai", "security"] as const;
const CHARSET = "01<>/\\#$_+*:=[]{}#";
const GLYPH_COUNT = 56;
const REVEAL_MS = 1650;
const EASE = gsap.parseEase(STORY_EASE);

/**
 * Midhun's illustrated avatar, shown unaltered at native 200×200 so it stays
 * sharp. On first arrival it is written into being: monospace glyphs scramble,
 * ink strokes open a mask, and the portrait remains an <img> underneath.
 * A green and orange rim then follows a fine pointer; tags orbit at a depth
 * around it. About's existing mouse behaviour is left alone.
 */
type Glyph = { x: number; y: number; seed: number };

const GLYPHS: Glyph[] = Array.from({ length: GLYPH_COUNT }, (_, i) => {
  const t = (i + 0.5) / GLYPH_COUNT;
  const a = t * Math.PI * 2 * 3.2 + i * 0.35;
  const r = Math.sqrt((i + 1) / GLYPH_COUNT) * (SIZE / 2 - 14);
  return {
    x: SIZE / 2 + Math.cos(a) * r,
    y: SIZE / 2 + Math.sin(a) * r,
    seed: i * 17,
  };
});

const STROKES: {
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  ex: number;
  ey: number;
}[] = [
  { sx: 18, sy: 86, cx: 70, cy: 28, ex: 182, ey: 72 },
  { sx: 28, sy: 150, cx: 110, cy: 96, ex: 176, ey: 44 },
  { sx: 22, sy: 48, cx: 90, cy: 170, ex: 178, ey: 128 },
  { sx: 48, sy: 186, cx: 130, cy: 140, ex: 168, ey: 168 },
];

function finePointer(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

export function AvatarPortrait({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const flat = useRenderStore((s) => s.displayMode) === "flat";

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let start = 0;
    let playing = false;
    let finished = reduced;
    const light = { x: 0.3, y: 0.3 };
    const pointer = { x: 0.3, y: 0.3, fine: false };
    const chars = GLYPHS.map((g) => CHARSET[g.seed % CHARSET.length] ?? "0");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (!pointer.fine) return;
      const box = root.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width - 0.5;
      pointer.y = (event.clientY - box.top) / box.height - 0.5;
    };
    const syncFine = () => {
      pointer.fine = !reduced && finePointer();
    };
    syncFine();
    const fineQuery = window.matchMedia("(pointer: fine)");
    fineQuery.addEventListener("change", syncFine);
    if (!reduced)
      window.addEventListener("pointermove", onMove, { passive: true });

    // Draw strokes with dash offset so they write on, then punch through.
    const draw = (p: number) => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#0c0c0c";
      ctx.fillRect(0, 0, SIZE, SIZE);

      const glyphFade = 1 - EASE(Math.min(Math.max((p - 0.38) / 0.55, 0), 1));
      if (glyphFade > 0.02) {
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const tick = Math.floor(p * 48);
        for (let i = 0; i < GLYPHS.length; i++) {
          const g = GLYPHS[i];
          const scramble = p < 0.7 && (g.seed + tick) % 4 !== 0;
          const ch = scramble
            ? CHARSET[(g.seed + tick + i) % CHARSET.length]
            : chars[i];
          ctx.fillStyle = `rgba(233,231,226,${(0.32 + (i % 3) * 0.18) * glyphFade})`;
          ctx.fillText(ch, g.x, g.y);
        }
      }

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      for (let i = 0; i < STROKES.length; i++) {
        const s = STROKES[i];
        const local = EASE(
          Math.min(Math.max((p - 0.12 - i * 0.1) / 0.5, 0), 1),
        );
        if (local <= 0.001) continue;
        ctx.save();
        ctx.lineWidth = 52 - i * 4;
        ctx.beginPath();
        ctx.moveTo(s.sx, s.sy);
        ctx.quadraticCurveTo(s.cx, s.cy, s.ex, s.ey);
        const len = 280;
        ctx.setLineDash([len * local, len]);
        ctx.stroke();
        ctx.restore();
      }
      // Soft radial open at the end so no ink crumbs remain.
      if (p > 0.7) {
        const hole = EASE((p - 0.7) / 0.3) * (SIZE * 0.72);
        ctx.beginPath();
        ctx.arc(SIZE / 2, SIZE / 2, hole, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
      }
      ctx.restore();
    };

    const hideOverlay = () => {
      canvas.style.opacity = "0";
      canvas.style.pointerEvents = "none";
    };

    if (reduced) {
      hideOverlay();
      finished = true;
    }

    const tick = () => {
      const now = performance.now();
      if (playing && !finished) {
        if (!start) start = now;
        const p = Math.min((now - start) / REVEAL_MS, 1);
        draw(p);
        if (p >= 1) {
          finished = true;
          hideOverlay();
        }
      }

      const stage = stageRef.current;
      if (!stage) return;

      const track = pointer.fine ? 1 : 0;
      light.x += (pointer.x - light.x) * 0.08;
      light.y += (pointer.y - light.y) * 0.08;
      const lx = 50 + light.x * track * 42;
      const ly = 50 + light.y * track * 42;
      if (lightRef.current) {
        lightRef.current.style.background = `radial-gradient(circle at ${lx}% ${ly}%, rgba(80,160,90,0.42), transparent 52%), radial-gradient(circle at ${100 - lx}% ${100 - ly}%, rgba(255,122,69,0.34), transparent 48%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) translate(${(light.x * track * 6).toFixed(2)}px, ${(light.y * track * 6).toFixed(2)}px)`;
      }
      if (pointer.fine && !flat && stage) {
        stage.style.setProperty("--tilt-x", `${(-light.y * 8).toFixed(2)}deg`);
        stage.style.setProperty("--tilt-y", `${(light.x * 10).toFixed(2)}deg`);
      } else if (stage) {
        stage.style.setProperty("--tilt-x", "0deg");
        stage.style.setProperty("--tilt-y", "0deg");
      }

      const t = now / 1000;
      const depth = flat || reduced ? 0 : 1;
      tagRefs.current.forEach((tag, i) => {
        if (!tag) return;
        const a = t * 0.35 + (i / TAGS.length) * Math.PI * 2;
        const rx = 156;
        const ry = flat ? 148 : 136;
        const x = Math.cos(a) * rx;
        const y = Math.sin(a) * ry;
        const z = depth * Math.sin(a) * 36;
        tag.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
        tag.style.opacity = String(0.62 + depth * 0.2 * Math.sin(a));
        tag.style.zIndex = z >= 0 ? "3" : "0";
      });
    };

    const begin = () => {
      if (playing || reduced) return;
      playing = true;
      start = 0;
      finished = false;
      canvas.style.opacity = "1";
    };

    const onReplay = () => {
      if (reduced) return;
      playing = true;
      start = 0;
      finished = false;
      canvas.style.opacity = "1";
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) begin();
      },
      { threshold: 0.45 },
    );
    io.observe(root);
    root.addEventListener("avatar-replay", onReplay);

    if (!reduced) gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      root.removeEventListener("avatar-replay", onReplay);
      window.removeEventListener("pointermove", onMove);
      fineQuery.removeEventListener("change", syncFine);
    };
  }, [reduced, flat]);

  return (
    <div
      ref={rootRef}
      data-avatar="portrait"
      className={cn("relative mx-auto", className)}
      style={{ width: FRAME, height: FRAME }}
    >
      <div
        ref={stageRef}
        className="absolute inset-0"
        style={{
          perspective: flat || reduced ? undefined : 700,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={lightRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(80,160,90,0.32), transparent 55%), radial-gradient(circle at 80% 70%, rgba(255,122,69,0.22), transparent 50%)",
          }}
        />
        <div
          ref={ringRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[226px] w-[226px] rounded-full"
          style={{
            boxShadow:
              "0 0 0 1px rgba(233,231,226,0.14), 0 0 28px rgba(80,160,90,0.22), 0 0 36px rgba(255,122,69,0.12)",
            transform: "translate(-50%, -50%)",
            transition: reduced
              ? undefined
              : "transform 0.45s cubic-bezier(0.77, 0, 0.18, 1)",
          }}
        />

        {!reduced
          ? TAGS.map((label, i) => (
              <span
                key={label}
                ref={(el) => {
                  tagRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-micro tracking-wider text-paper-faint uppercase"
                style={{ willChange: "transform" }}
              >
                {label}
              </span>
            ))
          : null}

        <div
          className={cn(
            "absolute top-1/2 left-1/2 overflow-hidden rounded-full shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
            !reduced && "avatar-float",
            reduced && "avatar-fade",
          )}
          style={{
            width: SIZE,
            height: SIZE,
            marginLeft: -SIZE / 2,
            marginTop: -SIZE / 2,
            transform:
              "rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))",
            transformStyle: "preserve-3d",
            transition: reduced
              ? "opacity 0.6s ease"
              : "transform 0.5s cubic-bezier(0.77, 0, 0.18, 1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/images/avatar.png")}
            alt="Illustrated portrait of Midhun Krishnan"
            width={200}
            height={200}
            decoding="async"
            className="h-[200px] w-[200px] object-cover"
          />
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              width: SIZE,
              height: SIZE,
              opacity: reduced ? 0 : 1,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
