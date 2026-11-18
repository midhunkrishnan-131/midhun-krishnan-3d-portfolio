"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  MathUtils,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import {
  createScenePointer,
  pointerOnPlane,
  readScenePointer,
} from "@/lib/three/pointer";
import { palette } from "@/lib/three/presets";
import { damp } from "@/lib/three/progress";
import type { SceneProps } from "@/types/three";

const groundShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorld;
    void main() {
      vUv = uv;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorld = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform float uDawn;
    uniform vec3 uLine;
    uniform vec3 uGlow;
    uniform vec3 uPointer;
    uniform float uRipple;
    varying vec2 vUv;
    varying vec3 vWorld;
    void main() {
      // Ripple: concentric waves spread out from the cursor's spot on the ground.
      vec2 toP = vWorld.xz - uPointer.xz;
      float d = length(toP);
      float wave = sin(d * 5.0 - uTime * 6.0) * exp(-d * 0.55) * uRipple;
      vec2 g = vec2(vWorld.x, vWorld.z + uTime * 0.6) + normalize(toP + 1e-4) * wave * 0.22;
      vec2 cell = abs(fract(g * 0.8) - 0.5) / fwidth(g * 0.8);
      float line = 1.0 - min(min(cell.x, cell.y), 1.0);
      float far = smoothstep(2.0, -22.0, vWorld.z);
      float horizon = pow(far, 3.0);
      vec3 col = uLine * line * (1.0 - far) * 0.55 + uGlow * horizon * (0.25 + uDawn * 0.9);
      float ring = max(wave, 0.0) * line * 1.4;
      col += uGlow * ring;
      float alpha = clamp(line * (1.0 - far) * (0.8 + ring) + horizon * (0.4 + uDawn * 0.6), 0.0, 1.0);
      gl_FragColor = vec4(col, alpha);
    }
  `,
};

/** Wireframe silhouette of structures still to be built, drawn progressively. */
function skyline(): BufferGeometry {
  const pos: number[] = [];
  const box = (x: number, z: number, w: number, h: number) => {
    const c = [
      [x - w, 0, z - w],
      [x + w, 0, z - w],
      [x + w, 0, z + w],
      [x - w, 0, z + w],
      [x - w, h, z - w],
      [x + w, h, z - w],
      [x + w, h, z + w],
      [x - w, h, z + w],
    ];
    const e = [
      0, 4, 1, 5, 2, 6, 3, 7, 4, 5, 5, 6, 6, 7, 7, 4, 0, 1, 1, 2, 2, 3, 3, 0,
    ];
    for (const i of e) pos.push(...c[i]);
  };
  for (let i = 0; i < 9; i++) {
    const s = Math.sin(i * 7.31) * 0.5 + 0.5;
    box((i - 4) * 1.5 + s * 0.4, -10 - s * 6, 0.35 + s * 0.3, 0.8 + s * 2.6);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  return g;
}

const UP = new Vector3(0, 1, 0);
/** World-space point on the ground plane (the group sits at y = -0.6). */
const GROUND_POINT = new Vector3(0, -0.6, 0);
const STAR_N = 36;
const MAX_EDGES = 28;
const AIM = new Vector3();

function buildStarHomes(): Float32Array {
  const homes = new Float32Array(STAR_N * 3);
  for (let i = 0; i < STAR_N; i++) {
    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const t = s - Math.floor(s);
    const u = Math.sin(i * 91.17 + 3.1) * 43758.5453;
    const v = u - Math.floor(u);
    const w = Math.sin(i * 44.3 + 9.2) * 43758.5453;
    const q = w - Math.floor(w);
    const x = (t - 0.5) * 10;
    const y = 1.15 + v * 2.6;
    const z = -5 - q * 9;
    homes[i * 3] = x;
    homes[i * 3 + 1] = y;
    homes[i * 3 + 2] = z;
  }
  return homes;
}

const STAR_HOMES = buildStarHomes();
const STAR_ORDER = Array.from({ length: STAR_N }, (_, i) => i);

/** Future vision: an open horizon, with a constellation forming around the pointer. */
export default function FutureScene({
  track,
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const groundRef = useRef<Mesh>(null);
  const skyRef = useRef<LineSegments>(null);
  const starsRef = useRef<Points>(null);
  const linksRef = useRef<LineSegments>(null);
  const linkPos = useRef(new Float32Array(MAX_EDGES * 2 * 3));
  const res = useDisposable(() => {
    const ground = new ShaderMaterial({
      ...groundShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uDawn: { value: 0 },
        uLine: { value: new Color(palette.paperDim) },
        uGlow: { value: new Color(palette.ember) },
        uPointer: { value: new Vector3(0, 0, -100) },
        uRipple: { value: 0 },
      },
    });
    const sky = skyline();
    const starGeo = new BufferGeometry();
    starGeo.setAttribute(
      "position",
      new Float32BufferAttribute(STAR_HOMES.slice(), 3),
    );
    const linkGeo = new BufferGeometry();
    linkGeo.setAttribute(
      "position",
      new Float32BufferAttribute(linkPos.current, 3),
    );
    linkGeo.setDrawRange(0, 0);
    const starMat = materials.glowPoints(tier === "low" ? 0.06 : 0.08);
    starMat.opacity = 0;
    starMat.transparent = true;
    starMat.depthWrite = false;
    const linkMat = materials.line(palette.ember, 0);
    return {
      plane: new PlaneGeometry(40, 30, 1, 1)
        .rotateX(-Math.PI / 2)
        .translate(0, 0, -12),
      ground,
      sky,
      line: materials.line(palette.emberSoft, 0.7),
      starGeo,
      starMat,
      linkGeo,
      linkMat,
      dispose() {
        this.plane.dispose();
        this.ground.dispose();
        this.sky.dispose();
        this.line.dispose();
        this.starGeo.dispose();
        this.starMat.dispose();
        this.linkGeo.dispose();
        this.linkMat.dispose();
      },
    };
  }, tier);
  const smooth = useRef(-1);
  const sp = useMemo(() => createScenePointer(), []);
  const hit = useMemo(() => new Vector3(), []);
  const hover = useRef(0);
  const form = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = animate ? progress.current : 0.65;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(5, delta));
    const p = smooth.current;
    if (active.current) {
      readScenePointer(track.current, sp);
    }
    const ground = groundRef.current?.material as ShaderMaterial | undefined;
    if (ground) {
      ground.uniforms.uTime.value = animate ? state.clock.elapsedTime : 0;
      ground.uniforms.uDawn.value = MathUtils.smoothstep(p, 0.2, 0.7);
      const onGround =
        active.current &&
        sp.inside &&
        animate &&
        pointerOnPlane(sp, state.camera, GROUND_POINT, hit, UP) !== null &&
        hit.z < 3;
      if (onGround)
        (ground.uniforms.uPointer.value as Vector3).lerp(hit, damp(8, delta));
      hover.current = MathUtils.lerp(
        hover.current,
        onGround ? 1 : 0,
        damp(3, delta),
      );
      // A faint ground echo only — the constellation is the mouse idea here.
      ground.uniforms.uRipple.value = hover.current * 0.35;
    }

    // Constellation: stars ease toward the pointer and join with a few quiet lines.
    const dawn = MathUtils.smoothstep(p, 0.2, 0.7);
    const stars = starsRef.current;
    const links = linksRef.current;
    const starAttr = stars?.geometry.getAttribute("position");
    form.current = MathUtils.lerp(
      form.current,
      animate && sp.inside ? 1 : 0,
      damp(5, delta),
    );
    const forming = form.current;
    AIM.set(sp.x * 4.2, 1.8 + sp.y * 1.1, -7);
    if (stars && links && starAttr) {
      for (let i = 0; i < STAR_N; i++) {
        const hx = STAR_HOMES[i * 3];
        const hy = STAR_HOMES[i * 3 + 1];
        const hz = STAR_HOMES[i * 3 + 2];
        const dx = hx - AIM.x;
        const dy = hy - AIM.y;
        const dz = hz - AIM.z;
        const dist = Math.hypot(dx, dy, dz);
        const pull = forming * MathUtils.smoothstep(3.2, 0.4, dist);
        starAttr.setXYZ(
          i,
          MathUtils.lerp(
            starAttr.getX(i),
            hx - dx * pull * 0.28,
            damp(5, delta),
          ),
          MathUtils.lerp(
            starAttr.getY(i),
            hy - dy * pull * 0.28,
            damp(5, delta),
          ),
          MathUtils.lerp(
            starAttr.getZ(i),
            hz - dz * pull * 0.28,
            damp(5, delta),
          ),
        );
      }
      starAttr.needsUpdate = true;
      const starMat = stars.material;
      if (!Array.isArray(starMat)) {
        starMat.opacity = dawn * (0.35 + forming * 0.55);
      }
      let edges = 0;
      const lp = linkPos.current;
      if (forming > 0.05) {
        STAR_ORDER.sort((a, b) => {
          const da = Math.hypot(
            starAttr.getX(a) - AIM.x,
            starAttr.getY(a) - AIM.y,
            starAttr.getZ(a) - AIM.z,
          );
          const db = Math.hypot(
            starAttr.getX(b) - AIM.x,
            starAttr.getY(b) - AIM.y,
            starAttr.getZ(b) - AIM.z,
          );
          return da - db;
        });
        const addEdge = (
          ax: number,
          ay: number,
          az: number,
          bx: number,
          by: number,
          bz: number,
        ) => {
          if (edges >= MAX_EDGES) return;
          const o = edges * 6;
          lp[o] = ax;
          lp[o + 1] = ay;
          lp[o + 2] = az;
          lp[o + 3] = bx;
          lp[o + 4] = by;
          lp[o + 5] = bz;
          edges += 1;
        };
        for (let n = 0; n < 8; n++) {
          const i = STAR_ORDER[n];
          const ix = starAttr.getX(i);
          const iy = starAttr.getY(i);
          const iz = starAttr.getZ(i);
          if (n < 4) addEdge(ix, iy, iz, AIM.x, AIM.y, AIM.z);
          if (n + 1 < 8) {
            const j = STAR_ORDER[n + 1];
            addEdge(
              ix,
              iy,
              iz,
              starAttr.getX(j),
              starAttr.getY(j),
              starAttr.getZ(j),
            );
          }
        }
      }
      links.geometry.attributes.position.needsUpdate = true;
      links.geometry.setDrawRange(0, edges * 2);
      const linkMat = links.material;
      if (!Array.isArray(linkMat)) linkMat.opacity = forming * 0.7;
    }

    const sky = skyRef.current?.geometry;
    if (!sky) return;
    const total = sky.getAttribute("position").count;
    sky.setDrawRange(
      0,
      Math.floor((MathUtils.smoothstep(p, 0.25, 0.75) * total) / 2) * 2,
    );
    const cam = state.camera;
    const k = animate ? damp(3, delta) : 1;
    cam.position.x = MathUtils.lerp(cam.position.x, 0, k);
    cam.position.y = MathUtils.lerp(cam.position.y, 1.1 - p * 0.4, k);
    cam.lookAt(0, 0.4, -12);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.1, 4]} fov={45} far={60} />
      <group ref={groupRef} position={[0, -0.6, 0]}>
        <mesh ref={groundRef} geometry={res.plane} material={res.ground} />
        <lineSegments ref={skyRef} geometry={res.sky} material={res.line} />
        <points ref={starsRef} geometry={res.starGeo} material={res.starMat} />
        <lineSegments
          ref={linksRef}
          geometry={res.linkGeo}
          material={res.linkMat}
          frustumCulled={false}
        />
      </group>
    </>
  );
}
