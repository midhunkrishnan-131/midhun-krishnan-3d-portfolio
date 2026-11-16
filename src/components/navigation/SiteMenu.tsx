"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { sectionHref, sections } from "@/data/navigation";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen chapter index. The panel markup is always rendered (so the 11 section
 * links are in the server HTML) and made inert/hidden while closed.
 * - aria-expanded / aria-controls on the toggle
 * - focus moves into the dialog on open, is trapped (toggle + links) while open, and returns on close
 * - Escape closes; page scroll is locked while open
 * - motion is CSS-only and disabled under prefers-reduced-motion (motion-safe:)
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current || !toggleRef.current)
        return;
      // Trap focus within the toggle (Close) + the panel's links.
      const nodes = [
        toggleRef.current,
        ...Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ),
      ];
      const index = nodes.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const next = event.shiftKey
        ? (index <= 0 ? nodes.length : index) - 1
        : (index + 1) % nodes.length;
      nodes[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[60] inline-flex items-center gap-3 rounded-pill border border-line-strong px-4 py-2 text-micro font-medium uppercase transition-colors duration-(--duration-base) hover:border-paper"
      >
        <span>{open ? "Close" : "Index"}</span>
        <span aria-hidden="true" className="relative block h-2.5 w-4">
          <span
            className={cn(
              "absolute left-0 block h-px w-4 bg-paper transition-transform duration-(--duration-base) ease-out-expo",
              open ? "top-1 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-px w-4 bg-paper transition-transform duration-(--duration-base) ease-out-expo",
              open ? "top-1 -rotate-45" : "top-2",
            )}
          />
        </span>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open}
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-ink-950/97 backdrop-blur-sm",
          "motion-safe:duration-(--duration-slow) motion-safe:ease-cinematic",
          // Visibility flips instantly on open (so focus can move in) and only after the fade on close.
          open
            ? "visible opacity-100 motion-safe:transition-opacity"
            : "invisible opacity-0 motion-safe:transition-[opacity,visibility]",
        )}
      >
        <div className="mx-auto flex min-h-full max-w-[96rem] flex-col justify-between gap-12 px-(--gutter) pt-[calc(var(--header-height)+3rem)] pb-12">
          <p
            id={titleId}
            className="text-micro font-medium text-paper-faint uppercase"
          >
            Chapters
          </p>
          <nav aria-label="Chapters">
            <ol className="grid gap-x-12 gap-y-1 md:grid-cols-2">
              {sections.map((section, index) => (
                <li
                  key={section.id}
                  className={cn(
                    "motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-slow) motion-safe:ease-out-expo",
                    open
                      ? "translate-y-0 opacity-100"
                      : "opacity-0 motion-safe:translate-y-4",
                  )}
                  style={{
                    transitionDelay: open ? `${80 + index * 35}ms` : "0ms",
                  }}
                >
                  <Link
                    href={sectionHref(section.id)}
                    onClick={() => close(false)}
                    className="group flex items-baseline gap-5 border-b border-line py-4"
                  >
                    <span className="text-micro text-ember tabular-nums">
                      {section.number}
                    </span>
                    <span className="font-display text-[clamp(1.75rem,1.2rem+2vw,3.25rem)] leading-none text-paper transition-colors duration-(--duration-base) group-hover:text-ember-soft">
                      {section.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <p className="text-micro text-paper-faint uppercase">
            Midhun Krishnan — A Story Still Being Written
          </p>
        </div>
      </div>
    </>
  );
}
