/** Shared colour + light presets for every scene (mirrors the CSS tokens). */
export const palette = {
  ink: "#0a0a0b",
  ink800: "#1a1a1d",
  ink700: "#26262a",
  paper: "#ede8df",
  paperDim: "#b4aea4",
  ember: "#ff7a45",
  emberSoft: "#ffb08a",
} as const;

export const lightRig = {
  ambient: 0.18,
  key: { position: [-4, 5, 4] as const, intensity: 2.4, color: palette.paper },
  rim: { position: [5, 2, -4] as const, intensity: 3.2, color: palette.ember },
  fill: {
    position: [3, -2, 5] as const,
    intensity: 0.5,
    color: palette.paperDim,
  },
} as const;
