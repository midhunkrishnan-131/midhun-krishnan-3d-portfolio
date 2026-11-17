"use client";

import { persistDisplayMode, type DisplayMode } from "@/lib/three/displayMode";
import { useRenderStore } from "@/stores/renderStore";
import { cn } from "@/lib/utils/cn";

/**
 * Persisted 3D / Flat switch. Flat turns WebGL off and leaves the static
 * fallbacks in place. The control is a labelled toggle so it is usable
 * with a keyboard and with a screen reader.
 */
export function DisplayModeToggle() {
  const mode = useRenderStore((s) => s.displayMode);
  const caps = useRenderStore((s) => s.caps);
  const failed = useRenderStore((s) => s.failed);
  const capsKnown = caps !== null;
  const canUse3d = !failed && (!capsKnown || caps.webgl);

  const setMode = (next: DisplayMode) => {
    if (next === "3d" && capsKnown && !canUse3d) return;
    const y = window.scrollY;
    useRenderStore.getState().setDisplayMode(next);
    persistDisplayMode(next);
    // Hero height changes with data-gl; keep the reader at the same place.
    requestAnimationFrame(() => {
      window.scrollTo(0, y);
      requestAnimationFrame(() => window.scrollTo(0, y));
    });
  };

  return (
    <div
      role="group"
      aria-label="Display mode"
      className="pointer-events-auto fixed right-[calc(var(--gutter)+0.25rem)] bottom-[calc(var(--gutter)+0.25rem)] z-[60] flex items-center gap-2 border border-line bg-ink-950/90 px-3 py-2 font-mono text-micro font-medium text-paper-faint uppercase backdrop-blur-sm"
    >
      <button
        type="button"
        aria-pressed={mode === "3d"}
        aria-disabled={capsKnown && !canUse3d}
        disabled={capsKnown && !canUse3d}
        title={
          capsKnown && !canUse3d
            ? "3D is unavailable on this device, so the static artwork stays on"
            : "Show the 3D scenes"
        }
        onClick={() => setMode("3d")}
        className={cn(
          "transition-colors duration-(--duration-fast) ease-cinematic hover:text-paper",
          mode === "3d" && "text-paper",
        )}
      >
        3D
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        aria-pressed={mode === "flat"}
        title="Show the static artwork only"
        onClick={() => setMode("flat")}
        className={cn(
          "transition-colors duration-(--duration-fast) ease-cinematic hover:text-paper",
          mode === "flat" && "text-paper",
        )}
      >
        Flat
      </button>
    </div>
  );
}
