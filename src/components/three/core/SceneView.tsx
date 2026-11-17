"use client";

import { View } from "@react-three/drei";
import { Suspense, useEffect, type RefObject } from "react";
import { WebGLErrorBoundary } from "@/components/three/core/WebGLErrorBoundary";
import { sceneRegistry } from "@/components/three/scenes/registry";
import { useRenderStore } from "@/stores/renderStore";
import type { SceneKey } from "@/types/three";

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

interface SceneViewProps {
  scene: SceneKey;
  track: RefObject<HTMLElement | null>;
  progress: RefObject<number>;
  active: RefObject<boolean>;
  onReady: () => void;
  onError: () => void;
  slug?: string;
}

/** DOM-side half of a slot: a tracked <View> whose children are tunnelled into the shared canvas. */
export default function SceneView({
  scene,
  track,
  progress,
  active,
  onReady,
  onError,
  slug,
}: SceneViewProps) {
  const tier = useRenderStore((s) => s.caps?.tier ?? "low");
  const reducedMotion = useRenderStore((s) => s.reducedMotion);
  const Scene = sceneRegistry[scene];
  return (
    <View className="absolute inset-0">
      <WebGLErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <Scene
            track={track}
            progress={progress}
            active={active}
            tier={tier}
            animate={!reducedMotion}
            slug={slug}
          />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </WebGLErrorBoundary>
    </View>
  );
}
