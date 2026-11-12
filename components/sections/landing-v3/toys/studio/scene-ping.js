// "Bring you the next deal before you ask."
// A phone lying on the table, asleep. It lights up by itself: your agent writes first. The
// messages are the page's own type, over the picture; this set is the phone.

import { C, block, ceramic, group, mesh, puck, soft } from "./parts.js";

const PHONE = { w: 3.5, h: 0.36, d: 6.9, x: -4.25, z: 0.15, turn: -9 };
const SCREEN = { w: 3.06, d: 6.46, h: 0.06 };

const scene = {
  size: [752, 489],
  camera: { look: [0, 0.4, -0.2], span: 14.6 },
  reach: 12,
  build(s) {
    const turn = (PHONE.turn * Math.PI) / 180;
    const place = (...parts) => {
      const g = group([PHONE.x, 0, PHONE.z], ...parts);
      g.rotation.y = turn;
      return s.add(g);
    };
    // the phone, asleep: a plum body, a dark glass
    const body = mesh(block(PHONE.w, PHONE.h, PHONE.d, 0.78, 0.13), soft(C.plum, 0.46));
    const glass = mesh(block(SCREEN.w, SCREEN.h, SCREEN.d, 0.6, 0.02), ceramic("#170015", 0.22, 0.8), [0, PHONE.h - 0.02, 0]);
    s.layer("plate", place(body, glass));

    // the same glass, lit, with what just came in: one card, a mark and two lines of it
    const top = PHONE.h - 0.02;
    const lit = mesh(block(SCREEN.w, SCREEN.h, SCREEN.d, 0.6, 0.02), soft(C.ink10, 0.5), [0, top, 0]);
    const card = mesh(block(2.56, 0.07, 1.5, 0.36, 0.025), soft(C.ink0, 0.5), [0, top + SCREEN.h - 0.01, -2.05]);
    const mark = mesh(puck(0.3, 0.06, 0.025, 40), ceramic("#e8704e", 0.4, 0.4), [-0.78, top + SCREEN.h + 0.05, -2.05]);
    const lines = [
      mesh(block(1.1, 0.045, 0.2, 0.1, 0.015), soft(C.ink60, 0.6), [0.32, top + SCREEN.h + 0.05, -2.28]),
      mesh(block(1.36, 0.045, 0.2, 0.1, 0.015), soft(C.ink50, 0.6), [0.45, top + SCREEN.h + 0.05, -1.86]),
    ];
    // (drawn alone, without the ground: it is laid over the glass, which keeps its own shadow)
    s.layer("lit", place(lit, card, mark, ...lines), { shadow: false });

    s.anchor("phone", [PHONE.x, PHONE.h, PHONE.z]);
    s.anchor("card", [PHONE.x + 0.3, PHONE.h + 0.2, PHONE.z - 2.05]);
    s.anchor("edge-x", [PHONE.x + PHONE.w / 2, 0, PHONE.z]);
    s.anchor("edge-z", [PHONE.x, 0, PHONE.z + PHONE.d / 2]);
    s.anchor("foot", [PHONE.x, 0, PHONE.z]);
  },
};

export default scene;
