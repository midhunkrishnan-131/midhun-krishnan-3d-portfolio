import type { SceneKey } from "@/types/three";

/**
 * Static, server-rendered stand-ins for each section scene: shown before the 3D view is ready,
 * and permanently when WebGL is unavailable. Pure SVG, decorative, no layout impact.
 */
const art: Record<Exclude<SceneKey, "hero">, React.ReactNode> = {
  beginning: (
    <g fontFamily="monospace" fill="currentColor">
      <text x="60" y="220" fontSize="44" opacity="0.8">
        {"> hello, world"}
      </text>
      <rect x="400" y="188" width="16" height="36" fill="var(--color-ember)" />
    </g>
  ),
  struggle: (
    <path
      d="M40 200 C 120 40, 200 360, 260 160 S 360 60, 300 260 S 120 300, 200 120 S 340 340, 360 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.6"
    />
  ),
  blackbox: (
    <g fill="none" stroke="currentColor" opacity="0.6">
      <path d="M200 70 L232 140 L232 260 L168 260 L168 140 Z" />
      <path d="M168 140 L232 140 M168 230 L140 280 L168 260 M232 230 L260 280 L232 260" />
      <path
        d="M188 275 L200 320 L212 275"
        stroke="var(--color-ember)"
        strokeWidth="2"
      />
    </g>
  ),
  bca: (
    <g fill="none" stroke="currentColor" opacity="0.6">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="100" y={110 + i * 40} width="200" height="26" rx="6" />
      ))}
      <rect
        x="100"
        y="70"
        width="200"
        height="26"
        rx="6"
        stroke="var(--color-ember)"
      />
    </g>
  ),
  perception: (
    <g stroke="currentColor" opacity="0.6" fill="none">
      <path d="M200 80 L110 200 M200 80 L200 200 M200 80 L290 200 M110 200 L70 310 M110 200 L140 310 M290 200 L260 310 M290 200 L330 310" />
      <circle
        cx="200"
        cy="200"
        r="34"
        stroke="var(--color-ember)"
        strokeWidth="3"
      />
    </g>
  ),
  projects: (
    <g fill="none" stroke="currentColor" opacity="0.6">
      <ellipse cx="200" cy="200" rx="160" ry="60" />
      <path
        d="M200 140 C 230 150, 250 150, 255 150 C 255 200, 240 235, 200 260 C 160 235, 145 200, 145 150 C 150 150, 170 150, 200 140 Z"
        stroke="var(--color-ember)"
        strokeWidth="2"
      />
    </g>
  ),
  skills: (
    <g fill="currentColor" opacity="0.7">
      {[
        [80, 140],
        [120, 110],
        [150, 160],
        [230, 90],
        [270, 130],
        [250, 180],
        [300, 240],
        [180, 260],
        [120, 280],
        [330, 300],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} />
      ))}
    </g>
  ),
  future: (
    <g fill="none" stroke="currentColor" opacity="0.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M0 ${240 + i * i * 6} L400 ${240 + i * i * 6}`} />
      ))}
      <path d="M0 230 L400 230" stroke="var(--color-ember)" strokeWidth="2" />
    </g>
  ),
  experience: (
    <g fill="none" stroke="currentColor" opacity="0.6">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="70" y={80 + i * 48} width="260" height="32" rx="4" />
      ))}
      <circle cx="96" cy="96" r="6" fill="var(--color-ember)" stroke="none" />
    </g>
  ),
  myx: (
    <g fill="none" stroke="currentColor" opacity="0.65">
      <path d="M200 70 L270 110 L255 250 L200 310 L145 250 L130 110 Z" />
      <path
        d="M200 110 L230 130 L222 230 L200 268 L178 230 L170 130 Z"
        stroke="var(--color-ember)"
      />
    </g>
  ),
  catalogue: (
    <g fill="none" stroke="currentColor" opacity="0.6">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect
          key={i}
          x={60 + (i % 4) * 80}
          y={100 + Math.floor(i / 4) * 110}
          width="60"
          height="80"
          rx="4"
        />
      ))}
    </g>
  ),
  projectDetail: (
    <g fill="none" stroke="currentColor" opacity="0.65">
      <rect x="110" y="80" width="180" height="240" rx="8" />
      <path
        d="M140 140 L260 140 M140 200 L230 200 M140 260 L200 260"
        stroke="var(--color-ember)"
      />
    </g>
  ),
  lost: (
    <g fontFamily="serif" fill="currentColor" opacity="0.7">
      <text x="70" y="230" fontSize="120">
        404
      </text>
    </g>
  ),
};

export function SceneFallback({ scene }: { scene: Exclude<SceneKey, "hero"> }) {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full text-paper-faint"
      aria-hidden="true"
      focusable="false"
    >
      {art[scene]}
    </svg>
  );
}
