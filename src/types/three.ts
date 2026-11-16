import type { RefObject } from "react";
import type { PerfTier } from "@/lib/three/capabilities";

/** Keys of every lazily loaded section scene (see components/three/scenes/registry.ts). */
export type SceneKey =
  | "hero"
  | "beginning"
  | "struggle"
  | "blackbox"
  | "bca"
  | "perception"
  | "projects"
  | "skills"
  | "future";

/** Props every section scene receives from the shared engine. */
export interface SceneProps {
  /** The DOM slot the scene is drawn into — used for scroll progress. */
  track: RefObject<HTMLElement | null>;
  /** 0..1 scroll progress of the scene's section, written by its ScrollTrigger. */
  progress: RefObject<number>;
  /** True while the slot intersects the viewport; skip per-frame work when false. */
  active: RefObject<boolean>;
  tier: PerfTier;
  animate: boolean;
}
