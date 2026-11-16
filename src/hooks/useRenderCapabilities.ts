"use client";

import { useSyncExternalStore } from "react";
import {
  detectCapabilities,
  type RenderCapabilities,
} from "@/lib/three/capabilities";

let cached: RenderCapabilities | null = null;

const subscribe = () => () => {};
const getSnapshot = (): RenderCapabilities => {
  cached ??= detectCapabilities();
  return cached;
};
const getServerSnapshot = (): RenderCapabilities | null => null;

/** Returns null during SSR / hydration, then the detected capabilities on the client. */
export function useRenderCapabilities(): RenderCapabilities | null {
  return useSyncExternalStore<RenderCapabilities | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
