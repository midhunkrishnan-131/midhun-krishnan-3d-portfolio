"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  SCRUB,
  STORY_EASE,
} from "@/lib/animations/gsap";

/**
 * Declarative scroll animations driven by data attributes on server-rendered markup:
 *   data-reveal="lines"    split into masked lines that rise in (headings)
 *   data-reveal="words"    word-by-word rise + fade (lead paragraphs)
 *   data-reveal="fade"     soft rise + fade (paragraphs)
 *   data-reveal="eyebrow"  short label slide
 *   data-reveal="card"     card / row entrance
 *   data-reveal="stagger"  children of the element stagger in
 *   data-reveal="frame"    scene frames grow into place as the section arrives
 *   data-parallax="copy"   slow vertical parallax on a column
 *   data-hero-content      staged intro, then a pin-scrubbed exit
 *   data-hero-stage        named hero children used by the staged timelines
 *   data-section           section enter: the top rule draws on
 *   data-magnetic          element leans toward a nearby pointer (fine pointers only)
 *
 * Entrance typography is scrubbed across the first part of a section so it finishes
 * and stays readable while the section is in view, then reverses only on the way back.
 * Text is fully visible in the HTML; from-states are applied only here, in JS, and only
 * when motion is allowed, so crawlers / no-JS / reduced-motion visitors always see it.
 */
const isHeroChild = (el: Element) => Boolean(el.closest("[data-hero-content]"));

const willMotion = (el: HTMLElement, on: boolean) => {
  el.style.willChange = on ? "transform" : "";
};

function setupHero(splits: SplitText[]) {
  const root = document.querySelector<HTMLElement>("[data-hero-content]");
  const section = root?.closest("section");
  if (!root || !section) return;

  const eyebrow = root.querySelector<HTMLElement>(
    "[data-hero-stage='eyebrow']",
  );
  const title = root.querySelector<HTMLElement>("[data-hero-stage='title']");
  const kicker = root.querySelector<HTMLElement>("[data-hero-stage='kicker']");
  const roles = root.querySelector<HTMLElement>("[data-hero-stage='roles']");
  const actions = root.querySelector<HTMLElement>(
    "[data-hero-stage='actions']",
  );
  const introTargets = [eyebrow, kicker, roles, actions].filter(
    (el): el is HTMLElement => Boolean(el),
  );

  const intro = gsap.timeline({
    defaults: { ease: STORY_EASE, duration: 1 },
  });
  if (eyebrow) {
    intro.from(eyebrow, { y: 18, autoAlpha: 0, duration: 0.8 }, 0);
  }
  if (title) {
    splits.push(
      SplitText.create(title, {
        type: "lines,words",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.25,
            stagger: 0.08,
            ease: STORY_EASE,
            delay: 0.12,
            force3D: false,
          }),
      }),
    );
  }
  if (kicker) intro.from(kicker, { y: 24, autoAlpha: 0 }, 0.28);
  if (roles) intro.from(roles, { y: 24, autoAlpha: 0 }, 0.4);
  if (actions) intro.from(actions, { y: 20, autoAlpha: 0 }, 0.52);

  intro.eventCallback("onComplete", () => {
    // If a later layout jump (data-gl pin) kills SplitText mid-play, the heading
    // must still be readable — never left at yPercent 110.
    if (title) gsap.set(title, { clearProps: "transform,opacity,visibility" });
    introTargets.forEach((el) =>
      gsap.set(el, { clearProps: "transform,opacity,visibility" }),
    );
  });

  // The exit fade is only meaningful once the hero is pinned tall (data-gl=on).
  // On a one-viewport hero, start and end collapse and the heading vanishes.
  const attachExit = () => {
    const extra = section.offsetHeight - window.innerHeight;
    if (extra < window.innerHeight * 0.35) return null;
    const exit = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        onToggle: (self) => willMotion(root, self.isActive),
      },
    });
    if (actions) exit.to(actions, { yPercent: -30, autoAlpha: 0 }, 0.12);
    if (roles) exit.to(roles, { yPercent: -28, autoAlpha: 0 }, 0.22);
    if (kicker) exit.to(kicker, { yPercent: -22, autoAlpha: 0 }, 0.32);
    if (title) exit.to(title, { yPercent: -16, autoAlpha: 0 }, 0.42);
    if (eyebrow) exit.to(eyebrow, { yPercent: -12, autoAlpha: 0 }, 0.52);
    if (!introTargets.length && !title) {
      exit.to(root, { yPercent: -18, autoAlpha: 0 }, 0);
    }
    return exit;
  };

  let exit = attachExit();
  const onGl = () => {
    exit?.scrollTrigger?.kill();
    exit?.kill();
    exit = attachExit();
    ScrollTrigger.refresh();
  };
  window.addEventListener("gl-layout-change", onGl);
  // setupHero has no direct cleanup hook; ScrollAnimations reverts via matchMedia
  // and this listener is removed when the owner effect re-runs (pathname change).
  // Attach an abort on the root so the parent cleanup can remove it.
  root.dataset.heroExit = "1";
  const prev = (root as HTMLElement & { __onGl?: () => void }).__onGl;
  if (prev) window.removeEventListener("gl-layout-change", prev);
  (root as HTMLElement & { __onGl?: () => void }).__onGl = onGl;
}

