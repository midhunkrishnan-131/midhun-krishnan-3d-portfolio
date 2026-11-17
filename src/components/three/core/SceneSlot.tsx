"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { useRenderStore } from "@/stores/renderStore";
import { cn } from "@/lib/utils/cn";
import type { SceneKey } from "@/types/three";

const SceneView = dynamic(() => import("@/components/three/core/SceneView"), {
  ssr: false,
  loading: () => null,
});

interface SceneSlotProps {
  scene: SceneKey;
  /** Static, server-rendered artwork shown until (and instead of) the 3D scene. */
  fallback: ReactNode;
  className?: string;
  /** How far outside the viewport the scene is mounted ahead of time. */
  preload?: string;
  /** id of the element whose scroll drives the scene (e.g. a pinned section); defaults to the slot. */
  scrollTargetId?: string;
  /** "pass": 0 entering the bottom → 1 leaving the top. "pin": 0 → 1 across a sticky section. */
  progressMode?: "pass" | "pin";
  /** Frame opens (scales up) as the section arrives. */
  reveal?: boolean;
  /** Bound project slug, used by the project-detail scene. */
  slug?: string;
}

/**
 * A decorative DOM slot for one section scene. Always renders its static fallback (so layout
 * never shifts and content never depends on WebGL); when WebGL is available and the slot is
 * near the viewport it mounts a drei View into the shared canvas, cross-fades to it, and
 * unmounts it again once it is far away to free GPU memory.
 */
export function SceneSlot({
  scene,
  fallback,
  className,
  preload = "60% 0px",
  scrollTargetId,
  progressMode = "pass",
  reveal = false,
  slug,
}: SceneSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const active = useRef(false);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const webgl = useRenderStore((s) => s.caps?.webgl === true);
  const engineFailed = useRenderStore((s) => s.failed);
  const displayMode = useRenderStore((s) => s.displayMode);
  const enabled = webgl && !failed && !engineFailed && displayMode === "3d";

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const target =
      (scrollTargetId && document.getElementById(scrollTargetId)) || el;
    const trigger = ScrollTrigger.create({
      trigger: target,
      start: progressMode === "pin" ? "top top" : "top bottom",
      end: progressMode === "pin" ? "bottom bottom" : "bottom top",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
      onRefresh: (self) => {
        progress.current = self.progress;
      },
    });
    const { adjustMounted, adjustVisible } = useRenderStore.getState();
    let isNear = false;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === isNear) return;
        isNear = entry.isIntersecting;
        adjustMounted(isNear ? 1 : -1);
        setNear(isNear);
        if (!isNear) setReady(false);
      },
      { rootMargin: preload },
    );
    const visibleObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === active.current) return;
      active.current = entry.isIntersecting;
      adjustVisible(active.current ? 1 : -1);
    });
    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      trigger.kill();
      nearObserver.disconnect();
      visibleObserver.disconnect();
      if (isNear) adjustMounted(-1);
      if (active.current) adjustVisible(-1);
      active.current = false;
    };
  }, [enabled, preload, scrollTargetId, progressMode]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const show = enabled && near;

  return (
    <div
      ref={ref}
      data-reveal={reveal ? "frame" : undefined}
      aria-hidden="true"
      className={cn("pointer-events-none relative", className)}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-(--duration-cinematic) ease-in-out-soft",
          show && ready ? "opacity-0" : "opacity-100",
        )}
      >
        {fallback}
      </div>
      {show ? (
        <SceneView
          scene={scene}
          slug={slug}
          track={ref}
          progress={progress}
          active={active}
          onReady={onReady}
          onError={onError}
        />
      ) : null}
    </div>
  );
}
