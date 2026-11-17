"use client";

import { persistDisplayMode, type DisplayMode } from "@/lib/three/displayMode";
import { ScrollTrigger } from "@/lib/animations/gsap";
import { getLenis } from "@/lib/animations/lenis";
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
  const canUse3d = !capsKnown || caps.webgl;
  const canRetry = canUse3d; // context-loss sets failed; the user can still ask for 3D again

  const setMode = (next: DisplayMode) => {
    if (next === "3d" && capsKnown && !canRetry) return;
    if (next === "3d" && failed) useRenderStore.getState().clearFailed();
    // Anchor to the section in view. Raw scrollY is wrong once the hero pin
    // height changes with data-gl, and window.scrollTo is overwritten by Lenis.
    const y = window.scrollY;
    const section = document
      .elementFromPoint(window.innerWidth / 2, window.innerHeight * 0.42)
      ?.closest("section");
    const sectionId = section?.id ?? null;
    const sectionTop = section
      ? section.getBoundingClientRect().top + y
      : 0;
    const offsetInSection = section ? y - sectionTop : y;

    const restore = () => {
      let target = y;
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          target = el.getBoundingClientRect().top + window.scrollY + offsetInSection;
        }
      }
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo(0, target);
    };

    const settle = () => {
      restore();
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        restore();
        ScrollTrigger.refresh();
      });
    };

    useRenderStore.getState().setDisplayMode(next);
    persistDisplayMode(next);

    window.addEventListener("gl-layout-change", settle, { once: true });
    window.setTimeout(settle, 80);
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
        aria-disabled={capsKnown && !canRetry}
        disabled={capsKnown && !canRetry}
        title={
          capsKnown && !canRetry
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
