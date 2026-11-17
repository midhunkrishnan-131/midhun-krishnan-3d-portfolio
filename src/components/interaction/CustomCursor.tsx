"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animations/gsap";

gsap.registerPlugin(useGSAP);

type CursorMode = "default" | "link" | "label";

/**
 * Fine-pointer cursor: an ember dot locked to the pointer and a paper ring that eases behind it.
 * Hidden until the first move, and removed for coarse pointers or reduced motion.
 * Hover treatment is delegated from the document so it never blocks clicks.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const active = fine.matches && !reduce.matches;
      document.documentElement.classList.toggle("has-custom-cursor", active);
      setEnabled(active);
    };
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  useGSAP(
    (_context, contextSafe) => {
      if (!enabled || !contextSafe) return;
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!dot || !ring || !label) return;

      gsap.set([dot, ring], {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        autoAlpha: 0,
        force3D: true,
      });
      const ringX = gsap.quickTo(ring, "x", {
        duration: 0.35,
        ease: "power3.out",
      });
      const ringY = gsap.quickTo(ring, "y", {
        duration: 0.35,
        ease: "power3.out",
      });

      let visible = false;
      let mode: CursorMode = "default";
      let labelText = "";

      const show = contextSafe(() => {
        visible = true;
        gsap.to([dot, ring], {
          autoAlpha: 1,
          duration: 0.2,
          overwrite: "auto",
        });
      });
      const hide = contextSafe(() => {
        visible = false;
        ring.classList.remove("is-press");
        gsap.to([dot, ring], {
          autoAlpha: 0,
          duration: 0.18,
          overwrite: "auto",
        });
      });

      const setMode = (next: CursorMode, text: string) => {
        if (next === mode && text === labelText) return;
        mode = next;
        labelText = text;
        ring.classList.toggle("is-label", next === "label");
        ring.classList.toggle("is-link", next === "link");
        dot.classList.toggle("is-shrink", next !== "default");
        if (label.textContent !== text) label.textContent = text;
      };

      const syncTarget = (target: EventTarget | null) => {
        const element = target instanceof Element ? target : null;
        const labelled = element?.closest<HTMLElement>("[data-cursor]");
        const text = labelled?.dataset.cursor?.trim() ?? "";
        if (labelled && text.length > 0) {
          setMode("label", text);
          return;
        }
        if (element?.closest("a, button")) {
          setMode("link", "");
          return;
        }
        setMode("default", "");
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        gsap.set(dot, { x: event.clientX, y: event.clientY });
        if (!visible) {
          gsap.set(ring, { x: event.clientX, y: event.clientY });
          show();
        }
        ringX(event.clientX);
        ringY(event.clientY);
      };
      const onOver = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        syncTarget(event.target);
      };
      const onOut = (event: PointerEvent) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !next.isConnected) {
          hide();
          setMode("default", "");
          return;
        }
        syncTarget(next);
      };
      const onDown = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        ring.classList.add("is-press");
      };
      const onUp = () => {
        ring.classList.remove("is-press");
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerover", onOver);
      document.addEventListener("pointerout", onOut);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      document.documentElement.addEventListener("pointerleave", hide);
      window.addEventListener("blur", hide);

      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerover", onOver);
        document.removeEventListener("pointerout", onOut);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        document.documentElement.removeEventListener("pointerleave", hide);
        window.removeEventListener("blur", hide);
        ring.classList.remove("is-press", "is-link", "is-label");
        dot.classList.remove("is-shrink");
      };
    },
    { dependencies: [enabled], revertOnUpdate: true },
  );

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  );
}
