"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/animations/gsap";

gsap.registerPlugin(useGSAP);

/**
 * Extra cinematic scroll on the project cards, layered *inside* each
 * data-arrange-item so it never fights the original ghost-cursor arranger.
 * Desktop: a gentle depth / horizontal settle. Mobile: a vertical rise.
 * Never pins, never traps the scroll.
 */
export function ProjectScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const inners = el.querySelectorAll<HTMLElement>("[data-project-inner]");
      if (inners.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(inners, { clearProps: "all" });
      });
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 64rem)",
        () => {
          inners.forEach((card, i) => {
            gsap.fromTo(
              card,
              { x: i === 0 ? 40 : 24, z: -30, rotateY: -3, autoAlpha: 0.8 },
              {
                x: 0,
                z: 0,
                rotateY: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top 90%",
                  end: "top 62%",
                  scrub: 0.5,
                  invalidateOnRefresh: true,
                  onLeave: () =>
                    gsap.set(card, { clearProps: "opacity,visibility" }),
                },
              },
            );
          });
        },
      );
      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 63.999rem)",
        () => {
          gsap.fromTo(
            inners,
            { y: 28, autoAlpha: 0.8 },
            {
              y: 0,
              autoAlpha: 1,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                end: "top 65%",
                scrub: 0.5,
                invalidateOnRefresh: true,
                onLeave: () =>
                  gsap.set(inners, { clearProps: "opacity,visibility" }),
              },
            },
          );
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className} style={{ perspective: 1200 }}>
      {children}
    </div>
  );
}
