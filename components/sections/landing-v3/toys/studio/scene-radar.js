// 02 · "Connect the dots with market signals."
// A radar lying flat, one account at its centre. A beam turns; each time it passes a signal, a
// bead lands there; a line then connects the dots, into the account.

import { C, TONE, bead, block, ceramic, mesh, puck, soft } from "./parts.js";

/** web traffic's own orange, clear of the team's yellow beside it */
const BLIP_TONE = { ...TONE, orange: "#ff8a3d" };

const BASE = { r: 4.5, h: 0.55 };
const SCREEN = { r: 4.16, h: 0.1 };
/** the height of the radar's face: what lies on it stands here */
const TOP = BASE.h + SCREEN.h - 0.02;
/** the signals, in the order the beam meets them: the angle on the face (degrees, clockwise on
    the picture from its right) and how far from the centre. Each one nearer than the last. */
const BLIPS = [
  { tone: "yellow", angle: 315, r: 3.4 },
  { tone: "green", angle: 385, r: 3.2 },
  { tone: "orange", angle: 495, r: 3.0 },
  { tone: "purple", angle: 552, r: 3.0 },
];
const ACCOUNT = { w: 1.5, h: 0.78, cap: 0.14 };

const scene = {
  size: [464, 426],
  camera: { look: [0, 0.4, -0.42], span: 11.5 },
  build(s) {
    const base = s.add(mesh(puck(BASE.r, BASE.h, 0.2, 96), soft(C.ink20, 0.64)));
    const screen = s.add(mesh(puck(SCREEN.r, SCREEN.h, 0.04, 96), ceramic(C.plum, 0.42, 0.35), [0, BASE.h - 0.02, 0]));
    s.layer("plate", [base, screen]);
    s.anchor("centre", [0, TOP, 0]);
    s.anchor("edge-x", [SCREEN.r, TOP, 0]);
    s.anchor("edge-z", [0, TOP, SCREEN.r]);

    // the account, a drawing of its own: what is drawn on the face passes under it
    const account = [
      mesh(block(ACCOUNT.w, ACCOUNT.h, ACCOUNT.w, 0.4, 0.1), soft(C.ink0, 0.58), [0, TOP, 0]),
      mesh(puck(0.44, ACCOUNT.cap, 0.06, 48), ceramic(C.pink30, 0.4, 0.45), [0, TOP + ACCOUNT.h - 0.02, 0]),
    ].map((m) => s.add(m));
    s.layer("account", account, { floor: TOP });
    s.anchor("account", [0, TOP + ACCOUNT.h + ACCOUNT.cap + 0.3, 0]);
    s.anchor("account-foot", [0, TOP, ACCOUNT.w / 2]);

    // the signals: a bead each, on the face
    BLIPS.forEach((blip, k) => {
      const a = (blip.angle * Math.PI) / 180;
      const x = Math.cos(a) * blip.r;
      const z = Math.sin(a) * blip.r;
      s.layer(`blip${k}`, s.add(bead(BLIP_TONE[blip.tone], 0.26, [x, TOP, z])), { floor: TOP });
      s.anchor(`blip${k}`, [x, TOP, z]);
      s.anchor(`over${k}`, [x, TOP + 0.74, z]);
    });
  },
};

export default scene;
