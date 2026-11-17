"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animations/gsap";
import { site } from "@/data/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";
import { withBasePath } from "@/lib/env";

const PROFILE = withBasePath("/images/profile.jpg");
const AVATAR = withBasePath("/images/avatar.png");
async function resolvePortraitSrc(): Promise<string | null> {
  try {
    const profile = await fetch(PROFILE, { method: "HEAD" });
    if (profile.ok) return PROFILE;
  } catch {
    /* fall through */
  }
  try {
    const avatar = await fetch(AVATAR, { method: "HEAD" });
    if (avatar.ok) return AVATAR;
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * The one portrait on the site, shown only in the footer.
 * Prefers Midhun's photograph at /images/profile.jpg; otherwise uses the
 * illustrated avatar. A short ink-punch reveal plays once on scroll-in.
 */
export function FooterPortrait() {
  const reduced = usePrefersReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<string | null | undefined>(undefined);
  const fine = useRef(false);

  useEffect(() => {
    let live = true;
    resolvePortraitSrc().then((next) => {
      if (live) setSrc(next);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    fine.current = mq.matches;
    const onChange = () => {
      fine.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = stage.current;
    if (!canvas || !root || !src || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 368;
    canvas.width = size;
    canvas.height = size;
    let raf = 0;
    let start = 0;
    const ease = gsap.parseEase("0.77,0,0.18,1");
    const run = (t: number) => {
      if (!start) start = t;
      const p = ease(Math.min(1, (t - start) / 1200));
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#0c0c0c";
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(size * 0.5, size * 0.48, p * size * 0.58, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.moveTo(size * 0.15, size * 0.7);
      ctx.quadraticCurveTo(size * 0.4, size * 0.2, size * 0.85, size * 0.55);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      if (p < 1) raf = requestAnimationFrame(run);
      else canvas.style.opacity = "0";
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          raf = requestAnimationFrame(run);
        }
      },
      { threshold: 0.45 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [src, reduced]);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !fine.current || !src) return;
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
  };

  const onLeave = () => {
    const el = stage.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg)";
  };

  const ready = Boolean(src);

  return (
    <div
      ref={stage}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "footer-portrait group relative mx-auto aspect-square w-[168px] shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.77,0,0.18,1)] sm:mx-0 sm:w-[184px]",
        !reduced && "footer-portrait-enter",
        reduced && "avatar-fade",
      )}
      style={{ transform: "perspective(700px) rotateY(0deg) rotateX(0deg)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,176,138,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(90,154,98,0.12),transparent_50%)] opacity-80"
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border border-line shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(233,231,226,0.12)]">
        {ready ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src ?? undefined}
            alt={`Portrait of ${site.name}`}
            width={200}
            height={200}
            className="h-full w-full object-cover object-center"
          />
        ) : src === null ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-800 px-6 text-center">
            <p className="font-mono text-micro tracking-[0.18em] text-paper-faint uppercase">
              Portrait
            </p>
            <p className="mt-2 text-sm text-paper-dim">To be added</p>
          </div>
        ) : (
          <div className="absolute inset-0 bg-ink-800" />
        )}
        {ready && !reduced ? (
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
          />
        ) : null}
      </div>
    </div>
  );
}
