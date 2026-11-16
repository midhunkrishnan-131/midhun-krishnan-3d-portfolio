import localFont from "next/font/local";

/**
 * Self-hosted fonts (latin subset woff2 in /public/fonts), loaded through next/font
 * so they are hashed, preloaded and get metric-matched fallbacks (no CLS).
 * Families: Inter (variable, body/UI) + Instrument Serif (display).
 */
export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter-latin-variable.woff2",
      weight: "300 700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const instrumentSerif = localFont({
  src: [
    {
      path: "../../public/fonts/instrument-serif-latin-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/instrument-serif-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
