// Pancake brand colors, copied from app/_styles/landing-v3/foundation.css (the --lp-* tokens).
// The scene uses no color outside this file, apart from the cooked-pancake browns, which are
// mixes of yellow-30 and yellow-40.

export const C = {
  page: "#fbf6f1",

  ink0: "#ffffff",
  ink10: "#fffbf6",
  ink20: "#fff7ec",
  ink30: "#f7ede5",
  ink40: "#efe4dc",
  ink50: "#ddcfcd",
  ink60: "#bba8ae",
  ink70: "#9a818f",
  ink80: "#85687c",
  ink90: "#6c4b65",
  plum: "#2c002a",

  pink10: "#ffd9da",
  pink20: "#ffbbc7",
  pink30: "#ff7aa0",
  pink40: "#e33a6a",

  purple10: "#efddf1",
  purple20: "#dec3f5",
  purple30: "#ba8bff",
  purple40: "#8d43fd",

  yellow10: "#ffe9d1",
  yellow20: "#ffdbb5",
  yellow30: "#ffbd7a",
  yellow40: "#f38f43",

  blue10: "#d9e9ff",
  blue20: "#b0cbff",
  blue30: "#6a8fff",
  blue40: "#4660e7",

  green10: "#ceead5",
  green20: "#68cea7",
  green30: "#037d48",

  orange20: "#ffa45f",
  orange30: "#d43900",
  red20: "#ff8080",
};

// Food colors: batter is yellow-10, a cooked face sits between yellow-30 and yellow-40.
export const FOOD = {
  batter: "#ffe9d1",
  batterDeep: "#ffdcb4",
  crumb: "#ffcf9a",
  golden: "#f6a45c",
  syrup: "#e2752b",
};

/** The three tones of the landing page (VisionTone in lp-vision-data.ts). */
export const TONES = {
  yellow: { c10: C.yellow10, c20: C.yellow20, c30: C.yellow30, c40: C.yellow40 },
  purple: { c10: C.purple10, c20: C.purple20, c30: C.purple30, c40: C.purple40 },
  pink: { c10: C.pink10, c20: C.pink20, c30: C.pink30, c40: C.pink40 },
};

export const TONE_NAMES = ["yellow", "purple", "pink"];
