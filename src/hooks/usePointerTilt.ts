"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/animations/gsap";

gsap.registerPlugin(useGSAP);

const MOTION = "(prefers-reduced-motion: no-preference)";

export interface PointerTiltOptions {
  /** Max rotateX / rotateY in degrees at the card edge. */
  rotate?: number;
  /** Hover lift in pixels. */
  lift?: number;
}

/**
 * The Skills / Projects card mouse motion: a lerped 3D tilt toward the
 * pointer and a slight lift. Transform-only, driven by gsap.quickTo on the
 * shared GSAP ticker. Off for touch and for prefers-reduced-motion.
 */
export function usePointerTilt<T extends HTMLElement>(
  options: PointerTiltOptions = {},
) {
  const ref = useRef<T>(null);
  const rotate = options.rotate ?? 6;
  const lift = options.lift ?? 6;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION, () => {
        gsap.set(el, {
          transformPerspective: 900,
          transformOrigin: "50% 50%",
          force3D: true,
        });
        const toRotateY = gsap.quickTo(el, "rotationY", {
          duration: 0.5,
          ease: "power3.out",
        });
        const toRotateX = gsap.quickTo(el, "rotationX", {
          duration: 0.5,
          ease: "power3.out",
        });
        const toLift = gsap.quickTo(el, "y", {
          duration: 0.45,
          ease: "power3.out",
        });

        const onMove = (event: PointerEvent) => {
          if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
            return;
          }
          const box = el.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) return;
          const px = (event.clientX - box.left) / box.width - 0.5;
          const py = (event.clientY - box.top) / box.height - 0.5;
          toRotateY(px * rotate * 2);
          toRotateX(-py * rotate * 2);
          toLift(-lift);
        };
        const reset = () => {
          toRotateY(0);
          toRotateX(0);
          toLift(0);
        };

        el.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerleave", reset);
        el.addEventListener("pointercancel", reset);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", reset);
          el.removeEventListener("pointercancel", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [rotate, lift], revertOnUpdate: true },
  );

  return ref;
}
