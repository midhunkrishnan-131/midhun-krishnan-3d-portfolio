"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRenderCapabilities } from "@/hooks/useRenderCapabilities";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { WebGLErrorBoundary } from "@/components/three/core/WebGLErrorBoundary";
import { cn } from "@/lib/utils/cn";

// three.js + R3F live in this lazily loaded chunk only; never part of the server render.
const HeroScene = dynamic(() => import("@/components/three/scenes/HeroScene"), {
  ssr: false,
  loading: () => null,
});

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Decorative hero visual. Renders the static fallback (children) immediately, then — only
 * when WebGL is available, the hero is on screen and the browser is idle — loads the 3D
 * scene and cross-fades to it. Offscreen it stops rendering. Never affects layout (absolute).
 */
export function HeroVisual({ fallback }: { fallback: ReactNode }) {
  const caps = useRenderCapabilities();
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const enabled = caps?.webgl === true && !failed;

  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;
    const win = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const arm = () => {
      if (win.requestIdleCallback) {
        idleId = win.requestIdleCallback(() => setArmed(true), {
          timeout: 1500,
        });
      } else {
        timeoutId = window.setTimeout(() => setArmed(true), 300);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) arm();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [enabled]);

  const showScene = enabled && armed && caps !== null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-(--duration-cinematic) ease-in-out-soft",
          ready && showScene ? "opacity-0" : "opacity-100",
        )}
      >
        {fallback}
      </div>
      {showScene ? (
        <div
          className={cn(
            "pointer-events-auto absolute inset-0 transition-opacity duration-(--duration-cinematic) ease-in-out-soft",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <WebGLErrorBoundary onError={() => setFailed(true)}>
            <HeroScene
              dpr={caps.dpr}
              tier={caps.tier}
              reducedMotion={reducedMotion}
              active={inView}
              onReady={() => setReady(true)}
              onContextLost={() => setFailed(true)}
            />
          </WebGLErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
