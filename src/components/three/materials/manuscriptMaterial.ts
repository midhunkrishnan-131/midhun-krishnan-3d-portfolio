import {
  Color,
  MeshDepthMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RGBADepthPacking,
  type WebGLProgramParametersWithUniforms,
} from "three";
import type { PerfTier } from "@/lib/three/capabilities";
import { palette } from "@/lib/three/presets";
import {
  PAGE_HEIGHT,
  PAGE_THICKNESS,
  PAGE_WIDTH,
} from "@/components/three/objects/pageGeometry";

/**
 * Real-lit, shadow-casting paper. A standard PBR material (physical with sheen on capable
 * devices) whose vertex stage is patched to bend each thick sheet around its spine with a
 * per-instance curvature, and whose fragment stage adds paper fibre, ruled lines, live
 * handwriting, gutter/stack occlusion and warm edge highlights. A matching depth material
 * runs the same deformation so the shadow map sees the curled pages.
 */

const deformChunk = /* glsl */ `
  attribute vec3 aPage;
  attribute vec3 aEdge;
  attribute float aCurl;
  attribute float aSeed;
  attribute float aOcc;
  uniform float uTime;
  uniform float uFlutter;
  varying vec2 vPageUv;
  varying float vFace;
  varying float vSeed;
  varying float vOcc;

  void deformPage(out vec3 outPos, out vec3 outNormal) {
    float s = aPage.x;
    float y = aPage.y;
    float side = aPage.z;
    // Curvature grows towards the free edge so pages droop and curl like real paper.
    float k = aCurl + uFlutter * sin(uTime * 0.9 + aSeed * 6.2831 + y * 1.3) * 0.08;
    float ang = k * s;
    vec3 c;
    vec3 T;
    vec3 N;
    if (abs(k) < 1e-4) {
      c = vec3(s, y, 0.0);
      T = vec3(1.0, 0.0, 0.0);
      N = vec3(0.0, 0.0, 1.0);
    } else {
      c = vec3(sin(ang) / k, y, (1.0 - cos(ang)) / k);
      T = vec3(cos(ang), 0.0, sin(ang));
      N = vec3(-sin(ang), 0.0, cos(ang));
    }
    // A soft cross-wise wave so the sheet never looks like a rigid card.
    float wave = sin(y / ${PAGE_HEIGHT.toFixed(2)} * 3.14159 + aSeed * 4.0) * 0.03 * (s / ${PAGE_WIDTH.toFixed(2)});
    c += N * wave;
    outPos = c + N * side * ${(PAGE_THICKNESS * 0.5).toFixed(4)};
    outNormal = aEdge.z > 0.5 ? normalize(aEdge.x * T + vec3(0.0, aEdge.y, 0.0)) : N * sign(side);
    vPageUv = vec2(s / ${PAGE_WIDTH.toFixed(2)}, y / ${PAGE_HEIGHT.toFixed(2)} + 0.5);
    vFace = aEdge.z > 0.5 ? 0.0 : side;
    vSeed = aSeed;
    vOcc = aOcc;
  }
`;

const fragmentHeader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uInk;
  uniform vec3 uEmber;
  varying vec2 vPageUv;
  varying float vFace;
  varying float vSeed;
  varying float vOcc;
  float hash1(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
  }
  float gInkTip = 0.0;
