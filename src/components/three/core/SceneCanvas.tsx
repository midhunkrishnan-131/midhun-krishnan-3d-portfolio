"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
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
        />
        <FrameClear />
        <DemandInvalidator />
        <View.Port />
      </WebGLErrorBoundary>
    </Canvas>
  );
}
