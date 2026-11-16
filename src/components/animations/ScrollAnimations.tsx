"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  STORY_EASE,
} from "@/lib/animations/gsap";

/**
 * Declarative scroll animations driven by data attributes on server-rendered markup:
 *   data-reveal="lines"  split into masked lines that rise in (headings)
 *   data-reveal="fade"   soft rise + fade (paragraphs, cards)
 *   data-reveal="frame"  scene frames grow into place as the section arrives (scrubbed)
 *   data-hero-content    hero copy drifts up and dims as the pinned hero is scrubbed
 *   data-magnetic        element leans toward a nearby pointer (fine pointers only)
 * Text is fully visible in the HTML; the from-states are applied only here, in JS, and only
 * when motion is allowed, so crawlers / no-JS / reduced-motion visitors always see it.
 */
export function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal='lines']").forEach((el) => {
        const above = el.getBoundingClientRect().top < window.innerHeight;
        splits.push(
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.2,
                stagger: 0.09,
                ease: STORY_EASE,
                delay: above ? 0.15 : 0,
                scrollTrigger: above
                  ? undefined
                  : { trigger: el, start: "top 88%", once: true },
              }),
          }),
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='fade']").forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 1,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='frame']").forEach((el) => {
        // Scale (not clip-path): the shared canvas draws each view at the slot's transformed rect.
        gsap.fromTo(
          el,
          { scale: 0.84 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      });

      const hero = document.querySelector<HTMLElement>("[data-hero-content]");
      const heroSection = hero?.closest("section");
      if (hero && heroSection) {
        gsap.to(hero, {
          yPercent: -18,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }

      // Magnetic elements.
      const fine = window.matchMedia("(pointer: fine)").matches;
      const cleanups: (() => void)[] = [];
      if (fine) {
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", {
            duration: 0.6,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(el, "y", {
            duration: 0.6,
            ease: "power3.out",
          });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }
      return () => cleanups.forEach((fn) => fn());
    });

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      splits.forEach((s) => s.revert());
      mm.revert();
    };
  }, [pathname]);

  return null;
}
