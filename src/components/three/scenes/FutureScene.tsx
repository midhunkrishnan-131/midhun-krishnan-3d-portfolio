"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  MathUtils,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { useDisposable } from "@/components/three/core/useDisposable";
import { materials } from "@/components/three/materials/presets";
import { pointer } from "@/lib/three/pointer";
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
    varying vec2 vUv;
    varying vec3 vWorld;
    void main() {
      vec2 g = vec2(vWorld.x, vWorld.z + uTime * 0.6);
      vec2 cell = abs(fract(g * 0.8) - 0.5) / fwidth(g * 0.8);
      float line = 1.0 - min(min(cell.x, cell.y), 1.0);
      float far = smoothstep(2.0, -22.0, vWorld.z);
      float horizon = pow(far, 3.0);
      vec3 col = uLine * line * (1.0 - far) * 0.55 + uGlow * horizon * (0.25 + uDawn * 0.9);
      float alpha = clamp(line * (1.0 - far) * 0.8 + horizon * (0.4 + uDawn * 0.6), 0.0, 1.0);
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

/** Future vision: an open horizon, with the outlines of what's next being drawn into it. */
export default function FutureScene({
  progress,
  active,
  tier,
  animate,
}: SceneProps) {
  const groupRef = useRef<Group>(null);
  const groundRef = useRef<Mesh>(null);
  const skyRef = useRef<LineSegments>(null);
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
      },
    });
    const sky = skyline();
    return {
      plane: new PlaneGeometry(40, 30, 1, 1)
        .rotateX(-Math.PI / 2)
        .translate(0, 0, -12),
      ground,
      sky,
      line: materials.line(palette.emberSoft, 0.7),
      dispose() {
        this.plane.dispose();
        this.ground.dispose();
        this.sky.dispose();
        this.line.dispose();
      },
    };
  }, tier);
  const smooth = useRef(-1);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || !active.current) return;
    const target = animate ? progress.current : 0.65;
    smooth.current =
      smooth.current < 0 || !animate
        ? target
        : MathUtils.lerp(smooth.current, target, damp(4, delta));
    const p = smooth.current;
    const ground = groundRef.current?.material as ShaderMaterial | undefined;
    if (ground) {
      ground.uniforms.uTime.value = animate ? state.clock.elapsedTime : 0;
      ground.uniforms.uDawn.value = MathUtils.smoothstep(p, 0.2, 0.7);
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
    cam.position.x = MathUtils.lerp(cam.position.x, pointer.x * 0.4, k);
    cam.position.y = MathUtils.lerp(
      cam.position.y,
      1.1 - p * 0.4 + pointer.y * 0.15,
      k,
    );
    cam.lookAt(0, 0.4, -12);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.1, 4]} fov={45} far={60} />
      <group ref={groupRef} position={[0, -0.6, 0]}>
        <mesh ref={groundRef} geometry={res.plane} material={res.ground} />
        <lineSegments ref={skyRef} geometry={res.sky} material={res.line} />
      </group>
    </>
  );
}
