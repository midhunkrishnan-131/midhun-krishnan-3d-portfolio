"use client";

import { create } from "zustand";
import type { PerfTier, RenderCapabilities } from "@/lib/three/capabilities";

interface RenderState {
  /** null until detected on the client. */
  caps: RenderCapabilities | null;
  reducedMotion: boolean;
  /** Set when the shared context is lost or the canvas throws; every slot falls back. */
  failed: boolean;
  /** Current device-pixel-ratio, adapted at runtime within caps.dpr. */
  dpr: number;
  /** Slots mounted near the viewport (their View is alive). */
  mounted: number;
  /** Slots actually intersecting the viewport (drive the frameloop). */
  visible: number;
  /** User-facing 3D / flat preference. Flat forces the static fallback. */
  displayMode: "3d" | "flat";
  setCaps: (caps: RenderCapabilities) => void;
  setReducedMotion: (value: boolean) => void;
  setFailed: () => void;
  clearFailed: () => void;
  setDpr: (dpr: number) => void;
  adjustMounted: (delta: 1 | -1) => void;
  adjustVisible: (delta: 1 | -1) => void;
  setDisplayMode: (displayMode: "3d" | "flat") => void;
}

export const useRenderStore = create<RenderState>()((set, get) => ({
  caps: null,
  reducedMotion: true,
  failed: false,
  dpr: 1,
  mounted: 0,
  visible: 0,
  displayMode: "3d",
  setCaps: (caps) =>
    set({
      caps,
      dpr: Math.min(
        Math.max(window.devicePixelRatio || 1, caps.dpr[0]),
        caps.dpr[1],
      ),
    }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setFailed: () => set({ failed: true }),
  clearFailed: () => set({ failed: false }),
  setDpr: (dpr) => {
    const caps = get().caps;
    if (!caps) return;
    set({ dpr: Math.min(Math.max(dpr, caps.dpr[0]), caps.dpr[1]) });
  },
  adjustMounted: (delta) =>
    set((s) => ({ mounted: Math.max(0, s.mounted + delta) })),
  adjustVisible: (delta) =>
    set((s) => ({ visible: Math.max(0, s.visible + delta) })),
  setDisplayMode: (displayMode) => set({ displayMode }),
}));

export const selectTier = (s: RenderState): PerfTier => s.caps?.tier ?? "low";
