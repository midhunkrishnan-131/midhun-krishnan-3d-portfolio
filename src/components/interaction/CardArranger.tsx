"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { cn } from "@/lib/utils/cn";

gsap.registerPlugin(useGSAP);

const SIMPLE =
  "(prefers-reduced-motion: no-preference) and (max-width: 47.999rem), (prefers-reduced-motion: no-preference) and (min-width: 48rem) and (pointer: coarse) and (not (pointer: fine))";

const FULL =
  "(prefers-reduced-motion: no-preference) and (min-width: 48rem) and (pointer: fine)";

/** Timeline beats, in seconds. ScrollTrigger scrub maps the whole timeline to the scroll range. */
const MOVE = 0.7;
const PRESS = 0.18;
const DRAG = 0.9;
const RELEASE = 0.08;
const SETTLE = 0.26;
const GAP = 0.14;

const LIFT_SHADOW = "0px 28px 50px 0px rgba(0,0,0,0.48)";
const REST_SHADOW = "0px 0px 0px 0px rgba(0,0,0,0)";

interface Point {
  x: number;
  y: number;
}

interface Scatter extends Point {
  rotation: number;
}

interface CardArrangerProps {
  id: string;
  /** Animation order. DOM order stays the final CSS grid; pass MYX last so it lands in its slot last. */
  order: readonly string[];
  className?: string;
  children: ReactNode;
}

