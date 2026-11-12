// A little chef: the second cast. A toy figure in the same soft finish as the kitchen: a round
// head, the two plum eyes of the Pancake mark, a toque, a white jacket with an apron in one of
// the three tones, and two gloves. It has the same `pose` as a pancake chef (chef.js), so the
// show drives both the same way; the one thing it adds is a front, so it can face something.

import * as THREE from "three";
import { C, TONES } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import { mesh, group, softShadow } from "./world.js";
import { clamp } from "./util.js";

export const PERSON_SHOULDER = 0.92; // the height the arms would start from

const HAND_REST = [
  [-0.43, 0.5, 0.12],
  [0.43, 0.5, 0.12],
];
const JACKET = [
  [0, 0.11],
  [0.25, 0.11],
  [0.32, 0.15],
  [0.35, 0.3],
  [0.34, 0.46],
  [0.3, 0.62],
  [0.24, 0.74],
  [0.15, 0.81],
  [0, 0.83],
];
// the apron: the front of the jacket, a hair's breadth outside it
const APRON = [
  [0.262, 0.115],
  [0.332, 0.155],
  [0.362, 0.3],
  [0.352, 0.46],
  [0.312, 0.6],
];
const HEAD_Y = 1.15; // the centre of the head
const HEAD_R = 0.34;
const HEAD_TILT = -0.26; // the face looks a little up, at the camera
const EYES = [-0.118, 0.118];

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export function makePerson({ tone, skin, hair, scale = 1 }, tex) {
  const colors = TONES[tone];
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const shadow = softShadow(root, tex.blob, 0.02, 0, 1.25, 1.25, 0.36, 0.006);
  const body = group(root);

  // feet, jacket, apron, neckerchief
  const shoe = M.soft(C.plum, 0.55);
  const feet = [-0.15, 0.15].map((x) => {
    const f = mesh(G.sphere(1, 16, 12), shoe, body, x, 0.07, 0.05);
    f.scale.set(0.115, 0.075, 0.17);
    return f;
  });
  const torso = group(body);
  mesh(G.lathe("jacket", JACKET, 36), M.soft(C.ink0, 0.78), torso);
  mesh(G.lathe("apron", APRON, 22, -1.15, 2.3), M.soft(colors.c30, 0.7), torso, 0, 0, 0, false).receiveShadow = true;
  mesh(G.puck(0.2, 0.1, 0.045, 28), M.soft(colors.c40, 0.65), torso, 0, 0.74, 0);
  const knot = mesh(G.sphere(1, 12, 10), M.soft(colors.c40, 0.65), torso, 0.02, 0.76, 0.2);
  knot.scale.set(0.075, 0.06, 0.06);

  // the head: it turns towards what the chef looks at
  const head = group(torso, 0, 0.8, 0);
  const skull = group(head, 0, HEAD_Y - 0.8, 0);
  mesh(G.sphere(HEAD_R, 32, 24), M.soft(skin, 0.7), skull);
  const hairDome = mesh(G.dome(HEAD_R + 0.012, 28), M.soft(hair, 0.75), skull);
  hairDome.rotation.x = -1.18;
  hairDome.scale.set(0.985, 1, 1);
  const eyeMat = M.ceramic(C.plum, 0.2, 1);
  const eyes = EYES.map((x) => {
    const e = mesh(G.sphere(1, 18, 12), eyeMat, skull, x, 0.03, 0.305, false);
    e.scale.set(0.05, 0.078, 0.03);
    e.rotation.y = x * 2.4;
    return e;
  });
  // the mouth only shows when things go wrong: a small "o"
  const mouth = mesh(G.sphere(1, 12, 8), eyeMat, skull, 0, -0.125, 0.316, false);
  mouth.visible = false;
  const blush = new THREE.Color(skin).lerp(new THREE.Color(C.pink30), 0.5);
  EYES.forEach((x) => {
    const b = mesh(G.sphere(1, 12, 8), M.soft(`#${blush.getHexString()}`, 0.8), skull, x * 1.78, -0.085, 0.262, false);
    b.scale.set(0.058, 0.036, 0.02);
    b.rotation.y = x * 4.2;
  });

  // the toque
  const hat = group(skull, 0, HEAD_R - 0.07, -0.02);
  const hatTilt = group(hat);
  const white = M.soft(C.ink0, 0.78);
  mesh(G.cylinder(0.245, 0.232, 0.2, 28), white, hatTilt);
  [
    [0, 0.36, 0, 0.3, 0.24],
    [-0.19, 0.28, 0.02, 0.17, 0.16],
    [0.19, 0.28, 0.02, 0.17, 0.16],
    [0, 0.28, -0.19, 0.17, 0.16],
    [0, 0.27, 0.19, 0.16, 0.15],
  ].forEach(([x, y, z, w, h]) => mesh(G.sphere(1, 18, 14), white, hatTilt, x, y, z).scale.set(w, h, w));

  const gloveMat = M.soft(C.ink0, 0.6);
  const hands = HAND_REST.map((p) => mesh(G.sphere(0.105, 18, 12), gloveMat, root, p[0], p[1], p[2]));

  const height = HEAD_Y + HEAD_R + 0.55;

  /**
   * Sets the whole pose. The fields are those of a pancake chef (chef.js), plus:
   *   face     the angle the chef is turned to: 0 faces the camera side (+z), a quarter turn
   *            faces +x
   *   lookAt   [x, z] what the head turns to, in world units
   *   stride   a running phase: the feet swing with it
   *   pointer  [x, y] in -1..1: where the visitor's pointer is, the head follows it a little
   *   wide     0..1: wide eyes and an open mouth
   */
  function pose(p) {
    const face = p.face || 0;
    const cos = Math.cos(face);
    const sin = Math.sin(face);
    root.position.set(p.x, 0, p.z);
    root.rotation.y = face;
    const s = 1 + (p.squash || 0);
    const w = 1 / Math.sqrt(s);
    body.position.y = (p.y || 0) / scale;
    body.scale.set(w, s, w);

    // the trail of a pancake chef becomes a lean: the top of the body is left behind
    const lag = p.lag || [0, 0];
    const lx = lag[0] * cos - lag[1] * sin;
    const lz = lag[0] * sin + lag[1] * cos;
    torso.rotation.z = -lx * 1.5;
    torso.rotation.x = lz * 1.5;

    let yaw = 0;
    if (p.lookAt) yaw = clamp(wrap(Math.atan2(p.lookAt[0] - p.x, p.lookAt[1] - p.z) - face), -0.95, 0.95);
    // the head also follows the pointer a little
    const ptr = p.pointer || [0, 0];
    head.rotation.y = yaw * 0.7 + ptr[0] * 0.4;
    skull.rotation.x = HEAD_TILT + (p.nod || 0) + lz * 0.8 + ptr[1] * 0.22;
    skull.rotation.z = (p.roll || 0) - lx * 1.2;
    const lid = 1 - 0.92 * clamp(p.blink || 0);
    const wide = clamp(p.wide || 0);
    eyes.forEach((e) => {
      e.scale.x = 0.05 * (1 + 0.25 * wide);
      e.scale.y = 0.078 * lid * (1 + 0.25 * wide);
    });
    mouth.visible = wide > 0.05;
    mouth.scale.set(0.05 * wide, 0.062 * wide, 0.02);
    const hw = p.hat || [0, 0];
    hatTilt.rotation.x = -0.1 + (hw[0] * sin + hw[1] * cos) * 0.9;
    hatTilt.rotation.z = (hw[0] * cos - hw[1] * sin) * -0.9;

    const lift = clamp((p.y || 0) / 0.9);
    const stride = p.stride === undefined ? null : p.stride;
    feet.forEach((f, i) => {
      const swing = stride === null ? 0 : Math.sin(stride + i * Math.PI);
      f.position.z = 0.05 + 0.13 * swing;
      f.position.y = 0.07 + 0.05 * Math.max(0, -swing) * (stride === null ? 0 : 1) + 0.03 * lift;
    });

    [p.handL, p.handR].forEach((h, i) => {
      const m = hands[i];
      if (h) {
        const dx = h[0] - p.x;
        const dz = h[2] - p.z;
        m.position.set((dx * cos - dz * sin) / scale, h[1] / scale, (dx * sin + dz * cos) / scale);
      } else m.position.set(HAND_REST[i][0], HAND_REST[i][1] + (p.y || 0) / scale, HAND_REST[i][2]);
    });
    shadow.scale.set(1.25 * (1 - 0.3 * lift), 1, 1.25 * (1 - 0.3 * lift));
    shadow.material.opacity = 0.36 * (1 - 0.55 * lift);
  }

  return { root, body, hands, shadow, pose, scale, height, shoulder: PERSON_SHOULDER, headY: HEAD_Y };
}
