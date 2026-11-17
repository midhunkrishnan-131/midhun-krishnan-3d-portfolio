"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

/**
 * Midhun's real photograph, shown once in the site footer.
 * The file is `/images/profile.jpg`. Until it is supplied, the frame stays
 * empty — the illustrated About avatar is never used as a stand-in.
 */
export function FooterPortrait() {
  const reduced = usePrefersReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"pending" | "ready" | "missing">(
    "pending",
  );
  const fine = useRef(false);

  useEffect(() => {
    let live = true;
    fetch("/images/profile.jpg", { method: "HEAD" })
      .then((res) => {
        if (live) setStatus(res.ok ? "ready" : "missing");
      })
      .catch(() => {
        if (live) setStatus("missing");
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    fine.current = mq.matches;
    const onChange = () => {
      fine.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !fine.current || status !== "ready") return;
    const el = stage.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
  };

  const onLeave = () => {
    const el = stage.current;
    if (!el) return;
    el.style.transform = "perspective(700px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div
      ref={stage}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "footer-portrait group relative mx-auto aspect-square w-[168px] shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.77,0,0.18,1)] sm:mx-0 sm:w-[184px]",
        !reduced && "footer-portrait-enter",
        reduced && "avatar-fade",
      )}
      style={{ transform: "perspective(700px) rotateY(0deg) rotateX(0deg)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,176,138,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(90,154,98,0.12),transparent_50%)] opacity-80"
      />
      <div className="relative h-full w-full overflow-hidden rounded-full border border-line shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(233,231,226,0.12)]">
        {status !== "missing" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/profile.jpg"
            alt={`Photograph of ${site.name}`}
            width={368}
            height={368}
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("missing")}
            className={cn(
              "h-full w-full object-cover object-center transition-opacity duration-500",
              status === "ready" ? "opacity-100" : "opacity-0",
            )}
          />
        ) : null}
        {status !== "ready" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-800 px-6 text-center">
            <p className="font-mono text-micro tracking-[0.18em] text-paper-faint uppercase">
              Portrait
            </p>
            {status === "missing" ? (
              <p className="mt-2 text-sm text-paper-dim">To be added</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
