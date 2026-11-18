// Where everything stands, in world units (one unit is one floor tile; y is up, +z comes
// towards the camera). The kitchen reads left to right: belts bring ingredients into the bowl,
// the griddle cooks, the pass plates, the last belt carries the stacks out.

export const FLOOR = {
  cols: 19,
  rows: 7,
  x0: -9.6, // left edge of the tiles
  z0: -4.1, // back edge of the tiles
  slabW: 19.8,
  slabD: 7.8,
  slabH: 0.62,
};
FLOOR.cx = FLOOR.x0 + FLOOR.cols / 2;
FLOOR.cz = FLOOR.z0 + FLOOR.rows / 2;

export const BOWL = { x: -4.2, z: -0.3, r: 1.2, base: 0.13, h: 1.15, batterY: 1.0, batterR: 1.0 };
BOWL.rim = BOWL.base + BOWL.h;

const SQ = Math.SQRT1_2;
const BELT_END = 1.02; // how far inside the rim a belt ends

/**
 * The three intake belts: each ends over the bowl. `len` runs from the tunnel mouth to the end.
 * The last `tip` of each belt overhangs the bowl past its support: it is the part that gives
 * way when the kitchen runs without Pancake.
 */
export const INTAKE = {
  y: 1.5,
  width: 0.84,
  speed: 0.62,
  gap: 1.02, // distance between two ingredients on a belt
  tip: 1.05,
  belts: [
    {
      id: "left",
      dir: [1, 0],
      len: 4.3,
      kinds: ["flour", "butter", "milk", "flour", "egg"],
    },
    {
      id: "corner",
      dir: [SQ, SQ],
      len: 3.6,
      kinds: ["egg", "sugar", "strawberry", "egg", "berry"],
    },
    {
      id: "back",
      dir: [0, 1],
      len: 2.75,
      kinds: ["milk", "berry", "butter", "sugar"],
    },
  ],
};
for (const b of INTAKE.belts) {
  b.to = [BOWL.x - b.dir[0] * BELT_END, BOWL.z - b.dir[1] * BELT_END];
  b.from = [b.to[0] - b.dir[0] * b.len, b.to[1] - b.dir[1] * b.len];
  // where the tip hinges on the support
  b.hinge = [b.to[0] - b.dir[0] * INTAKE.tip, b.to[1] - b.dir[1] * INTAKE.tip];
}

export const GRIDDLE = {
  x: 0.35,
  z: -0.4,
  w: 4.3,
  d: 3.3,
  top: 0.95, // the counter top
  y: 1.02, // where a pancake sits
  cols: [-1.25, 0, 1.25],
  rows: [-0.95, 0, 0.95], // 0 = back row, 2 = front row
  r: 0.4, // pancake radius
  thick: 0.13,
};

export const PASS = {
  x: 4.05,
  z: -0.4,
  w: 2.5,
  d: 3.3,
  top: 0.95,
  plate: [3.85, 0.5],
  stack: [4.72, -0.5],
  caddy: { z: -1.55, xs: [3.25, 3.85, 4.45], tones: ["yellow", "purple", "pink"] },
  plateR: 0.62,
};

export const OUT = { z: 0.5, x0: 5.3, x1: 9.0, y: 0.95, width: 1.5, speed: 0.5, portalX: 8.72, exitX: 8.5 };

export const RAIL = {
  y: 3.05,
  z: -3.3,
  x0: -3.0,
  x1: 3.3,
  slot0: 2.6, // the ticket that ships next hangs here
  pitch: 0.92,
  ticketW: 0.74,
  ticketH: 1.04,
};
RAIL.printer = RAIL.slot0 - 6 * RAIL.pitch;

/**
 * The two casts, and where each one works. The pancake chefs carry their face on top, so they
 * stand in front of the counters, where the camera sees them whole. The little chefs carry it
 * in front, so they stand behind the line and face us, as behind the pass of a restaurant.
 *   work       +1 when the counters are towards the camera from the chef, -1 when away
 *   nearRow    the row of the griddle the cook reaches first
 *   swing      the mixer's ladle: where it goes back, then forward, as it throws the batter
 */
