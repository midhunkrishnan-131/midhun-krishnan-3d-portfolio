export type DisplayMode = "3d" | "flat";

export const DISPLAY_MODE_KEY = "mk-portfolio-display-mode-v2";

/** Query string wins (for tests and shared links); otherwise the saved preference. */
export function readDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "3d";
  const gl = new URLSearchParams(window.location.search).get("gl");
  if (gl === "off") return "flat";
  if (gl === "force") return "3d";
  try {
    const saved = window.localStorage.getItem(DISPLAY_MODE_KEY);
    if (saved === "3d" || saved === "flat") return saved;
  } catch {
    // Private mode can throw; fall through to the default.
  }
  return "3d";
}

export function persistDisplayMode(mode: DisplayMode) {
  try {
    window.localStorage.setItem(DISPLAY_MODE_KEY, mode);
  } catch {
    // Ignore quota / private-mode failures; the session store still updates.
  }
}
