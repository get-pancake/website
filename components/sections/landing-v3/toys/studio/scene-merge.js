// "See one buyer behind three emails."
// Three lanes come in from three sources and meet on one stand. On each lane a pale pawn, the
// same person as that source knows them; on the stand they are one, and keep the three tones.

import { C, ceramic, mesh, pawn, puck, soft, tube } from "./parts.js";

/** the three sightings, back to front: the lane's depth, its tone, and the pale of that tone */
const LANES = [
  { z: -2.75, tone: C.pink30, pale: C.pink20 },
  { z: 0, tone: C.purple30, pale: C.purple20 },
  { z: 2.75, tone: C.blue30, pale: C.blue20 },
];
const FROM_X = -3.0;
const STAND = { x: 4.0, r: 1.85, h: 0.34 };
const LANE = { r: 0.42, flat: 0.19 };
const PAD = { r: 0.82, h: 0.2 };
/** the height of a lane's top, of a pad's and of the stand's */
const ROAD = 2 * LANE.r * LANE.flat;
const DECK = PAD.h;
const TOP = STAND.h;
/** the one record: three thin rings in the three tones under the buyer */
const RING = { r: 0.74, h: 0.11 };

const scene = {
  size: [752, 489],
  camera: { look: [-0.55, 0.4, -0.35], span: 14.6 },
  reach: 12,
  build(s) {
    const plate = [];
    LANES.forEach((lane, k) => {
      // the lane: straight out of its source, then round into the stand
      const line = [
        [FROM_X, lane.z],
        [-1.3, lane.z],
        [0.9, lane.z * 0.42],
        [2.5, lane.z * 0.06],
        [STAND.x, 0],
      ];
      const road = mesh(tube(line.map(([x, z]) => [x, 0, z]), LANE.r, 140), soft(C.ink40, 0.7));
      road.scale.y = LANE.flat;
      road.position.y = LANE.r * LANE.flat;
      plate.push(s.add(road));
      plate.push(s.add(mesh(puck(PAD.r, PAD.h, 0.08, 56), soft(C.ink0, 0.6), [FROM_X, 0, lane.z])));
      plate.push(s.add(mesh(puck(0.5, 0.05, 0.02, 48), ceramic(lane.tone, 0.42, 0.4), [FROM_X, PAD.h - 0.02, lane.z])));
      s.anchor(`pad${k}`, [FROM_X, DECK, lane.z]);
      s.anchor(`head${k}`, [FROM_X, DECK + 1.72, lane.z]);
      // the way a pawn takes: along the lane, up onto the stand, to stop short of its middle
      const stop = [STAND.x - 0.95 + k * 0.1, TOP + 0.05, (k - 1) * 0.62];
      s.path(
        `lane${k}`,
        [
          [FROM_X, DECK + 0.03, lane.z],
          [-1.3, ROAD + 0.03, lane.z],
          [0.9, ROAD + 0.03, lane.z * 0.42],
          [2.1, ROAD + 0.06, lane.z * 0.12],
          stop,
        ],
        22,
      );
      // the same person, as this source knows them: a pawn in the pale of its tone
      s.layer(`ghost${k}`, s.add(pawn(lane.pale, 1.22, [0, 0, 0])), { floor: 0 });
    });
    s.anchor("ghost", [0, 0, 0]);

    // the stand they meet on: cream, with a plum ring
    plate.push(s.add(mesh(puck(STAND.r, STAND.h, 0.12, 80), soft(C.ink20, 0.64), [STAND.x, 0, 0])));
    plate.push(s.add(mesh(puck(STAND.r - 0.3, 0.05, 0.02, 80), soft(C.plum, 0.5), [STAND.x, STAND.h - 0.02, 0])));
    plate.push(s.add(mesh(puck(STAND.r - 0.48, 0.06, 0.02, 80), soft(C.ink20, 0.64), [STAND.x, STAND.h - 0.015, 0])));
    s.layer("plate", plate);
    s.anchor("stand", [STAND.x, TOP + 0.05, 0]);
    s.anchor("stand-edge", [STAND.x + STAND.r - 0.3, TOP + 0.05, 0]);

    // one buyer: the three tones kept as three rings, the pawn on them
    const base = TOP + 0.03;
    const rings = LANES.map((lane, k) => mesh(puck(RING.r - k * 0.07, RING.h, 0.045, 56), ceramic(lane.tone, 0.42, 0.4), [STAND.x, base + k * (RING.h - 0.015), 0]));
    const buyer = pawn(C.plum, 1.32, [STAND.x, base + 3 * (RING.h - 0.015), 0], "ceramic");
    s.layer("buyer", [...rings, buyer].map((m) => s.add(m)), { floor: TOP });
    s.anchor("buyer", [STAND.x, base, 0]);
    s.anchor("over", [STAND.x, base + 3 * RING.h + 1.84, 0]);
  },
};

export default scene;
