import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SceneKey, SceneProps } from "@/types/three";

/** Each scene is its own chunk, fetched only when its slot approaches the viewport. */
export const sceneRegistry: Record<
  SceneKey,
  LazyExoticComponent<ComponentType<SceneProps>>
> = {
  hero: lazy(() => import("@/components/three/scenes/HeroScene")),
};
