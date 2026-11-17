import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SceneKey, SceneProps } from "@/types/three";

/** Each scene is its own chunk, fetched only when its slot approaches the viewport. */
export const sceneRegistry: Record<
  SceneKey,
  LazyExoticComponent<ComponentType<SceneProps>>
> = {
  hero: lazy(() => import("@/components/three/scenes/HeroScene")),
  beginning: lazy(() => import("@/components/three/scenes/BeginningScene")),
  struggle: lazy(() => import("@/components/three/scenes/StruggleScene")),
  blackbox: lazy(() => import("@/components/three/scenes/BlackBoxScene")),
  bca: lazy(() => import("@/components/three/scenes/BcaScene")),
  perception: lazy(() => import("@/components/three/scenes/PerceptionScene")),
  experience: lazy(() => import("@/components/three/scenes/ExperienceScene")),
  myx: lazy(() => import("@/components/three/scenes/MyxScene")),
  projects: lazy(() => import("@/components/three/scenes/ProjectsScene")),
  catalogue: lazy(() => import("@/components/three/scenes/CatalogueScene")),
  projectDetail: lazy(
    () => import("@/components/three/scenes/ProjectDetailScene"),
  ),
  skills: lazy(() => import("@/components/three/scenes/SkillsScene")),
  future: lazy(() => import("@/components/three/scenes/FutureScene")),
  lost: lazy(() => import("@/components/three/scenes/LostScene")),
};
