"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/animations/gsap";

gsap.registerPlugin(useGSAP);

/**
 * Flat-mode stand-in for the 3D knot: the tangled stroke draws, then eases
 * toward a set of calm threads as the section is scrolled.
 */
export function StruggleFallbackArt() {
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const root = svg.current;
      if (!root) return;
      const section = root.closest("section");
      const knot = root.querySelector<SVGPathElement>("[data-knot]");
      const calm = root.querySelectorAll<SVGElement>("[data-calm]");
      if (!knot) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const length = knot.getTotalLength();
      gsap.set(knot, {
        strokeDasharray: length,
        strokeDashoffset: reduced ? 0 : length,
      });
      gsap.set(calm, { autoAlpha: reduced ? 0.7 : 0 });
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section ?? root,
          start: "top 80%",
          end: "bottom 40%",
          scrub: 0.7,
        },
      });
      tl.to(knot, { strokeDashoffset: 0, ease: "none", duration: 0.45 }, 0);
      tl.to(
        knot,
        { autoAlpha: 0.2, ease: "none", duration: 0.4 },
        0.45,
      );
      tl.to(calm, { autoAlpha: 0.85, ease: "none", duration: 0.4, stagger: 0.05 }, 0.5);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: svg },
  );

  return (
    <svg
      ref={svg}
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full text-paper-faint"
      aria-hidden="true"
      focusable="false"
    >
      <path
        data-knot
        d="M40 200 C 120 40, 200 360, 260 160 S 360 60, 300 260 S 120 300, 200 120 S 340 340, 360 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.7"
      />
      {([110, 155, 200, 245, 290] as const).map((y, i) => (
        <path
          key={y}
          data-calm
          d={`M48 ${y} C 140 ${y + (i - 2) * 6}, 260 ${y - (i - 2) * 6}, 352 ${y}`}
          fill="none"
          stroke={i === 2 ? "var(--color-ember)" : "currentColor"}
          strokeWidth={i === 2 ? 2.4 : 1.8}
          opacity="0"
        />
      ))}
    </svg>
  );
}
