// The parts the seven sets share. Everything is a rounded block, a puck, a bead or a tube, in the
// kitchen's finishes: the sets differ by what they put where, not by how a thing is made.

import * as THREE from "three";
import { block, capsule, cylinder, dome, lathe, puck, sphere, tube } from "../../kitchen/geo.js";
import { ceramic, glow, soft } from "../../kitchen/mats.js";
import { C } from "../../kitchen/palette.js";

export { C, block, capsule, ceramic, cylinder, dome, glow, lathe, puck, soft, sphere, tube };

/** the tones a signal, a source or a touch can take */
export const TONE = {
  yellow: C.yellow30,
  pink: C.pink30,
  purple: C.purple30,
  blue: C.blue30,
  green: C.green20,
  orange: C.orange20,
};

export function mesh(geometry, material, position = [0, 0, 0]) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(position[0], position[1], position[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function group(position, ...children) {
  const g = new THREE.Group();
  g.position.set(position[0], position[1], position[2]);
  for (const child of children.flat()) if (child) g.add(child);
  return g;
}

/** a bead: a signal, a datapoint, a touch */
export function bead(color, r = 0.2, position = [0, 0, 0]) {
  return mesh(sphere(r, 40, 28), ceramic(color, 0.34, 0.55), [position[0], position[1] + r, position[2]]);
}

/** a slab: a row of a table, a line of a record. Its base on y = 0. */
export function slab(color, r = 1, h = 0.3, position = [0, 0, 0]) {
  return mesh(puck(r, h, Math.min(0.13, h / 2 - 0.01), 64), soft(color, 0.7), position);
}

/** a cable lying on the ground along `points` (x, z pairs or x, y, z) */
export function cable(points, r = 0.1, color = C.plum) {
  const pts = points.map((p) => (p.length === 2 ? [p[0], r, p[1]] : p));
  const m = mesh(tube(pts, r, Math.max(24, pts.length * 12)), soft(color, 0.55));
  return m;
}

/** a pawn: a person. `h` is its height; the base stands on y = 0. */
export function pawn(color, h = 1.25, position = [0, 0, 0], finish = "soft") {
  const k = h / 1.25;
  const body = lathe(
    `pawn:${k}`,
    [
      [0, 0],
      [0.36 * k, 0],
      [0.4 * k, 0.05 * k],
      [0.4 * k, 0.12 * k],
      [0.33 * k, 0.26 * k],
      [0.22 * k, 0.55 * k],
      [0.17 * k, 0.74 * k],
      [0.1 * k, 0.82 * k],
      [0, 0.84 * k],
    ],
    48,
  );
  const material = finish === "ceramic" ? ceramic(color, 0.36, 0.5) : soft(color, 0.62);
  return group(position, mesh(body, material), mesh(sphere(0.27 * k, 40, 28), material, [0, 0.98 * k, 0]));
}
