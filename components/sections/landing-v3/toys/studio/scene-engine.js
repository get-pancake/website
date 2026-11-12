// "Run your revenue engine from Claude."
// The engine: one stand, and on it the three things the 1-2-3 builds, small. Your tables (a pile
// of rows), the market's signals (a radar), your Brain (the toy brain of brain.js). A cable
// leaves it for Claude's window, which is the page's own type, over the picture.

import { brainPiece } from "./brain.js";
import { C, TONE, bead, block, cable, ceramic, mesh, puck, slab, soft } from "./parts.js";

const STAND = { w: 5.9, h: 0.56, d: 4.5, x: 3.72, z: 0.25 };
const TOP = STAND.h;
/** where each part stands on the stand (from its centre) */
const PARTS = {
  brain: [0, -1.12],
  tables: [-1.6, 0.92],
  radar: [1.6, 0.92],
};
/** the cable: from under Claude's window (the left of the picture) to the stand */
const CABLE = [
  [-0.5, 3.72],
  [0.55, 3.72],
  [1.15, 2.6],
  [1.05, 1.5],
  [STAND.x - STAND.w / 2 + 0.3, 1.2],
];

const scene = {
  size: [752, 489],
  camera: { look: [0, 0.4, 0.2], span: 14.6 },
  reach: 12,
  build(s) {
    const { THREE } = s;
    const at = ([x, z], y = TOP) => [STAND.x + x, y, STAND.z + z];

    // the stand, plum, with a cream deck; the cable that leaves it
    const stand = [
      mesh(block(STAND.w, STAND.h, STAND.d, 0.7, 0.14), soft(C.plum, 0.5), [STAND.x, 0, STAND.z]),
      mesh(block(STAND.w - 0.5, 0.12, STAND.d - 0.5, 0.56, 0.05), soft(C.ink20, 0.64), [STAND.x, STAND.h - 0.06, STAND.z]),
    ].map((m) => s.add(m));
    const lead = s.add(cable(CABLE, 0.12));
    s.layer("plate", [...stand, lead]);
    s.cut("stand", stand);
    s.path("cable", CABLE.map(([x, z]) => [x, 0.3, z]), 26);
    s.anchor("front", [STAND.x, STAND.h * 0.5, STAND.z + STAND.d / 2]);
    const deck = TOP + 0.06;

    // your tables: three rows on a foot
    const tables = [mesh(puck(0.86, 0.1, 0.04, 56), soft(C.ink0, 0.6), at(PARTS.tables, deck))];
    ["yellow", "purple", "pink"].forEach((tone, k) => tables.push(slab(TONE[tone], 0.66, 0.24, at(PARTS.tables, deck + 0.1 + k * 0.24))));
    s.layer("tables", tables.map((m) => s.add(m)), { floor: deck });
    s.anchor("tables", at(PARTS.tables, deck));

    // the market's signals: a small radar, one signal on it
    const face = deck + 0.3;
    const radar = [
      mesh(puck(0.88, 0.32, 0.1, 56), soft(C.ink0, 0.6), at(PARTS.radar, deck)),
      mesh(puck(0.74, 0.05, 0.02, 56), ceramic(C.plum, 0.42, 0.35), at(PARTS.radar, face)),
      bead(TONE.green, 0.14, [STAND.x + PARTS.radar[0] + 0.3, face + 0.04, STAND.z + PARTS.radar[1] - 0.22]),
    ];
    s.layer("radar", radar.map((m) => s.add(m)), { floor: deck });
    s.anchor("radar", at(PARTS.radar, deck));
    s.anchor("radar-face", at(PARTS.radar, face + 0.05));
    s.anchor("radar-edge", [STAND.x + PARTS.radar[0] + 0.7, face + 0.05, STAND.z + PARTS.radar[1]]);

    // your Brain: the toy brain of the 1-2-3's third picture, small, on its own puck
    const { piece, height } = brainPiece(THREE, 0.74, 220);
    const seat = deck + 0.1;
    const [bx, , bz] = at(PARTS.brain, 0);
    piece.position.set(bx, piece.position.y + seat, bz);
    const heart = at(PARTS.brain, seat + height * 0.5);
    const brain = [mesh(puck(0.92, 0.1, 0.04, 48), soft(C.ink0, 0.6), at(PARTS.brain, deck)), piece];
    s.layer("brain", brain.map((m) => s.add(m)), { floor: deck });
    s.anchor("brain", at(PARTS.brain, deck));
    s.anchor("brain-heart", heart);
  },
};

export default scene;
