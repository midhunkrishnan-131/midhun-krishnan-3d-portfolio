"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { isGlForced } from "@/lib/three/capabilities";
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

/** In "demand" mode (reduced motion / nothing visible) still re-render when the page scrolls or resizes. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const onChange = () => invalidate();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, [invalidate]);
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
  const visible = useRenderStore((s) => s.visible);
  const reducedMotion = useRenderStore((s) => s.reducedMotion);
  const setDpr = useRenderStore((s) => s.setDpr);
  const setFailed = useRenderStore((s) => s.setFailed);

  const frameloop = visible > 0 && !reducedMotion ? "always" : "demand";

  return (
    <Canvas
      aria-hidden="true"
      className="!pointer-events-none !fixed !inset-0 !z-0 !h-svh !w-screen"
      dpr={dpr}
      shadows={tier === "low" ? false : "percentage"}
      frameloop={frameloop}
      gl={{
        antialias: tier !== "low",
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            setFailed();
          },
          { once: true },
        );
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
        <FrameBudgetGuard />
        <FrameClear />
        <DemandInvalidator />
        <View.Port />
      </WebGLErrorBoundary>
    </Canvas>
  );
}