`;

const paperColorChunk = /* glsl */ `
  #include <color_fragment>
  {
    vec2 puv = vPageUv;
    float fibre = vnoise(puv * vec2(220.0, 300.0)) * 0.6 + vnoise(puv * vec2(26.0, 34.0)) * 0.4;
    vec3 col = diffuseColor.rgb * (0.9 + 0.1 * fibre);
    float isFront = step(0.5, vFace);
    float isBack = step(0.5, -vFace);
    float isEdge = 1.0 - isFront - isBack;

    // Ruled lines + handwriting that keeps being written (front), faint show-through (back).
    float rows = 20.0;
    float ry = fract(puv.y * rows);
    float row = floor(puv.y * rows);
    float inText = step(0.12, puv.x) * step(puv.x, 0.9) * step(0.08, puv.y) * step(puv.y, 0.9);
    float rule = (1.0 - smoothstep(0.0, 0.035, abs(ry - 0.12))) * inText;
    float rowFromTop = rows - 1.0 - row;
    float progress = fract(uTime * 0.025 + vSeed) * rows * 0.75;
    float len = 0.3 + 0.55 * hash1(row * 1.7 + vSeed * 31.0);
    float rowFill = clamp(progress - rowFromTop, 0.0, 1.0);
    float strokeEnd = 0.12 + len * 0.78 * rowFill;
    float wobble = 0.09 * sin(puv.x * 90.0 + row * 3.1 + vSeed * 20.0) * sin(puv.x * 23.0 + row);
    float band = 1.0 - smoothstep(0.05, 0.11, abs(ry - 0.45 - wobble));
    float written = step(0.001, rowFill);
    float stroke = band * inText * step(puv.x, strokeEnd) * written;
    gInkTip = band * inText * (1.0 - smoothstep(0.0, 0.03, abs(puv.x - strokeEnd))) * written * step(rowFill, 0.999) * isFront;
    float inkAmount = isFront * (rule * 0.3 + stroke * 0.82) + isBack * (stroke * 0.12 + rule * 0.06);
    col = mix(col, uInk, inkAmount);

    // Contact / ambient occlusion: gutter darkening at the spine plus stack occlusion.
    float gutter = smoothstep(0.0, 0.16, puv.x);
    float border = smoothstep(0.0, 0.02, puv.y) * smoothstep(0.0, 0.02, 1.0 - puv.y) * smoothstep(0.0, 0.015, 1.0 - puv.x);
    col *= mix(0.62, 1.0, gutter) * mix(0.8, 1.0, border) * (1.0 - vOcc * 0.5);
    // Cut edges read slightly warmer and darker than the faces.
    col = mix(col, col * vec3(0.86, 0.78, 0.7), isEdge);
    diffuseColor.rgb = col;
  }
`;

const emissiveChunk = /* glsl */ `
  #include <emissivemap_fragment>
  {
    vec3 viewDir = normalize(vViewPosition);
    float fres = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    float isEdge = 1.0 - step(0.5, abs(vFace));
    totalEmissiveRadiance += uEmber * (gInkTip * 1.4 + fres * 0.06 + isEdge * 0.12);
  }
`;

const roughnessChunk = /* glsl */ `
  #include <roughnessmap_fragment>
  roughnessFactor = clamp(roughnessFactor + (vnoise(vPageUv * 140.0) - 0.5) * 0.12, 0.0, 1.0);
`;

export interface PaperUniforms {
  uTime: { value: number };
  uFlutter: { value: number };
  uInk: { value: Color };
  uEmber: { value: Color };
}

export interface PaperMaterials {
  material: MeshStandardMaterial;
  depthMaterial: MeshDepthMaterial;
  uniforms: PaperUniforms;
  dispose: () => void;
}

function patchVertex(
  shader: WebGLProgramParametersWithUniforms,
  withNormal: boolean,
) {
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `#include <common>\n${deformChunk}`,
  );
  if (withNormal) {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <beginnormal_vertex>",
        "vec3 pagePos; vec3 objectNormal; deformPage(pagePos, objectNormal);",
      )
      .replace("#include <begin_vertex>", "vec3 transformed = pagePos;");
  } else {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "vec3 pagePos; vec3 pageNormal; deformPage(pagePos, pageNormal); vec3 transformed = pagePos;",
    );
  }
}

export function createPaperMaterials(tier: PerfTier): PaperMaterials {
  const uniforms: PaperUniforms = {
    uTime: { value: 0 },
    uFlutter: { value: 1 },
    uInk: { value: new Color(palette.ink800) },
    uEmber: { value: new Color(palette.ember) },
  };

  const base = { color: new Color("#e6dfd3"), roughness: 0.82, metalness: 0 };
  const material =
    tier === "low"
      ? new MeshStandardMaterial(base)
      : new MeshPhysicalMaterial({
          ...base,
          sheen: 0.6,
          sheenRoughness: 0.55,
          sheenColor: new Color("#fff4e6"),
        });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    patchVertex(shader, true);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fragmentHeader}`)
      .replace("#include <color_fragment>", paperColorChunk)
      .replace("#include <roughnessmap_fragment>", roughnessChunk)
      .replace("#include <emissivemap_fragment>", emissiveChunk);
  };
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 1;
  material.customProgramCacheKey = () => `paper-${tier}`;
  material.userData.paper = uniforms;

  const depthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking,
  });
  depthMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    patchVertex(shader, false);
  };
  depthMaterial.customProgramCacheKey = () => "paper-depth";

  return {
    material,
    depthMaterial,
    uniforms,
    dispose: () => {
      material.dispose();
      depthMaterial.dispose();
    },
  };
}

/** Uniforms of a paper material, reachable from the mesh inside useFrame. */
export const paperUniformsOf = (material: unknown): PaperUniforms | undefined =>
  (material as { userData?: { paper?: PaperUniforms } }).userData?.paper;