function unit(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function offsetWithin(
  element: HTMLElement,
  root: HTMLElement,
): { left: number; top: number } {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = element;
  let guard = 0;
  while (node && node !== root && guard < 24) {
    left += node.offsetLeft;
    top += node.offsetTop;
    const parent: Element | null = node.offsetParent;
    if (!(parent instanceof HTMLElement) || parent === node) break;
    node = parent;
    guard += 1;
  }
  return { left, top };
}

/** Deterministic scatter that stays inside the arranging root. Rotation is always ±8–14°. */
function scatterFor(item: HTMLElement, root: HTMLElement): Scatter {
  const id = item.dataset.arrangeId ?? "card";
  const place = offsetWithin(item, root);
  const roomLeft = Math.max(0, place.left);
  const roomTop = Math.max(0, place.top);
  const roomRight = Math.max(
    0,
    root.clientWidth - place.left - item.offsetWidth,
  );
  const roomBottom = Math.max(
    0,
    root.clientHeight - place.top - item.offsetHeight,
  );

  let xSign = unit(`${id}:x`) >= 0.5 ? 1 : -1;
  if ((xSign > 0 ? roomRight : roomLeft) < 24) {
    xSign = roomRight >= roomLeft ? 1 : -1;
  }
  let ySign = unit(`${id}:y`) >= 0.5 ? 1 : -1;
  if ((ySign > 0 ? roomBottom : roomTop) < 24) {
    ySign = roomBottom >= roomTop ? 1 : -1;
  }

  const xAvailable = xSign > 0 ? roomRight : roomLeft;
  const yAvailable = ySign > 0 ? roomBottom : roomTop;
  const xCap = Math.min(xAvailable * 0.72, root.clientWidth * 0.2);
  const yCap = Math.min(yAvailable * 0.42, 150);
  const x =
    xSign * Math.min(xAvailable, xCap * (0.55 + unit(`${id}:xj`) * 0.45));
  const y = ySign * Math.min(yAvailable, yCap * (0.5 + unit(`${id}:yj`) * 0.5));
  const rotation =
    (unit(`${id}:sign`) >= 0.5 ? 1 : -1) * (8 + unit(`${id}:rot`) * 6);
  return { x, y, rotation };
}

function slotCenter(item: HTMLElement, root: HTMLElement): Point {
  const place = offsetWithin(item, root);
  return {
    x: place.left + item.offsetWidth / 2,
    y: place.top + item.offsetHeight / 2,
  };
}

function scatteredPoint(item: HTMLElement, root: HTMLElement): Point {
  const center = slotCenter(item, root);
  const scatter = scatterFor(item, root);
  return { x: center.x + scatter.x, y: center.y + scatter.y };
}

function orderedItems(
  root: HTMLElement,
  order: readonly string[],
): HTMLElement[] {
  const nodes = gsap.utils.toArray<HTMLElement>("[data-arrange-item]", root);
  const byId = new Map<string, HTMLElement>();
  nodes.forEach((node) => {
    const itemId = node.dataset.arrangeId;
    if (itemId) byId.set(itemId, node);
  });
  const ranked: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();
  order.forEach((itemId) => {
    const node = byId.get(itemId);
    if (!node || seen.has(node)) return;
    seen.add(node);
    ranked.push(node);
  });
  nodes.forEach((node) => {
    if (!seen.has(node)) ranked.push(node);
  });
  return ranked;
}

function headerHeight(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 72;
  return raw.endsWith("rem") ? value * 16 : value;
}

function gridFits(root: HTMLElement): boolean {
  if (root.offsetHeight <= 0) return false;
  return root.offsetHeight <= window.innerHeight - headerHeight() - 32;
}

function clearGrab(ring: HTMLElement, dot: HTMLElement) {
  ring.classList.remove("is-grab", "is-press");
  dot.classList.remove("is-shrink");
}

/**
 * One scrubbed timeline: for each card, the ghost arcs in (x and y use different eases,
 * so the path bends), presses, and both travel back to the slot on a second arc.
 * Matching per-axis eases keep the card locked to the ghost. Release, then a yoyo settle.
 */
function createArrangement(
  root: HTMLElement,
  ghost: HTMLElement,
  ring: HTMLElement,
  dot: HTMLElement,
  items: HTMLElement[],
  pin: boolean,
  id: string,
) {
  const ranges: { start: number; end: number }[] = [];
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onUpdate: () => {
      const time = tl.time();
      const grabbing = ranges.some(
        (range) => time >= range.start && time < range.end,
      );
      ring.classList.toggle("is-grab", grabbing);
      ring.classList.toggle("is-press", grabbing);
      dot.classList.toggle("is-shrink", grabbing);
    },
  });

  tl.set(items, {
    transformOrigin: "50% 50%",
    force3D: true,
    zIndex: 1,
    willChange: "transform",
    boxShadow: REST_SHADOW,
  });
  items.forEach((item) => {
    tl.set(
      item,
      {
        x: () => scatterFor(item, root).x,
        y: () => scatterFor(item, root).y,
        rotation: () => scatterFor(item, root).rotation,
        scale: 0.92,
      },
      0,
    );
  });
  tl.set(ghost, { force3D: true }, 0);
  tl.fromTo(
    ghost,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.22, ease: "power1.out", immediateRender: true },
    0,
  );

  let cursor = 0;
  items.forEach((item, index) => {
    const moveAt = cursor;
    const pressAt = moveAt + MOVE;
    const dragAt = pressAt + PRESS;
    const releaseAt = dragAt + DRAG;
    const settleAt = releaseAt + RELEASE;
    ranges.push({ start: pressAt, end: releaseAt });

    const approach = (): Point => {
      if (index === 0) {
        const first = scatteredPoint(items[0], root);
        return { x: first.x - 72, y: Math.max(20, first.y - 88) };
      }
      return slotCenter(items[index - 1], root);
    };

    tl.fromTo(
      ghost,
      { x: () => approach().x },
      {
        x: () => scatteredPoint(item, root).x,
        duration: MOVE,
        ease: "power3.inOut",
        immediateRender: false,
      },
      moveAt,
    );
    tl.fromTo(
      ghost,
      { y: () => approach().y },
      {
        y: () => scatteredPoint(item, root).y,
        duration: MOVE,
        ease: "power1.in",
        immediateRender: false,
      },
      moveAt,
    );

    tl.set(item, { zIndex: 5 }, moveAt);
    tl.fromTo(
      item,
      {
        scale: 0.92,
        rotation: () => scatterFor(item, root).rotation,
        boxShadow: REST_SHADOW,
      },
      {
        scale: 1.04,
        rotation: () => (Math.sign(scatterFor(item, root).rotation) || 1) * 3,
        boxShadow: LIFT_SHADOW,
        duration: PRESS,
        ease: "power2.out",
        immediateRender: false,
      },
      pressAt,
    );

    tl.fromTo(
      item,
      {
        x: () => scatterFor(item, root).x,
        rotation: () => (Math.sign(scatterFor(item, root).rotation) || 1) * 3,
        scale: 1.04,
      },
      {
        x: 0,
        rotation: 0,
        scale: 1,
        duration: DRAG,
        ease: "power2.inOut",
        immediateRender: false,
      },
      dragAt,
    );
    tl.fromTo(
      item,
      { y: () => scatterFor(item, root).y },
      {
        y: 0,
        duration: DRAG,
        ease: "sine.inOut",
        immediateRender: false,
      },
      dragAt,
    );
    tl.fromTo(
      item,
      { boxShadow: LIFT_SHADOW },
      {
        boxShadow: REST_SHADOW,
        duration: DRAG,
        ease: "power2.inOut",
        immediateRender: false,
      },
      dragAt,
    );
    tl.fromTo(
      ghost,
      { x: () => scatteredPoint(item, root).x },
      {
        x: () => slotCenter(item, root).x,
        duration: DRAG,
        ease: "power2.inOut",
        immediateRender: false,
      },
      dragAt,
    );
    tl.fromTo(
      ghost,
      { y: () => scatteredPoint(item, root).y },
      {
        y: () => slotCenter(item, root).y,
        duration: DRAG,
        ease: "sine.inOut",
        immediateRender: false,
      },
      dragAt,
    );

    tl.set(item, { zIndex: 1 }, releaseAt);
    tl.fromTo(
      item,
      { y: 0 },
      {
        y: -8,
        duration: SETTLE / 2,
        ease: "power1.out",
        yoyo: true,
        repeat: 1,
        immediateRender: false,
      },
      settleAt,
    );

    cursor = settleAt + SETTLE + GAP;
  });

  tl.fromTo(
    ghost,
    { autoAlpha: 1 },
    { autoAlpha: 0, duration: 0.3, ease: "power1.in", immediateRender: false },
    cursor,
  );

  ScrollTrigger.create({
    id: `${id}-arrange`,
    animation: tl,
    trigger: root,
    start: pin
      ? () => `top top+=${Math.round(headerHeight() + 16)}`
      : "top 70%",
    // Original unpinned end was "bottom 60%". Keep that for short blocks (projects).
    // On a tall skills column that range left cards mid-turn; finish within one viewport
    // so the original ghost-cursor choreography still plays, then cards land cleanly.
    end: pin
      ? () =>
          `+=${Math.max(Math.round(window.innerHeight * 0.85), items.length * 420)}`
      : () =>
          root.offsetHeight > window.innerHeight * 1.15
            ? `+=${Math.round(window.innerHeight * 0.95)}`
            : "bottom 60%",
    pin: pin,
    pinSpacing: true,
    scrub: 0.6,
    invalidateOnRefresh: true,
    anticipatePin: pin ? 1 : 0,
    refreshPriority: id.includes("project") ? 0 : 1,
    onLeave: (self) => {
      if (self.direction === 1) self.animation?.progress(1);
    },
    onLeaveBack: (self) => {
      self.animation?.progress(0);
    },
  });
}

