// "Remember every touch with every buyer."
// A track across the picture and four stops on it. One buyer, a pawn, goes from stop to stop;
// each stop it reaches takes its colour and keeps its date.

import { C, TONE, ceramic, mesh, pawn, puck, soft, tube } from "./parts.js";

/** the stops, left to right: the touches, in the order they happened */
const STOPS = [
  { tone: "pink", x: -4.75, z: 2.35 },
  { tone: "purple", x: -1.55, z: 0.45 },
  { tone: "yellow", x: 1.65, z: -0.15 },
  { tone: "green", x: 4.85, z: -2.2 },
];
/** the track comes in from the lower left of the picture and leaves by its upper right */
const IN = [-9.6, 2.5];
const OUT = [9.6, -2.6];
const TRACK = { r: 0.56, flat: 0.17 };
const STOP = { r: 0.8, h: 0.22 };
/** the height of the track's top, and of a stop's */
const ROAD = 2 * TRACK.r * TRACK.flat;
const DECK = ROAD + STOP.h - 0.04;

const scene = {
  size: [752, 489],
  camera: { look: [0, 0.4, -0.5], span: 14.6 },
  reach: 13,
  build(s) {
    const { THREE } = s;
    const through = [IN, ...STOPS.map((stop) => [stop.x, stop.z]), OUT];
    const road = mesh(tube(through.map(([x, z]) => [x, 0, z]), TRACK.r, 220), soft(C.ink40, 0.7));
    road.scale.y = TRACK.flat;
    road.position.y = TRACK.r * TRACK.flat;
    const plate = [s.add(road)];

    STOPS.forEach((stop, k) => {
      // a stop nobody has reached yet is white; reached, it takes its tone (a drawing laid over it)
      plate.push(s.add(mesh(puck(STOP.r, STOP.h, 0.08, 64), soft(C.ink0, 0.6), [stop.x, ROAD - 0.04, stop.z])));
      s.layer(`on${k}`, s.add(mesh(puck(STOP.r, STOP.h, 0.08, 64), ceramic(TONE[stop.tone], 0.42, 0.4), [stop.x, ROAD - 0.04, stop.z])), { shadow: false });
      s.anchor(`stop${k}`, [stop.x, DECK, stop.z]);
      s.anchor(`over${k}`, [stop.x, DECK + 1.62, stop.z]);
    });
    s.layer("plate", plate);

    // the buyer: one drawing, moved along the track by the page
    s.layer("pawn", s.add(pawn(C.plum, 1.28, [0, DECK, 0], "ceramic")), { floor: DECK });
    s.anchor("pawn", [0, DECK, 0]);

    // the way from one stop to the next, along the track's own curve
    const curve = new THREE.CatmullRomCurve3(through.map(([x, z]) => new THREE.Vector3(x, DECK, z)), false, "catmullrom", 0.5);
    const legs = through.length - 1;
    for (let leg = 0; leg < STOPS.length; leg++) {
      const points = [];
      const steps = 14;
      // (the first leg starts where the track comes into the picture)
      const from = leg === 0 ? 0.42 : 0;
      for (let i = 0; i <= steps; i++) {
        const u = (leg + from + ((1 - from) * i) / steps) / legs;
        const p = curve.getPoint(u);
        points.push([p.x, p.y, p.z]);
      }
      s.line(`leg${leg}`, points);
    }
  },
};

export default scene;
