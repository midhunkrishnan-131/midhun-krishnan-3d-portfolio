import type { SceneKey } from "@/types/three";
import { cn } from "@/lib/utils/cn";
import { SceneSlot } from "@/components/three/core/SceneSlot";
import { SceneFallback } from "@/components/sections/SceneFallback";

/**
 * A decorative 3D frame for pages that are not a homepage chapter.
 * Always has a static fallback, and respects the 3D/Flat toggle.
 */
export function PageSceneFrame({
  scene,
  slug,
  className,
}: {
  scene: Exclude<SceneKey, "hero">;
  slug?: string;
  className?: string;
}) {
  return (
    <SceneSlot
      scene={scene}
      slug={slug}
      reveal
      fallback={<SceneFallback scene={scene} />}
      className={cn(
        "aspect-[4/3] w-full origin-center sm:aspect-[16/9]",
        className,
      )}
    />
  );
}
