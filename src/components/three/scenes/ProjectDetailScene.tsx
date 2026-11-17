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
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const HIT = new Vector3();
const ORIGIN = new Vector3();

type Motif =
  | "shield"
  | "reassemble"
  | "caret"
  | "connect"
  | "scan"
  | "bars"
  | "drift"
  | "bubble"
  | "brackets";

function motifOf(slug: string): Motif {
  switch (slug) {
    case "myx-ai":
      return "shield";
    case "codedoctor-ai":
      return "reassemble";
    case "devassist":
      return "caret";
    case "production-grade-api-client":
      return "connect";
    case "docuscan-ocr":
      return "scan";
    case "python-data-cleaning":
      return "bars";
    case "weather-application":
      return "drift";
    case "ai-assistant":
      return "bubble";
    case "frontend-development-collection":
      return "brackets";
    default:
      return "reassemble";
  }
}

/**
 * One project, one motion. The glyph is shared with the catalogue, but the
 * way it meets the pointer is unique to the work.
 */
export default function ProjectDetailScene({
  track,
  progress,
  active,
  tier,
  animate,
  slug = "myx-ai",
}: SceneProps) {
  const group = useRef<Group>(null);
  const satellite = useRef<Group>(null);
  const sp = useMemo(() => createScenePointer(), []);
  const motif = motifOf(slug);
  const resources = useDisposable(() => {
    const geo = new ExtrudeGeometry(
      (projectGlyphs[slug] ?? defaultProjectGlyph)(),
      {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.025,
        bevelSegments: tier === "low" ? 1 : 3,
        curveSegments: tier === "low" ? 8 : 16,
      },
    );
    geo.center();
    const paper = materials.paper();
    const ember = materials.ember(0.7);
    const emberSoft = materials.ember(0.35);
    return {
      geo,
      paper,
      ember,
      emberSoft,
      dispose() {
        geo.dispose();
        paper.dispose();
        ember.dispose();
        emberSoft.dispose();
      },
    };
  }, `${tier}-${slug}`);

  useFrame((state, delta) => {
    if (!group.current || !active.current) return;
    const p = animate ? progress.current : 0.6;
    const open = MathUtils.smoothstep(p, 0.04, 0.5);
    group.current.scale.setScalar(MathUtils.lerp(0.65, 1.15, open));
    readScenePointer(track.current, sp);
    const hit =
      animate &&
      sp.inside &&
      pointerOnPlane(sp, state.camera, ORIGIN, HIT) !== null;
    const x = hit ? MathUtils.clamp(HIT.x, -1.6, 1.6) : 0;
    const y = hit ? MathUtils.clamp(HIT.y, -1.2, 1.2) : 0;
    const k = damp(5, delta);
    const g = group.current;

    switch (motif) {
      case "shield":
        g.rotation.y = MathUtils.lerp(g.rotation.y, x * 0.35, k);
        g.rotation.x = MathUtils.lerp(g.rotation.x, -y * 0.25, k);
        break;
      case "reassemble":
        g.rotation.z = MathUtils.lerp(g.rotation.z, hit ? 0 : 0.25, k);
        g.position.x = MathUtils.lerp(g.position.x, hit ? x * 0.15 : 0.2, k);
        g.position.y = MathUtils.lerp(g.position.y, hit ? y * 0.15 : -0.1, k);
        break;
      case "caret":
        g.position.x = MathUtils.lerp(g.position.x, x * 0.55, k);
        g.position.y = MathUtils.lerp(g.position.y, y * 0.4, k);
        g.rotation.z = MathUtils.lerp(g.rotation.z, -x * 0.15, k);
        break;
      case "connect":
        g.rotation.y = MathUtils.lerp(g.rotation.y, x * 0.6, k);
        g.scale.setScalar(
          MathUtils.lerp(g.scale.x, 1.15 + (hit ? 0.08 : 0), k),
        );
        break;
      case "scan":
        g.position.y = MathUtils.lerp(g.position.y, y * 0.5, k);
        g.rotation.x = MathUtils.lerp(g.rotation.x, -0.2 + y * 0.1, k);
        break;
      case "bars":
        g.scale.set(
          MathUtils.lerp(g.scale.x, 1.15, k),
          MathUtils.lerp(g.scale.y, 1.15 + Math.abs(y) * 0.25, k),
          MathUtils.lerp(g.scale.z, 1.15, k),
        );
        break;
      case "drift":
        g.position.x = MathUtils.lerp(g.position.x, x * 0.7, damp(2.2, delta));
        g.position.y = MathUtils.lerp(g.position.y, y * 0.45, damp(2.2, delta));
        g.rotation.z = MathUtils.lerp(g.rotation.z, -x * 0.2, damp(2, delta));
        break;
      case "bubble":
        g.position.x = MathUtils.lerp(g.position.x, x * 0.35, damp(3, delta));
        g.position.y = MathUtils.lerp(g.position.y, y * 0.35, damp(3, delta));
        break;
      case "brackets":
        g.rotation.y = MathUtils.lerp(g.rotation.y, hit ? 0.55 : 0.15, k);
        g.scale.setScalar(MathUtils.lerp(g.scale.x, hit ? 1.22 : 1.1, k));
        break;
    }

    if (satellite.current) {
      const t = state.clock.elapsedTime;
      satellite.current.visible = motif === "connect" || motif === "reassemble";
      satellite.current.position.set(
        Math.cos(t * 0.7) * 1.3,
        Math.sin(t * 0.9) * 0.7,
        0.2,
      );
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.05, 6]} fov={32} />
      <StudioLights />
      <group>
        <group ref={group}>
          <mesh
            geometry={resources.geo}
            material={slug === "myx-ai" ? resources.ember : resources.paper}
          />
        </group>
        <group ref={satellite}>
          <mesh material={resources.emberSoft}>
            <sphereGeometry args={[0.06, 12, 12]} />
          </mesh>
        </group>
      </group>
    </>
  );
}
