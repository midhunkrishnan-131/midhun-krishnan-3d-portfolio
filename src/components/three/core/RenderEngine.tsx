"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { detectCapabilities } from "@/lib/three/capabilities";
import { readDisplayMode } from "@/lib/three/displayMode";
import { attachPointer } from "@/lib/three/pointer";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { useRenderStore } from "@/stores/renderStore";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const SceneCanvas = dynamic(
  () => import("@/components/three/core/SceneCanvas"),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Mounted once in the root layout. Detects capabilities into the render store, tracks
 * reduced-motion and the pointer, and mounts the single shared WebGL canvas immediately
 * on the client when 3D is active.
 */
export function RenderEngine() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const webgl = useRenderStore((s) => s.caps?.webgl === true);
  const failed = useRenderStore((s) => s.failed);
  const displayMode = useRenderStore((s) => s.displayMode);

  useEffect(() => {
    const { setCaps, setReducedMotion, setDisplayMode } =
      useRenderStore.getState();
    setDisplayMode(readDisplayMode());
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

  const live = webgl && !failed && displayMode === "3d";
  useEffect(() => {
    const root = document.documentElement;
    if (live) root.dataset.gl = "on";
    else delete root.dataset.gl;
    window.dispatchEvent(new Event("gl-layout-change"));
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [live]);

  return mounted && live ? <SceneCanvas /> : null;
}
