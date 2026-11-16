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
  scroll: RefObject<HTMLElement | null>;
  active: RefObject<boolean>;
  onReady: () => void;
  onError: () => void;
}

/** DOM-side half of a slot: a tracked <View> whose children are tunnelled into the shared canvas. */
export default function SceneView({
  scene,
  track,
  scroll,
  active,
  onReady,
  onError,
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
            scroll={scroll}
            active={active}
            tier={tier}
            animate={!reducedMotion}
          />
          <ReadySignal onReady={onReady} />
        </Suspense>
      </WebGLErrorBoundary>
    </View>
  );
}