export function ScrollAnimations() {
  const pathname = usePathname();

  // Mounted from app/template.tsx (the route segment) so this effect cannot
  // run before the page hydrates. A copy in the root layout did, and SplitText
  // plus gsap.from() then rewrote server HTML that React had not yet claimed.
  useEffect(() => {
    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: (() => void)[] = [];

      setupHero(splits);

      gsap.utils.toArray<HTMLElement>("[data-reveal='lines']").forEach((el) => {
        if (isHeroChild(el)) return;
        const above = el.getBoundingClientRect().top < window.innerHeight * 0.7;
        splits.push(
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              const tween = gsap.from(self.lines, {
                yPercent: 110,
                ease: STORY_EASE,
                duration: above ? 0.9 : 1.1,
                stagger: 0.08,
                delay: above ? 0.1 : 0,
                force3D: false,
                scrollTrigger: above
                  ? undefined
                  : {
                      trigger: el,
                      start: "top 88%",
                      toggleActions: "play none none reverse",
                    },
                onComplete: () => {
                  gsap.set(self.lines, { clearProps: "transform" });
                },
              });
              cleanups.push(() => {
                tween.scrollTrigger?.kill();
                tween.kill();
              });
            },
          }),
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='words']").forEach((el) => {
        if (isHeroChild(el)) return;
        splits.push(
          SplitText.create(el, {
            type: "words",
            aria: "hidden",
            autoSplit: true,
            onSplit: (self) => {
              const tween = gsap.from(self.words, {
                yPercent: 36,
                autoAlpha: 0,
                ease: "power2.out",
                duration: 0.85,
                stagger: 0.025,
                force3D: false,
                scrollTrigger: {
                  trigger: el,
                  start: "top 90%",
                  toggleActions: "play none none reverse",
                },
                onComplete: () => {
                  gsap.set(self.words, {
                    clearProps: "transform,opacity,visibility",
                  });
                },
              });
              cleanups.push(() => {
                tween.scrollTrigger?.kill();
                tween.kill();
              });
            },
          }),
        );
      });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal='eyebrow']")
        .forEach((el) => {
          if (isHeroChild(el)) return;
          const tween = gsap.from(el, {
            y: 16,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
            onComplete: () => {
              gsap.set(el, { clearProps: "transform,opacity,visibility" });
            },
          });
          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });

      gsap.utils.toArray<HTMLElement>("[data-reveal='fade']").forEach((el) => {
        if (isHeroChild(el)) return;
        const tween = gsap.from(el, {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
          onComplete: () => {
            gsap.set(el, { clearProps: "transform,opacity,visibility" });
          },
        });
        cleanups.push(() => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal='card']").forEach((el) => {
        const tween = gsap.from(el, {
          y: 32,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none reverse",
            onToggle: (self) => willMotion(el, self.isActive),
          },
          onComplete: () => {
            gsap.set(el, { clearProps: "transform,opacity,visibility" });
          },
        });
        cleanups.push(() => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-reveal='stagger']")
        .forEach((el) => {
          const items = Array.from(el.children);
          if (!items.length) return;
          const tween = gsap.from(items, {
            y: 20,
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
            onComplete: () => {
              gsap.set(items, { clearProps: "transform,opacity,visibility" });
            },
          });
          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });

      gsap.utils.toArray<HTMLElement>("[data-reveal='frame']").forEach((el) => {
        // Scale (not clip-path): the shared canvas draws each view at the slot's transformed rect.
        gsap.fromTo(
          el,
          { scale: 0.84, y: 36 },
          {
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "top 35%",
              scrub: SCRUB,
              onToggle: (self) => willMotion(el, self.isActive),
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const kind = el.dataset.parallax;
        const amount = kind === "scene" ? 56 : 40;
        gsap.fromTo(
          el,
          { y: amount },
          {
            y: -amount * 0.55,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
              onToggle: (self) => willMotion(el, self.isActive),
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-section]").forEach((el) => {
        if (el.id === "hero") return;
        gsap.fromTo(
          el,
          { ["--section-rule" as string]: 0 },
          {
            ["--section-rule" as string]: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              end: "top 55%",
              scrub: SCRUB,
            },
          },
        );
      });

      const fine = window.matchMedia("(pointer: fine)").matches;
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

    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
    return () => {
      cancelAnimationFrame(id);
      splits.forEach((s) => s.revert());
      const hero = document.querySelector<HTMLElement>("[data-hero-content]");
      const onGl =
        hero && (hero as HTMLElement & { __onGl?: () => void }).__onGl;
      if (onGl) window.removeEventListener("gl-layout-change", onGl);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
