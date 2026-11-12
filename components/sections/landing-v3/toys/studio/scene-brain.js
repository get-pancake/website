// 03 · "Your Brain recommends the next best Play."
// The Brain of the app (a dark centre, a hub per kind of knowledge in its colour, what it holds
// as small dots round each hub) as beads and rods that float over the card.

import { C, TONE, ceramic, cylinder, mesh, soft, sphere } from "./parts.js";

/** how high the Brain floats */
const FLOAT = 1.15;
const CENTRE = { r: 0.6 };
/** the hubs: where each one is round the centre (degrees, clockwise on the picture from its
    right), how far, how high, and the dots it holds (each: a turn from the hub's own direction,
    and how far from the hub) */
const HUBS = [
  { tone: "pink", angle: 196, r: 2.45, lift: 0.1, dots: [[-58, 1.0], [-18, 1.3], [22, 1.05], [62, 1.2]] },
  { tone: "purple", angle: 248, r: 2.2, lift: 0.3, dots: [[-50, 1.05], [-8, 1.25], [36, 1.0]] },
  { tone: "green", angle: 306, r: 2.3, lift: 0.25, dots: [[-44, 1.0], [-4, 1.3], [38, 1.1], [76, 0.95]] },
  { tone: "yellow", angle: 4, r: 2.5, lift: 0.05, dots: [[-46, 1.05], [-6, 1.3], [34, 1.05]] },
  { tone: "blue", angle: 62, r: 2.25, lift: -0.1, dots: [[-48, 1.0], [-10, 1.25], [30, 1.05], [70, 1.1]] },
  { tone: "orange", angle: 132, r: 2.3, lift: -0.05, dots: [[-40, 1.05], [0, 1.3], [42, 1.0]] },
];
const HUB_R = 0.31;
const DOT_R = 0.135;
const ROD_R = 0.028;

const rad = (deg) => (deg * Math.PI) / 180;
const at = (angle, r, y) => [Math.cos(rad(angle)) * r, y, Math.sin(rad(angle)) * r];

const scene = {
  size: [464, 426],
  camera: { look: [0, 0.4, 2.05], span: 12.2 },
  shadow: 0.13,
  build(s) {
    const { THREE } = s;
    const rodMat = soft(C.ink50, 0.7);
    /** a rod from a to b: it casts no shadow (the beads' own are enough on the card) */
    const rod = (a, b) => {
      const from = new THREE.Vector3(...a);
      const to = new THREE.Vector3(...b);
      const length = from.distanceTo(to);
      const m = new THREE.Mesh(cylinder(ROD_R, ROD_R, 1, 10), rodMat);
      m.scale.set(1, length, 1);
      m.position.copy(from);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      m.receiveShadow = false;
      m.castShadow = false;
      return m;
    };
    const origin = [0, FLOAT, 0];
    const centre = s.add(mesh(sphere(CENTRE.r, 48, 32), ceramic(C.plum, 0.3, 0.6), origin));
    s.anchor("centre", origin);
    s.anchor("under", [0, FLOAT - CENTRE.r - 0.25, 0]);
    s.anchor("over", [0, FLOAT + CENTRE.r + 0.3, 0]);

    HUBS.forEach((hub, k) => {
      const hubAt = at(hub.angle, hub.r, FLOAT + hub.lift);
      const parts = [rod(origin, hubAt), mesh(sphere(HUB_R, 40, 28), ceramic(TONE[hub.tone], 0.36, 0.5), hubAt)];
      s.anchor(`hub${k}`, hubAt);
      hub.dots.forEach(([turn, far], j) => {
        const a = rad(hub.angle + turn);
        // (a dot hangs a little higher or lower than its hub, by turns)
        const dotAt = [hubAt[0] + Math.cos(a) * far, hubAt[1] + (j % 2 ? 0.16 : -0.12), hubAt[2] + Math.sin(a) * far];
        parts.push(rod(hubAt, dotAt), mesh(sphere(DOT_R, 24, 16), soft(TONE[hub.tone], 0.5), dotAt));
        s.anchor(`dot${k}-${j}`, dotAt);
      });
      s.layer(`hub${k}`, parts.map((m) => s.add(m)));
    });
    // the centre last: it is drawn over the ends of the rods that reach it
    s.layer("centre", centre);
  },
};

export default scene;
