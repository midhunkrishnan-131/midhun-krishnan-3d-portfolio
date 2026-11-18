/**
 * Static, decorative stand-in for the hero scene (no-WebGL, low tier, before 3D loads).
 * Pure SVG: a few loose ruled pages, one line still being written.
 */
export function HeroFallbackArt() {
  const pages = [
    { x: 640, y: 120, r: -9, o: 0.16 },
    { x: 760, y: 170, r: 6, o: 0.22 },
    { x: 700, y: 250, r: -3, o: 0.32 },
  ];
  return (
    <svg
      data-allow-motion
      className="hero-flat absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="hero-glow" cx="68%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#ff7a45" stopOpacity="0.14" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hero-glow)" />
      {pages.map((p, i) => (
        <g
          key={i}
          className={`hero-flat__page hero-flat__page--${i}`}
          transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}
          opacity={p.o}
        >
          <rect width="300" height="400" fill="#e9e7e2" />
          {Array.from({ length: 14 }, (_, row) => (
            <line
              key={row}
              x1="36"
              x2="270"
              y1={56 + row * 24}
              y2={56 + row * 24}
              stroke="#1a1a1d"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          ))}
          {i === pages.length - 1 ? (
            <>
              <path
                className="hero-flat__write"
                d="M40 50 q 20 -8 40 0 t 40 0 t 40 0 t 30 0"
                fill="none"
                stroke="#1a1a1d"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                className="hero-flat__ember"
                cx="190"
                cy="50"
                r="4"
                fill="#ff7a45"
              />
            </>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
