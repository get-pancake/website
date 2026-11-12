// 01 · "Connect your sources. Pancake builds the tables."
// Four sources at the back, each on its cable into the machine; the machine turns; two piles of
// rows come up in front of it, one per table.

import { C, TONE, bead, block, cable, group, mesh, puck, slab, soft, ceramic } from "./parts.js";

/** the sources, left to right: where each one stands and its tone */
const DOCKS = [
  { x: -3.9, tone: "yellow" },
  { x: -1.3, tone: "pink" },
  { x: 1.3, tone: "purple" },
  { x: 3.9, tone: "blue" },
];
const DOCK_Z = -3.25;
const MACHINE = { w: 4.6, h: 1.15, d: 2.4, lid: 0.2 };
const INLETS = [-1.35, -0.45, 0.45, 1.35];
const PILES = [-2.35, 2.35];
const PILE_Z = 3.3;
const SLAB = { r: 0.98, h: 0.3 };
const FOOT = 0.14;
/** the tone of each row, bottom to top: the sources take turns (lp-toy-step-timelines.ts sends
    the beads in this order) */
const ROWS = [
  ["yellow", "purple", "pink", "blue", "yellow"],
  ["pink", "blue", "yellow", "purple", "pink"],
];
const TONES = ["yellow", "pink", "purple", "blue"];

const scene = {
  size: [464, 426],
  camera: { look: [0, 0.4, -0.5], span: 12.2 },
  build(s) {
    const plate = [];
    const docks = [];
    // the sources: a white dock with a button in its tone
    DOCKS.forEach((dock, i) => {
      const body = mesh(block(1.8, 0.46, 1.5, 0.38, 0.1), soft(C.ink0, 0.6), [dock.x, 0, DOCK_Z]);
      const button = mesh(puck(0.5, 0.15, 0.07, 48), ceramic(TONE[dock.tone], 0.42, 0.4), [dock.x, 0.44, DOCK_Z]);
      plate.push(s.add(body), s.add(button));
      // its cable, on the ground, into the back of the machine
      const line = [
        [dock.x, DOCK_Z + 0.62],
        [dock.x, DOCK_Z + 1.2],
        [INLETS[i], -1.9],
        [INLETS[i], -0.9],
      ];
      // (a drawing of its own: the page draws it in as the source connects)
      s.layer(`cable${i}`, s.add(cable(line, 0.11)));
      docks.push(body, button);
      s.anchor(`dock${i}`, [dock.x, 0.62, DOCK_Z]);
      s.anchor(`name${i}`, [dock.x, 0.46, DOCK_Z - 0.75]);
      s.path(`cable${i}`, line.map(([x, z]) => [x, 0.36, z]), 10);
    });

    // the machine: a plum body, a cream lid, a turntable the beads ride round its hub
    const top = MACHINE.h + MACHINE.lid;
    const body = mesh(block(MACHINE.w, MACHINE.h, MACHINE.d, 0.5, 0.12), soft(C.plum, 0.5));
    const lid = mesh(block(MACHINE.w - 0.44, MACHINE.lid + 0.1, MACHINE.d - 0.44, 0.42, 0.08), soft(C.ink20, 0.62), [0, MACHINE.h - 0.1, 0]);
    const table = mesh(puck(1.06, 0.1, 0.05, 72), soft(C.plum, 0.48), [0, top - 0.03, 0]);
    const track = mesh(puck(0.98, 0.04, 0.02, 72), soft("#4a1446", 0.5), [0, top + 0.05, 0]);
    const hub = mesh(puck(0.5, 0.1, 0.05, 56), soft(C.ink0, 0.55), [0, top + 0.07, 0]);
    // the two mouths the rows come out of, on its front
    const mouths = PILES.flatMap((x) => [
      mesh(block(1.5, 0.56, 0.4, 0.24, 0.07), soft(C.ink20, 0.62), [x * 0.6, 0.2, MACHINE.d / 2 - 0.2]),
      mesh(block(1.14, 0.26, 0.3, 0.12, 0.04), soft("#170015", 0.8), [x * 0.6, 0.35, MACHINE.d / 2 - 0.08]),
    ]);
    // two lamps on the lid, either side of the turntable
    const lamps = [-1.62, 1.62].map((x) => mesh(puck(0.17, 0.09, 0.04, 32), ceramic(C.green20, 0.4, 0.5), [x, top, 0.42]));
    const machine = [body, lid, table, track, hub, ...mouths, ...lamps].map((m) => s.add(m));
    plate.push(...machine);
    s.cut("machine", machine);
    s.cut("docks", docks);
    s.anchor("hub", [0, top + 0.17, 0]);
    // the beads that ride the turntable: one drawing each, moved round the hub by the page
    const RING = 0.75;
    TONES.forEach((tone) => s.layer(`bead-${tone}`, s.add(bead(TONE[tone], 0.2)), { shadow: false }));
    s.anchor("bead", [0, 0.2, 0]);
    s.anchor("ring-x", [RING, top + 0.29, 0]);
    s.anchor("ring-z", [0, top + 0.29, RING]);
    s.anchor("ring-o", [0, top + 0.29, 0]);

    // the tables: a foot, then the rows as they pile up (one drawing per height of the pile)
    PILES.forEach((x, side) => {
      const name = side === 0 ? "pile-l" : "pile-r";
      const foot = s.add(mesh(puck(1.22, FOOT, 0.06, 64), soft(C.ink20, 0.66), [x, 0, PILE_Z]));
      const rows = ROWS[side].map((tone, k) => s.add(slab(TONE[tone], SLAB.r, SLAB.h, [x, FOOT + k * SLAB.h, PILE_Z])));
      for (let n = 0; n <= rows.length; n++) s.layer(`${name}-${n}`, [foot, ...rows.slice(0, n)]);
      ROWS[side].forEach((tone, k) => s.anchor(`${name}-row${k}`, [x, FOOT + k * SLAB.h + SLAB.h / 2, PILE_Z]));
      s.anchor(`${name}-mouth`, [x * 0.6, 0.5, MACHINE.d / 2]);
      s.anchor(`${name}-label`, [x, 0, PILE_Z + 1.22]);
    });
    // a row on its own, per tone, at the origin: the page drops it where it lands
    TONES.forEach((tone) => s.layer(`row-${tone}`, s.add(slab(TONE[tone], SLAB.r, SLAB.h, [0, 0, 0])), { shadow: false }));
    s.anchor("row", [0, SLAB.h / 2, 0]);

    s.layer("plate", plate);
  },
};

export default scene;
