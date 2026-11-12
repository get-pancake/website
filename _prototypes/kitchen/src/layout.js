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

/** the three intake belts: each ends over the bowl. `len` runs from the tunnel mouth to the end. */
export const INTAKE = {
  y: 1.5,
  width: 0.84,
  speed: 0.62,
  gap: 1.02, // distance between two ingredients on a belt
  belts: [
    { id: "left", dir: [1, 0], len: 4.3, kinds: ["flour", "butter", "milk", "flour", "egg"] },
    { id: "corner", dir: [SQ, SQ], len: 3.6, kinds: ["egg", "sugar", "strawberry", "egg", "berry"] },
    { id: "back", dir: [0, 1], len: 2.75, kinds: ["milk", "berry", "butter", "sugar"] },
  ],
};
for (const b of INTAKE.belts) {
  b.to = [BOWL.x - b.dir[0] * BELT_END, BOWL.z - b.dir[1] * BELT_END];
  b.from = [b.to[0] - b.dir[0] * b.len, b.to[1] - b.dir[1] * b.len];
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
  bell: [3.03, 1.0],
  stack: [4.6, -0.6],
  caddy: { z: -1.55, xs: [3.3, 3.95, 4.6], tones: ["yellow", "purple", "pink"] },
  plateR: 0.62,
};

export const OUT = { z: 0.5, x0: 5.3, x1: 9.0, y: 0.95, width: 1.5, speed: 0.5, portalX: 8.72, exitX: 8.5 };

export const RAIL = {
  y: 3.05,
  z: -2.5,
  x0: -3.3,
  x1: 3.0,
  slot0: 2.3, // the ticket that ships next hangs here
  pitch: 0.92,
  printer: -3.22,
  ticketW: 0.74,
  ticketH: 1.04,
};

export const CHEFS = {
  mixer: { home: [-2.72, 1.08], order: ["yellow", "purple", "pink"], scale: 1.2 },
  cook: { z: 2.12, order: ["pink", "yellow", "purple"], scale: 1.24 },
  plater: { home: [3.72, 2.12], order: ["purple", "pink", "yellow"], scale: 1.16 },
};

/**
 * What the camera has to frame: the slab with its shadow, then each tall thing as its own box
 * (a single box around everything would leave the corners of the picture empty).
 */
export const FRAME = [
  { min: [-10.25, -1.1, -4.55], max: [10.15, 0.1, 3.35] }, // the slab
  { min: [-9.75, 0, -1.15], max: [-8.55, 2.7, 0.55] }, // the left tunnel
  { min: [-8.2, 0, -4.2], max: [-6.3, 2.7, -2.3] }, // the corner tunnel
  { min: [-5.05, 0, -4.1], max: [-3.35, 2.7, -2.9] }, // the back tunnel
  { min: [-3.75, 0, -2.85], max: [3.2, 3.55, -2.15] }, // the printer and the rail
  { min: [7.75, 0, -0.75], max: [9.6, 3.5, 1.75] }, // the way out and its counter
  { min: [7.5, 3.1, 0.9], max: [8.5, 4.2, 1.2] }, // the "+1" that rises
];
export const CENTRE = [-0.05, 0.9, -0.6];
