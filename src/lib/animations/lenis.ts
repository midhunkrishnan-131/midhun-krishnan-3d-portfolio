import type Lenis from "lenis";

/** The single Lenis instance (null when reduced motion is on or before mount). */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};
export const getLenis = () => instance;
