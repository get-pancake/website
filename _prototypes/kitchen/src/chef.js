// A chef: the Pancake mark in 3D. Three pancakes (a light side, a saturated top, as in the
// logo), the two plum eyes on the top one, a small toque and two white gloves. The stack never
// turns: the face always looks at the camera, and only the eyes and the hands point somewhere.

import * as THREE from "three";
import { C, TONES } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import { mesh, group, softShadow } from "./world.js";
import { clamp } from "./util.js";

const LAYERS = [
  { r: 0.53, h: 0.31, off: [-0.06, 0.03] }, // bottom
  { r: 0.5, h: 0.3, off: [0.07, -0.01] }, // middle
  { r: 0.475, h: 0.29, off: [-0.02, 0.02] }, // top: the face
];
const SINK = 0.04; // how far each pancake settles into the one below
const HEAD_TILT = 0.3; // the face leans towards the camera
const LAG = [0, 0.55, 1];
const EYES = [
  { x: -0.14, z: 0.075, rx: 0.073, rz: 0.124 },
  { x: 0.115, z: 0.05, rx: 0.09, rz: 0.15 },
];

export const CHEF_SHOULDER = 0.86; // the height the arms would start from
export const HAND_REST = [
  [-0.64, 0.4, 0.16],
  [0.64, 0.4, 0.16],
];

export function makeChef({ order, scale = 1 }, tex) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const shadow = softShadow(root, tex.blob, 0.03, 0, 1.8, 1.8, 0.36, 0.006);
  const body = group(root);

  const names = [order[2], order[1], order[0]]; // bottom to top
  const layers = [];
  let y = 0;
  LAYERS.forEach((d, i) => {
    const tone = TONES[names[i]];
    const g = group(body, d.off[0], y, d.off[1]);
    const inner = group(g, 0, d.h / 2, 0); // pivots at mid-height
    mesh(G.puck(d.r, d.h, 0.125, 44), M.soft(tone.c20, 0.72), inner, 0, -d.h / 2, 0);
    mesh(G.disc(d.r - 0.132, 40), M.soft(tone.c30, 0.72), inner, 0, d.h / 2 + 0.0015, 0, false).receiveShadow = true;
    layers.push({ g, inner, base: [d.off[0], y, d.off[1]], r: d.r, h: d.h });
    y += d.h - SINK;
  });
  const head = layers[2];
  head.g.position.y += 0.035; // room for the tilt
  head.base[1] += 0.035;
  const top = head.h / 2;

  const eyeMat = M.ceramic(C.plum, 0.2, 1);
  const eyes = EYES.map((e) => {
    const m = mesh(G.sphere(1, 20, 12), eyeMat, head.inner, e.x, top + 0.004, e.z, false);
    m.scale.set(e.rx, 0.03, e.rz);
    return m;
  });

  // the toque, perched at the back of the head
  const hat = group(head.inner, 0.03, top - 0.05, -0.3);
  hat.scale.setScalar(0.9);
  const hatTilt = group(hat);
  const white = M.soft(C.ink0, 0.78);
  mesh(G.cylinder(0.17, 0.155, 0.15, 24), white, hatTilt);
  [
    [0, 0.3, 0, 0.2],
    [-0.14, 0.22, 0.03, 0.135],
    [0.14, 0.22, 0.03, 0.135],
    [0, 0.22, -0.13, 0.135],
    [0, 0.21, 0.13, 0.125],
  ].forEach(([x, hy, z, r]) => mesh(G.sphere(1, 16, 12), white, hatTilt, x, hy, z).scale.setScalar(r));

  const gloveMat = M.soft(C.ink0, 0.6);
  const hands = HAND_REST.map((p) => {
    const m = mesh(G.sphere(0.118, 18, 12), gloveMat, root, p[0], p[1], p[2]);
    return m;
  });

  const height = y + SINK + 0.035;

  /**
   * Sets the whole pose. Positions are in world units; the hands are given in world space too.
   *   x, z      where the chef stands          y        how high the hop is
   *   squash    + stretches, - squashes        lag      [x, z] the upper pancakes trail behind
   *   az        the camera's azimuth           nod/roll extra tilt of the face
   *   look      [x, z] where the eyes point    blink    0..1
   *   hat       [x, z] wobble of the toque     handL/R  [x, y, z] in world space, or null for rest
   *   wide      0..1 how wide the eyes are open
   */
  function pose(p) {
    root.position.set(p.x, 0, p.z);
    const s = 1 + (p.squash || 0);
    const w = 1 / Math.sqrt(s);
    body.position.y = (p.y || 0) / scale;
    body.scale.set(w, s, w);
    const lag = p.lag || [0, 0];
    layers.forEach((l, i) => {
      l.g.position.x = l.base[0] + lag[0] * LAG[i];
      l.g.position.z = l.base[2] + lag[1] * LAG[i];
    });
    layers[1].inner.rotation.z = -lag[0] * 0.5;
    layers[1].inner.rotation.x = lag[1] * 0.5;
    head.g.rotation.y = p.az || 0;
    head.inner.rotation.x = HEAD_TILT + (p.nod || 0) + lag[1] * 0.6;
    head.inner.rotation.z = (p.roll || 0) - lag[0] * 0.9;
    const look = p.look || [0, 0];
    const lid = 1 - 0.92 * clamp(p.blink || 0);
    const big = 1 + 0.3 * clamp(p.wide || 0); // wide eyes, when things go wrong
    eyes.forEach((m, i) => {
      const e = EYES[i];
      m.position.x = e.x + clamp(look[0], -1, 1) * 0.105;
      m.position.z = e.z + clamp(look[1], -1, 1) * 0.085;
      m.scale.x = e.rx * big;
      m.scale.z = e.rz * lid * big;
    });
    const hw = p.hat || [0, 0];
    hatTilt.rotation.x = -0.32 + hw[1];
    hatTilt.rotation.z = 0.1 + hw[0];
    [p.handL, p.handR].forEach((h, i) => {
      const m = hands[i];
      if (h) m.position.set((h[0] - p.x) / scale, h[1] / scale, (h[2] - p.z) / scale);
      else m.position.set(HAND_REST[i][0], HAND_REST[i][1] + (p.y || 0) / scale, HAND_REST[i][2]);
    });
    const lift = clamp((p.y || 0) / 0.9);
    shadow.scale.set(1.8 * (1 - 0.3 * lift), 1, 1.8 * (1 - 0.3 * lift));
    shadow.material.opacity = 0.36 * (1 - 0.55 * lift);
  }

  return { root, body, layers, head, eyes, hat, hands, shadow, pose, scale, height, shoulder: CHEF_SHOULDER, headY: 0.92 };
}
