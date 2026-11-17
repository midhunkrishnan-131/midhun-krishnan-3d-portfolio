"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/animations/gsap";
import { Tag } from "@/components/ui/Tag";
import type { SkillItem } from "@/types/content";

gsap.registerPlugin(useGSAP);

/**
 * Staggered entrance for every pill in a skill category. Runs in both 3D and
 * Flat modes (it is DOM-only) and reverses on the way back.
 */
export function SkillPillList({
  title,
  items,
}: {
  title: string;
  items: readonly SkillItem[];
}) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const pills = el.querySelectorAll("[data-skill-pill]");
      if (pills.length === 0) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pills, { clearProps: "all" });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(pills, {
          y: 16,
          autoAlpha: 0,
          rotate: -4,
          duration: 0.5,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "top 62%",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root, dependencies: [items.length, title] },
  );

  return (
    <ul ref={root} className="flex flex-wrap gap-2" aria-label={title}>
      {items.map((item) => (
        <li key={item.name} data-skill-pill>
          <Tag tone={item.confirmed ? "neutral" : "muted"}>
            {item.name}
            {item.confirmed ? null : (
              <span className="ml-1 normal-case">(to confirm)</span>
            )}
          </Tag>
        </li>
      ))}
    </ul>
  );
}
