"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ExtrudeGeometry, Group, MathUtils, Vector3 } from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import {
  defaultProjectGlyph,
  projectGlyphs,
} from "@/components/three/objects/projectGlyphs";
import { projects } from "@/data/projects";
import {
  createScenePointer,
  readScenePointer,
  screenDistance,
} from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const COLS = 4;
const WORLD = new Vector3();
const CATALOGUE = projects.slice(0, 8);
const SLOTS = CATALOGUE.map((_, i) => ({
  x: ((i % COLS) - (COLS - 1) / 2) * 1.15,
  y: (1 - Math.floor(i / COLS)) * 0.95 - 0.2,
  z: 0,
}));

/**
 * Catalogue: project glyphs as loose leaves that snap into a quiet grid.
 * Distinct from the homepage orbit. The nearest card eases toward the pointer.
 */
export default function CatalogueScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const group = useRef<Group>(null);
  const cards = useRef<(Group | null)[]>([]);
  const sp = useMemo(() => createScenePointer(), []);
  const resources = useDisposable(() => {
    const geos = CATALOGUE.map((p) => {
      const g = new ExtrudeGeometry(
        (projectGlyphs[p.slug] ?? defaultProjectGlyph)(),
        {
          depth: 0.1,
          bevelEnabled: true,
          bevelThickness: 0.02,
          bevelSize: 0.02,
          bevelSegments: tier === "low" ? 1 : 2,
          curveSegments: tier === "low" ? 6 : 14,
        },
      );
      g.center();
      return g;
    });
    const paper = materials.paper();
    const ember = materials.ember(0.7);
    return {
      geos,
      paper,
      ember,
      dispose() {
        geos.forEach((g) => g.dispose());
        paper.dispose();
        ember.dispose();
      },
    };
  }, tier);

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.7;
    const snap = MathUtils.smoothstep(p, 0.05, 0.62);
    readScenePointer(track.current, sp);
    for (let i = 0; i < CATALOGUE.length; i++) {
      const card = cards.current[i];
      if (!card) continue;
      const slot = SLOTS[i];
      // Start scattered, settle into the grid.
      const scatterX = ((i % 3) - 1) * 1.8;
      const scatterY = (Math.floor(i / 3) - 1) * 1.4;
      let x = MathUtils.lerp(scatterX, slot.x, snap);
      let y = MathUtils.lerp(scatterY, slot.y, snap);
      let z = MathUtils.lerp(0.8, 0, snap);
      card.updateWorldMatrix(true, false);
      WORLD.setFromMatrixPosition(card.matrixWorld);
      const dist = sp.inside ? screenDistance(WORLD, state.camera, sp) : 2;
      const pull =
        animate && sp.inside ? MathUtils.smoothstep(0.7, 0.08, dist) : 0;
      x += sp.x * pull * 0.35;
      y += sp.y * pull * 0.28;
      z += pull * 0.35;
      card.position.x = MathUtils.lerp(card.position.x, x, damp(6, delta));
      card.position.y = MathUtils.lerp(card.position.y, y, damp(6, delta));
      card.position.z = MathUtils.lerp(card.position.z, z, damp(6, delta));
      card.rotation.x = MathUtils.lerp(
        card.rotation.x,
        (1 - snap) * 0.4,
        damp(5, delta),
      );
      card.rotation.y = MathUtils.lerp(
        card.rotation.y,
        (1 - snap) * ((i % 2) * 2 - 1) * 0.5,
        damp(5, delta),
      );
      card.scale.setScalar(
        MathUtils.lerp(card.scale.x || 0.6, 0.7 + pull * 0.15, damp(6, delta)),
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6.4]} fov={32} />
      <StudioLights />
      <group ref={group}>
        {CATALOGUE.map((p, i) => (
          <group
            key={p.slug}
            ref={(el) => {
              cards.current[i] = el;
            }}
          >
            <mesh
              geometry={resources.geos[i]}
              material={i === 0 ? resources.ember : resources.paper}
            />
          </group>
        ))}
      </group>
    </>
  );
}
