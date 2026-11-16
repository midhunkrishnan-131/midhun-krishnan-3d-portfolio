import { Color, DoubleSide, ShaderMaterial } from "three";

export const PAGE_WIDTH = 1.4;

const vertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uCurl;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aSeed;
    float u = uv.x;
    float sway = sin(uTime * 0.55 + aSeed * 6.2831) * 0.12;
    float k = uCurl * (0.45 + 0.55 * fract(aSeed * 7.13)) + sway;
    vec3 p = position;
    p.z += k * u * u;
    p.z += sin(uv.y * 3.14159) * 0.025 * sin(uTime * 0.8 + aSeed * 10.0);
    float dzdx = 2.0 * k * u / ${PAGE_WIDTH.toFixed(2)};
    vec3 n = normalize(vec3(-dzdx, 0.0, 1.0));

    vec4 local = vec4(p, 1.0);
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
      n = mat3(instanceMatrix) * n;
    #endif
    vec4 mv = modelViewMatrix * local;
    vViewPos = mv.xyz;
    vNormal = normalize(normalMatrix * n);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uEmber;
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vSeed;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(-vViewPos);

    // Cinematic three-point lighting computed in-shader.
    vec3 keyDir = normalize(vec3(-0.45, 0.65, 0.65));
    vec3 fillDir = normalize(vec3(0.7, -0.2, 0.5));
    float key = max(dot(N, keyDir), 0.0);
    float fill = max(dot(N, fillDir), 0.0) * 0.25;
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    // Ruled lines.
    float rows = 20.0;
    float ry = fract(vUv.y * rows);
    float row = floor(vUv.y * rows);
    float inText = step(0.12, vUv.x) * step(vUv.x, 0.9) * step(0.08, vUv.y) * step(vUv.y, 0.9);
    float rule = (1.0 - smoothstep(0.0, 0.035, abs(ry - 0.12))) * inText;

    // Handwriting that keeps being written: rows fill from the top over time.
    float rowFromTop = rows - 1.0 - row;
    float progress = fract(uTime * 0.025 + vSeed) * rows * 0.75;
    float len = 0.3 + 0.55 * hash(row * 1.7 + vSeed * 31.0);
    float rowFill = clamp(progress - rowFromTop, 0.0, 1.0);
    float strokeEnd = 0.12 + len * 0.78 * rowFill;
    float wobble = 0.09 * sin(vUv.x * 90.0 + row * 3.1 + vSeed * 20.0) * sin(vUv.x * 23.0 + row);
    float band = 1.0 - smoothstep(0.05, 0.11, abs(ry - 0.45 - wobble));
    float stroke = band * inText * step(vUv.x, strokeEnd) * step(0.001, rowFill);
    float tip = band * inText * (1.0 - smoothstep(0.0, 0.03, abs(vUv.x - strokeEnd))) * step(0.001, rowFill) * step(rowFill, 0.999);

    vec3 paper = uPaper * (0.05 + 0.55 * key + fill);
    vec3 color = mix(paper, uInk, rule * 0.35);
    color = mix(color, uInk, stroke * 0.85);
    color += uEmber * tip * 1.6;
    color += uEmber * rim * 0.28;

    // Soft page edges.
    float edge = smoothstep(0.0, 0.015, vUv.x) * smoothstep(0.0, 0.015, 1.0 - vUv.x)
               * smoothstep(0.0, 0.012, vUv.y) * smoothstep(0.0, 0.012, 1.0 - vUv.y);
    color *= mix(0.55, 1.0, edge);

    float depth = -vViewPos.z;
    float fogAmount = smoothstep(uFogNear, uFogFar, depth);
    color = mix(color, uFog, fogAmount);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createManuscriptMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uCurl: { value: 0.35 },
      uPaper: { value: new Color("#ede8df") },
      uInk: { value: new Color("#1a1a1d") },
      uEmber: { value: new Color("#ff7a45") },
      uFog: { value: new Color("#0a0a0b") },
      uFogNear: { value: 4 },
      uFogFar: { value: 9.5 },
    },
  });
}
