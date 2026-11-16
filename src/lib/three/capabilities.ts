/**
 * Client-only device capability probe for the 3D layer.
 * Decides whether WebGL runs at all and which performance tier / DPR cap to use.
 */
export type PerfTier = "high" | "medium" | "low";

export interface RenderCapabilities {
  webgl: boolean;
  tier: PerfTier;
  /** [min, max] device-pixel-ratio passed to the R3F Canvas. */
  dpr: [number, number];
}

const DPR_CAPS: Record<PerfTier, [number, number]> = {
  high: [1, 2],
  medium: [1, 1.5],
  low: [1, 1],
};

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function hasWebGL(strict: boolean): boolean {
  try {
    const canvas = document.createElement("canvas");
    const opts: WebGLContextAttributes = {
      failIfMajorPerformanceCaveat: strict,
    };
    const gl =
      canvas.getContext("webgl2", opts) ?? canvas.getContext("webgl", opts);
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * `?gl=force` skips the "major performance caveat" check (software renderers), for testing.
 * `?gl=off` forces the static fallback.
 */
function glOverride(): "force" | "off" | null {
  const value = new URLSearchParams(window.location.search).get("gl");
  return value === "force" || value === "off" ? value : null;
}

export function detectCapabilities(): RenderCapabilities {
  const override = glOverride();
  const webgl = override === "off" ? false : hasWebGL(override !== "force");
  const nav = navigator as Navigator & NavigatorHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  let tier: PerfTier = "high";
  if (coarse || cores <= 4 || memory <= 4) tier = "medium";
  if (saveData || cores <= 2 || memory <= 2) tier = "low";

  return { webgl: webgl && !saveData, tier, dpr: DPR_CAPS[tier] };
}
