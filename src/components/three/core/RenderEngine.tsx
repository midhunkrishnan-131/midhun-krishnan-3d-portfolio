"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectCapabilities } from "@/lib/three/capabilities";
import { attachPointer } from "@/lib/three/pointer";
import { useRenderStore } from "@/stores/renderStore";

const SceneCanvas = dynamic(
  () => import("@/components/three/core/SceneCanvas"),
  {
    ssr: false,
    loading: () => null,
  },
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Mounted once in the root layout. Detects capabilities into the render store, tracks
 * reduced-motion and the pointer, and — only once a scene slot is near the viewport and the
 * browser is idle — loads the single shared canvas. Renders nothing on the server.
 */
export function RenderEngine() {
  const webgl = useRenderStore((s) => s.caps?.webgl === true);
  const failed = useRenderStore((s) => s.failed);
  const wanted = useRenderStore((s) => s.mounted > 0);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const { setCaps, setReducedMotion } = useRenderStore.getState();
    setCaps(detectCapabilities());
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    const detach = attachPointer();
    return () => {
      query.removeEventListener("change", onChange);
      detach();
    };
  }, []);

  useEffect(() => {
    if (!webgl || !wanted || idle) return;
    const win = window as IdleWindow;
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setIdle(true), {
        timeout: 1500,
      });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setIdle(true), 300);
    return () => window.clearTimeout(id);
  }, [webgl, wanted, idle]);

  const reducedMotion = useRenderStore((s) => s.reducedMotion);
  const live = webgl && !failed && !reducedMotion;
  useEffect(() => {
    const root = document.documentElement;
    if (live) root.dataset.gl = "on";
    else delete root.dataset.gl;
    window.dispatchEvent(new Event("gl-layout-change"));
  }, [live]);

  return webgl && idle && !failed ? <SceneCanvas /> : null;
}
