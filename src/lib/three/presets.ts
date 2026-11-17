/** Shared colour + light presets for every scene (mirrors the CSS tokens). */
export const palette = {
  ink: "#000000",
  ink800: "#161616",
  ink700: "#242424",
  paper: "#e9e7e2",
  paperDim: "#b3b0a8",
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