export const STAGES = {
  pancakes: {
    work: -1,
    nearRow: 2,
    mixer: { home: [-2.72, 1.08], swing: [[-3.6, 2.55, 0.2], [-1.6, 2.0, 0.3]], reach: 1.75 },
    cook: { z: 2.12 },
    plater: { home: [3.72, 2.12] },
    bell: [3.03, 1.0],
  },
  people: {
    work: 1,
    nearRow: 0,
    mixer: { home: [-2.5, -1.38], swing: [[-3.4, 2.55, -0.85], [-1.45, 2.05, -0.95]], reach: 1.9 },
    cook: { z: -2.68 },
    plater: { home: [4.2, -2.68] },
    bell: [5.02, -1.5],
  },
};

export const CAST = {
  pancakes: {
    mixer: { order: ["yellow", "purple", "pink"], scale: 1.2 },
    cook: { order: ["pink", "yellow", "purple"], scale: 1.24 },
    plater: { order: ["purple", "pink", "yellow"], scale: 1.16 },
  },
  people: {
    mixer: { tone: "yellow", skin: "#ffe2c6", hair: "#6c4b65", scale: 1.2 },
    cook: { tone: "pink", skin: "#b9855e", hair: "#2c002a", scale: 1.24 },
    plater: { tone: "purple", skin: "#eec39c", hair: "#f38f43", scale: 1.16 },
  },
};

/**
 * What the camera has to frame: the slab with its shadows, then each tall thing as its own box
 * (a single box around everything would leave the corners of the picture empty).
 * The first box holds everything that lies on the page under the slab: its halo, and the
 * shadow it casts to the right and to the back. A shadow that leaves it is cut by the edge of
 * the picture.
 */
export const FRAME = [
  { min: [-10.7, -1.1, -5.45], max: [10.8, 0.1, 3.9] }, // the slab, its halo and its shadow
  { min: [-9.75, 0, -1.15], max: [-8.55, 2.7, 0.55] }, // the left tunnel
  { min: [-8.2, 0, -4.2], max: [-6.3, 2.7, -2.3] }, // the corner tunnel
  { min: [-5.05, 0, -4.1], max: [-3.35, 2.7, -2.9] }, // the back tunnel
  { min: [-3.45, 0, -3.65], max: [3.5, 3.55, -2.95] }, // the printer and the rail
  { min: [7.75, 0, -0.75], max: [9.6, 3.5, 1.75] }, // the way out and its counter
  { min: [8.3, 3.5, 0.3], max: [9.3, 4.6, 0.8] }, // the "+1" that rises
];
export const CENTRE = [-0.05, 0.9, -0.6];

/**
 * What a phone shows of the kitchen (the `view` option of kitchen.js, given by LpKitchen.tsx under
 * 768 px). It is [left, right, bottom, top] in the camera's units, from the resting angle, looking
 * at CENTRE.
 * On a phone the whole kitchen is as wide as the page's text, and neither side is cut (founder,
 * 2026-11-12: "Faut pas qu'il dépasse des deux côtés"). The window is the kitchen's outline as it
 * is drawn, with its shadow, in both modes and with both casts. It adds 16/358 of the kitchen's
 * width on each side, and 5 % of the picture's height above and below. On phones kitchen.css
 * makes the picture 16/358 wider than the text on each side, so the outline lands on the page's
 * 16 px margins at any width. The window's shape, 390 x 182, is the stage's aspect ratio in
 * kitchen.css.
 *
 * scripts/kitchen-phone-view.mjs measures it on the drawn picture. Measure again after you change
 * what the kitchen spans (the slab, its shadow, a station), then draw the stills again.
 */
export const PHONE_VIEW = [-11.354, 12.789, -6.092, 5.175];
