"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { isGlForced } from "@/lib/three/capabilities";
import { gsap } from "@/lib/animations/gsap";
import { useRenderStore } from "@/stores/renderStore";
import { WebGLErrorBoundary } from "@/components/three/core/WebGLErrorBoundary";

/** Clears the whole drawing buffer before the per-view scissor renders (views move on scroll). */
function FrameClear() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, true);
  }, 0);
  return null;
}

/**
 * Last-resort guard: if the first rendered frames are far over budget (e.g. an undetected
 * software renderer), give up on 3D and let every slot show its static fallback.
 */
/**
 * A canvas unmount (3D → Flat) fires webglcontextlost. That is intentional, not a
 * device failure — ignoring it is what lets the user switch back to 3D.
 */
function ContextGuard() {
  const gl = useThree((s) => s.gl);
  const setFailed = useRenderStore((s) => s.setFailed);
  useEffect(() => {
    const el = gl.domElement;
    let unmounted = false;
    const onLost = (event: Event) => {
      event.preventDefault();
      if (unmounted) return;
      if (useRenderStore.getState().displayMode !== "3d") return;
      setFailed();
    };
    el.addEventListener("webglcontextlost", onLost);
    return () => {
      unmounted = true;
      el.removeEventListener("webglcontextlost", onLost);
    };
  }, [gl, setFailed]);
  return null;
}

function FrameBudgetGuard() {
  const setFailed = useRenderStore((s) => s.setFailed);
  const samples = useRef<number[]>([]);
  useFrame(() => {
    const list = samples.current;
    if (list.length > 40 || isGlForced()) return;
    list.push(performance.now());
    if (list.length === 40) {
      const avg = (list[39] - list[10]) / 29;
      if (avg > 120) setFailed();
    }
  });
  return null;
}

/**
 * Single RAF: the canvas runs with frameloop="never" and is advanced from gsap.ticker — the
 * same clock that drives Lenis and ScrollTrigger. It only renders while a scene is on screen
 * (plus one clearing frame after the last one leaves); with reduced motion it renders only
 * when the page scrolls or resizes.
 */
function TickerDriver() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    let dirty = true;
    const mark = () => {
      dirty = true;
    };
    const unsubscribe = useRenderStore.subscribe((s, prev) => {
      if (s.visible !== prev.visible || s.reducedMotion !== prev.reducedMotion)
        dirty = true;
    });
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
    const tick = (time: number) => {
      const { visible, reducedMotion } = useRenderStore.getState();
      const continuous = visible > 0 && !reducedMotion;
      if (!continuous && !dirty) return;
      dirty = false;
      advance(time);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      unsubscribe();
      window.removeEventListener("scroll", mark);
      window.removeEventListener("resize", mark);
    };
  }, [advance]);
  return null;
}

/**
 * The ONE WebGL context for the whole site. A fixed, transparent, pointer-transparent canvas
 * behind the content; every section scene is a drei <View> tunnelled in via <View.Port/> and
 * scissor-rendered into its DOM slot. Loaded lazily by RenderEngine, never server-rendered.
 */
export default function SceneCanvas() {
  const tier = useRenderStore((s) => s.caps?.tier ?? "low");
  const dpr = useRenderStore((s) => s.dpr);
  const setDpr = useRenderStore((s) => s.setDpr);
  const setFailed = useRenderStore((s) => s.setFailed);

  return (
    <Canvas
      aria-hidden="true"
      className="!pointer-events-none !fixed !inset-0 !z-0 !h-svh !w-screen"
      dpr={dpr}
      shadows={tier === "low" ? false : "percentage"}
      frameloop="never"
      gl={{
        antialias: tier !== "low",
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <WebGLErrorBoundary onError={setFailed}>
        <PerformanceMonitor
          onDecline={() => setDpr(useRenderStore.getState().dpr - 0.25)}
          onIncline={() => setDpr(useRenderStore.getState().dpr + 0.25)}
          flipflops={3}
          onFallback={() => {
            if (!isGlForced()) setFailed();
          }}
        />
        <ContextGuard />
        <FrameBudgetGuard />
        <FrameClear />
        <TickerDriver />
        <View.Port />
      </WebGLErrorBoundary>
    </Canvas>
  );
}
