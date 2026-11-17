/** Flat-mode MYX shield: rotating rings and a pulsing core. */
export function MyxFallbackArt() {
  return (
    <svg
      data-allow-motion
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      className="myx-flat h-full w-full text-paper-faint"
      aria-hidden="true"
      focusable="false"
    >
      <g
        className="myx-flat__ring myx-flat__ring--outer"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.55"
      >
        <ellipse cx="200" cy="200" rx="150" ry="62" />
        <ellipse cx="200" cy="200" rx="150" ry="62" transform="rotate(60 200 200)" />
        <ellipse cx="200" cy="200" rx="150" ry="62" transform="rotate(-60 200 200)" />
      </g>
      <path
        className="myx-flat__shield"
        d="M200 70 L270 110 L255 250 L200 310 L145 250 L130 110 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        className="myx-flat__core"
        d="M200 110 L230 130 L222 230 L200 268 L178 230 L170 130 Z"
        fill="none"
        stroke="var(--color-ember)"
        strokeWidth="2"
      />
      {[
        [200, 80],
        [280, 160],
        [248, 280],
        [152, 280],
        [120, 160],
      ].map(([x, y], i) => (
        <circle
          key={i}
          className="myx-flat__node"
          cx={x}
          cy={y}
          r="4"
          fill={i === 0 ? "var(--color-ember)" : "currentColor"}
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </svg>
  );
}
