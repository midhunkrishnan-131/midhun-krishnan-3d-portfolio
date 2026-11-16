const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 0 when the element's top enters the bottom of the viewport, 1 when its bottom leaves the top. */
export function passProgress(el: HTMLElement | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp01((vh - rect.top) / (vh + rect.height));
}

/** 0 while the element's top is at/below the viewport top, 1 once it has scrolled fully past. */
export function exitProgress(el: HTMLElement | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  return clamp01(-rect.top / Math.max(rect.height, 1));
}

/** Frame-rate independent exponential smoothing factor. */
export const damp = (lambda: number, delta: number) =>
  1 - Math.exp(-lambda * delta);

/** For a pinned (sticky) section taller than the viewport: 0 at its top, 1 when the pin releases. */
export function pinProgress(el: HTMLElement | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  return clamp01(-rect.top / Math.max(rect.height - window.innerHeight, 1));
}
