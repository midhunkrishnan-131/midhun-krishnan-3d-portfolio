"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  MathUtils,
  type MeshStandardMaterial,
  Vector3,
} from "three";
import { StudioLights } from "@/components/three/core/StudioLights";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { projectGlyphs } from "@/components/three/objects/projectGlyphs";
import { projects } from "@/data/projects";
import {
  createScenePointer,
  readScenePointer,
  screenDistance,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import { useFocusStore } from "@/stores/focusStore";
import type { SceneProps } from "@/types/three";

const featured = projects.find((p) => p.featured) ?? projects[0];
const orbiting = projects.filter((p) => p.slug !== featured.slug);
const ORBIT = 2.15;

function orbitRing(radius: number, segments = 128): BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

/**
 * Project universe: MYX AI as the dominant central object, the other projects orbiting it.
 * Hovering or focusing a project card (see focusStore) pulls its object forward and lights it.
 */
export default function ProjectsScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const items = useRef<(Group | null)[]>([]);
  const hero = useRef<Group>(null);
  const resources = useDisposable(() => {
    const extrude = (slug: string, depth: number) => {
      const g = new ExtrudeGeometry(projectGlyphs[slug](), {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.025,
        bevelSegments: tier === "low" ? 1 : 3,
        curveSegments: tier === "low" ? 8 : 18,
      });
      g.center();
      return g;
    };
    return {
      featured: extrude(featured.slug, 0.22),
      orbiting: orbiting.map((p) => extrude(p.slug, 0.14)),
      ring: orbitRing(ORBIT),
      ink: materials.ink(tier),
      ember: materials.ember(0.6),
      line: materials.line(palette.paperDim, 0.22),
      orbitMats: orbiting.map(() => materials.ink(tier)),
      dispose() {
        this.featured.dispose();
        this.orbiting.forEach((g) => g.dispose());
        this.ring.dispose();
        this.ink.dispose();
        this.ember.dispose();
        this.line.dispose();
        this.orbitMats.forEach((m) => m.dispose());
      },
    };
  }, tier);
  const smooth = useRef(-1);
  const sp = useMemo(() => createScenePointer(), []);
  const world = useMemo(() => new Vector3(), []);
  const hover = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || !active.current) return;
    const target = animate ? progress.current : 0.5;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const t = animate ? state.clock.elapsedTime : 0;
    const focus = useFocusStore.getState().project;
    const k = animate ? damp(5, delta) : 1;
    // Mouse: the whole orbit parallaxes with the cursor; the glyph under it is pulled forward.
    readScenePointer(track.current, sp);
    hover.current = MathUtils.lerp(
      hover.current,
      sp.inside && animate ? 1 : 0,
      damp(4, delta),
    );
    const h = hover.current;
    let picked = -1;
    if (h > 0.5) {
      let best = 0.32;
      items.current.forEach((item, i) => {
        if (!item) return;
        const d = screenDistance(
          item.getWorldPosition(world),
          state.camera,
          sp,
        );
        if (d < best) {
          best = d;
          picked = i;
        }
      });
    }

    if (hero.current) {
      const on = focus === featured.slug ? 1 : 0;
      hero.current.rotation.y = MathUtils.lerp(
        hero.current.rotation.y,
        Math.sin(t * 0.4) * 0.35 + sp.x * h * 0.3,
        k,
      );
      hero.current.rotation.x = MathUtils.lerp(
        hero.current.rotation.x,
        -sp.y * h * 0.2,
        k,
      );
      const sc = MathUtils.lerp(hero.current.scale.x, 1.45 + on * 0.12, k);
      hero.current.scale.setScalar(sc);
    }
    const spin = smooth.current * Math.PI * 1.2 + t * 0.08;
    items.current.forEach((item, i) => {
      if (!item) return;
      const a = spin + (i / orbiting.length) * Math.PI * 2;
      const on = focus === orbiting[i].slug || picked === i ? 1 : 0;
      const pull = MathUtils.lerp(item.userData.pull ?? 0, on, k);
      item.userData.pull = pull;
      item.position.set(
        Math.cos(a) * ORBIT * (1 - pull * 0.15),
        Math.sin(a * 2 + i) * 0.12 + pull * 0.15,
        Math.sin(a) * ORBIT + pull * 1.4,
      );
      item.rotation.y = MathUtils.lerp(
        item.rotation.y,
        -a + Math.PI / 2 + on * 0.6,
        k,
      );
      const sc = MathUtils.lerp(item.scale.x, 0.55 + on * 0.35, k);
      item.scale.setScalar(sc);
      const mat = resources.orbitMats[i] as MeshStandardMaterial;
      mat.emissive.set(palette.ember);
      mat.emissiveIntensity = MathUtils.lerp(
        mat.emissiveIntensity,
        on * 0.9,
        k,
      );
    });
    group.rotation.x = MathUtils.lerp(
      group.rotation.x,
      0.32 - sp.y * h * 0.12,
      k,
    );
    group.rotation.y = MathUtils.lerp(group.rotation.y, sp.x * h * 0.25, k);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 7.4]} fov={38} />
      <StudioLights rim={1.3} />
      <group ref={groupRef}>
        <group ref={hero}>
          <mesh geometry={resources.featured} material={resources.ink} />
          <mesh
            geometry={resources.featured}
            material={resources.ember}
            scale={[0.4, 0.4, 1.3]}
          />
        </group>
        <lineSegments geometry={resources.ring} material={resources.line} />
        {orbiting.map((p, i) => (
          <group
            key={p.slug}
            ref={(g) => {
              items.current[i] = g;
            }}
          >
            <mesh
              geometry={resources.orbiting[i]}
              material={resources.orbitMats[i]}
            />
          </group>
        ))}
      </group>
    </>
  );
}
