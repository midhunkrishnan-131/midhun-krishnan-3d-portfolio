"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { getLenis, setLenis } from "@/lib/animations/lenis";

/**
 * One animation clock for the whole site: Lenis is driven by gsap.ticker (no second RAF),
 * ScrollTrigger updates on every Lenis scroll, and the 3D canvas advances from the same ticker
 * (see SceneCanvas). With prefers-reduced-motion Lenis is never created: native scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis || query.matches) return;
      lenis = new Lenis({
        autoRaf: false,
        anchors: { offset: -72 },
        lerp: 0.08,
        smoothWheel: true,
        // Native touch scrolling: smoothed touch feels laggy and fights the address bar.
        syncTouch: false,
        wheelMultiplier: 0.9,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      setLenis(lenis);
      root.dataset.lenis = "on";
    };
    const stop = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      setLenis(null);
      delete root.dataset.lenis;
    };
    gsap.ticker.lagSmoothing(0);
    start();
    const onPref = () => (query.matches ? stop() : start());
    query.addEventListener("change", onPref);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("gl-layout-change", refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    return () => {
      query.removeEventListener("change", onPref);
      window.removeEventListener("gl-layout-change", refresh);
      window.removeEventListener("load", refresh);
      stop();
    };
  }, []);

  // Route change: jump to top (or the hash target) and re-measure triggers.
  useEffect(() => {
    if (!window.location.hash)
      getLenis()?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