/**
 * Scroll-scrubbed "a hand arranges the cards" layer.
 * Final layout is the CSS grid (no-JS, reduced motion, SEO). JS only offsets from those slots.
 * The wrapper around each FocusTarget is what GSAP transforms, so it never fights whileHover.
 */
export function CardArranger({
  id,
  order,
  className,
  children,
}: CardArrangerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const orderKey = order.join("|");

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      const ghost = ghostRef.current;
      const fade = fadeRef.current;
      const ring = ringRef.current;
      const dot = dotRef.current;
      if (!root || !ghost || !fade || !ring || !dot) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(ghost, { autoAlpha: 0 });
      });

      mm.add(SIMPLE, () => {
        const items = orderedItems(root, order);
        gsap.set(ghost, { autoAlpha: 0 });
        if (items.length === 0) return;
        gsap.from(items, {
          y: 64,
          autoAlpha: 0,
          duration: 0.6,
          ease: "none",
          stagger: 0.16,
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            end: () =>
              root.offsetHeight > window.innerHeight * 1.15
                ? `+=${Math.round(window.innerHeight * 0.9)}`
                : "bottom 60%",
            scrub: 0.6,
            invalidateOnRefresh: true,
            onLeave: (self) => {
              if (self.direction === 1) self.animation?.progress(1);
            },
          },
        });
      });

      mm.add(FULL, () => {
        let ctx: gsap.Context | null = null;
        let pinned: boolean | null = null;
        let disposed = false;
        let idle = 0;
        let rebuildTimer = 0;

        const fadeTo = contextSafe
          ? contextSafe((opacity: number) => {
              gsap.to(fade, {
                autoAlpha: opacity,
                duration: opacity === 0 ? 0.25 : 0.45,
                overwrite: "auto",
              });
            })
          : (opacity: number) => {
              gsap.to(fade, {
                autoAlpha: opacity,
                duration: opacity === 0 ? 0.25 : 0.45,
                overwrite: "auto",
              });
            };

        const build = () => {
          ctx?.revert();
          clearGrab(ring, dot);
          const items = orderedItems(root, order);
          pinned = items.length > 0 && gridFits(root);
          if (items.length === 0) {
            ctx = null;
            gsap.set(ghost, { autoAlpha: 0 });
            return;
          }
          ctx = gsap.context(() => {
            createArrangement(
              root,
              ghost,
              ring,
              dot,
              items,
              pinned === true,
              id,
            );
          }, root);
        };

        build();

        const requestRebuild = () => {
          window.clearTimeout(rebuildTimer);
          rebuildTimer = window.setTimeout(() => {
            if (disposed || !root.isConnected) return;
            const items = orderedItems(root, order);
            const next = items.length > 0 && gridFits(root);
            if (next !== pinned) build();
          }, 160);
        };

        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const rect = root.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
          if (!inside) return;
          fadeTo(0);
          window.clearTimeout(idle);
          idle = window.setTimeout(() => {
            if (!disposed) fadeTo(1);
          }, 1000);
        };

        root.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("resize", requestRebuild);
        window.addEventListener("gl-layout-change", requestRebuild);
        document.fonts?.ready.then(requestRebuild).catch(() => undefined);

        return () => {
          disposed = true;
          window.clearTimeout(rebuildTimer);
          window.clearTimeout(idle);
          root.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("resize", requestRebuild);
          window.removeEventListener("gl-layout-change", requestRebuild);
          gsap.killTweensOf(fade);
          clearGrab(ring, dot);
          ctx?.revert();
        };
      });

      return () => mm.revert();
    },
    {
      scope: rootRef,
      dependencies: [pathname, orderKey],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={rootRef}
      id={id}
      data-arrange-root
      className={cn("relative", className)}
    >
      {children}
      <div ref={ghostRef} className="arrange-ghost" aria-hidden="true">
        <div ref={fadeRef} className="arrange-ghost-fade">
          <div ref={dotRef} className="cursor-dot" />
          <div ref={ringRef} className="cursor-ring">
            <span className="cursor-label" />
          </div>
        </div>
      </div>
    </div>
  );
}
