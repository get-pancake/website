// The things that move: ingredients, pancakes, plated stacks and order tickets.

import * as THREE from "three";
import { C, FOOD, TONES, TONE_NAMES, LATE } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import * as T from "./textures.js";
import { GRIDDLE, PASS, RAIL } from "./layout.js";
import { mesh, group } from "./world.js";
import { hash } from "./util.js";

// ── ingredients ──────────────────────────────────────────────────────────────

const INGREDIENTS = {
  egg(g) {
    const e = mesh(G.sphere(1, 20, 14), M.ceramic(C.ink0, 0.42, 0.35), g, 0, 0.23, 0);
    e.scale.set(0.185, 0.235, 0.185);
    e.rotation.z = 0.25;
  },
  sugar(g) {
    const m = M.soft(C.ink0, 0.75);
    mesh(G.block(0.22, 0.2, 0.22, 0.05, 0.035, 4), m, g, -0.08, 0, 0.03).rotation.y = 0.3;
    mesh(G.block(0.2, 0.18, 0.2, 0.05, 0.035, 4), m, g, 0.13, 0, -0.06).rotation.y = -0.4;
    mesh(G.block(0.18, 0.17, 0.18, 0.045, 0.03, 4), m, g, 0.01, 0.19, 0).rotation.y = 0.7;
  },
  flour(g) {
    mesh(G.block(0.44, 0.46, 0.32, 0.13, 0.06, 6), M.soft(C.ink20, 0.9), g);
    mesh(G.block(0.46, 0.15, 0.34, 0.135, 0.02, 6), M.soft(C.pink20, 0.8), g, 0, 0.14, 0, false);
    mesh(G.block(0.22, 0.1, 0.14, 0.05, 0.03, 4), M.soft(C.ink20, 0.9), g, 0, 0.44, 0);
  },
  butter(g) {
    mesh(G.block(0.5, 0.04, 0.3, 0.06, 0.015, 4), M.ceramic(C.ink0, 0.35, 0.5), g);
    mesh(G.block(0.4, 0.19, 0.22, 0.05, 0.04, 4), M.soft(C.yellow30, 0.5), g, 0, 0.035, 0);
  },
  milk(g) {
    mesh(G.cylinder(0.15, 0.165, 0.34, 20), M.ceramic(C.ink0, 0.3, 0.6), g);
    mesh(G.cylinder(0.085, 0.15, 0.1, 20), M.ceramic(C.ink0, 0.3, 0.6), g, 0, 0.34, 0);
    mesh(G.puck(0.1, 0.08, 0.03, 20), M.soft(C.blue30, 0.5), g, 0, 0.43, 0);
  },
  berry(g) {
    const m = M.ceramic(C.purple40, 0.38, 0.5);
    [
      [-0.11, 0.12, 0.05, 0.125],
      [0.12, 0.12, 0.03, 0.12],
      [0.0, 0.12, -0.13, 0.115],
      [0.01, 0.3, -0.02, 0.12],
    ].forEach(([x, y, z, r]) => mesh(G.sphere(1, 16, 12), m, g, x, y, z).scale.setScalar(r));
  },
  strawberry(g) {
    const b = mesh(G.sphere(1, 18, 14), M.ceramic(C.pink40, 0.42, 0.45), g, 0, 0.2, 0);
    b.scale.set(0.2, 0.22, 0.2);
    const leaf = mesh(G.sphere(1, 12, 8), M.soft(C.green20, 0.6), g, 0, 0.4, 0);
    leaf.scale.set(0.14, 0.045, 0.14);
  },
};

/** an ingredient, standing on y = 0 */
export function makeIngredient(kind) {
  const g = new THREE.Group();
  INGREDIENTS[kind](g);
  return g;
}

// ── pancakes ─────────────────────────────────────────────────────────────────

const PANCAKE_BEVEL = 0.058;

/**
 * A pancake on the griddle. Its origin is its centre, so it can flip. It has its own three
 * materials: the body and the two faces brown at their own pace.
 */
export function makeGriddlePancake() {
  const g = new THREE.Group();
  const h = GRIDDLE.thick;
  const body = new THREE.MeshStandardMaterial({ color: FOOD.batter, roughness: 0.9 });
  const faceA = new THREE.MeshStandardMaterial({ color: FOOD.batter, roughness: 0.9 });
  const faceB = new THREE.MeshStandardMaterial({ color: FOOD.batter, roughness: 0.9 });
  mesh(G.puck(GRIDDLE.r, h, PANCAKE_BEVEL, 36), body, g, 0, -h / 2, 0);
  // the face that starts on top, and the one that starts against the griddle
  const top = mesh(G.disc(GRIDDLE.r - 0.085, 32), faceA, g, 0, h / 2 + 0.0015, 0, false);
  top.receiveShadow = true;
  const bottom = mesh(G.disc(GRIDDLE.r - 0.085, 32), faceB, g, 0, -h / 2 - 0.0015, 0, false);
  bottom.rotation.x = Math.PI;
  return { group: g, body, faceA, faceB };
}

const doneBody = () => M.bread(FOOD.crumb);
const doneFace = () => M.bread(FOOD.golden);

function stackedPancake(parent, y) {
  const g = group(parent, 0, y, 0);
  const h = GRIDDLE.thick;
  mesh(G.puck(GRIDDLE.r, h, PANCAKE_BEVEL, 36), doneBody(), g);
  mesh(G.disc(GRIDDLE.r - 0.085, 32), doneFace(), g, 0, h + 0.0015, 0, false).receiveShadow = true;
  return g;
}

// ── a plated stack ───────────────────────────────────────────────────────────

const STACK_BASE = 0.045;
const STACK_STEP = GRIDDLE.thick - 0.012;
export const STACK_TOP = STACK_BASE + STACK_STEP * 2 + GRIDDLE.thick;

/** where the n-th pancake of a stack sits, above the plate's base */
export const stackY = (n) => STACK_BASE + STACK_STEP * n;

function topping(parent, toneName) {
  const g = group(parent, 0, STACK_TOP, 0);
  const tone = TONES[toneName];
  const sauce = toneName === "yellow" ? FOOD.syrup : tone.c30;
  const sauceMat = M.ceramic(sauce, 0.16, 1);
  // the puddle on top, and two drips down the side
  const puddle = group(g);
  mesh(G.puck(0.3, 0.04, 0.019, 32), sauceMat, puddle, 0.01, -0.012, 0.01, false);
  for (const [a, len] of [
    [0.7, 0.17],
    [2.6, 0.11],
    [4.5, 0.21],
  ]) {
    const d = mesh(G.capsule(0.046, len, 10), sauceMat, puddle, Math.cos(a) * 0.372, -len / 2 - 0.062, Math.sin(a) * 0.372, false);
    d.scale.set(1, 1, 0.7);
    d.rotation.y = -a;
  }
  mesh(G.puck(0.11, 0.035, 0.016, 20), sauceMat, puddle, 0.2, -0.008, -0.16, false);

  // the pieces thrown on top
  const pieces = [];
  if (toneName === "yellow") {
    const p = mesh(G.block(0.21, 0.085, 0.21, 0.045, 0.03, 4), M.soft(C.yellow10, 0.45), g, 0.02, 0.022, 0.02);
    p.rotation.y = 0.5;
    pieces.push(p);
  } else if (toneName === "purple") {
    const m = M.ceramic(C.purple40, 0.36, 0.55);
    [
      [-0.09, 0.02, 0.06, 0.085],
      [0.1, 0.02, 0.05, 0.08],
      [0.0, 0.02, -0.1, 0.082],
      [0.01, 0.13, 0.0, 0.08],
    ].forEach(([x, y, z, r]) => {
      const p = mesh(G.sphere(1, 14, 10), m, g, x, y + r, z);
      p.scale.setScalar(r);
      pieces.push(p);
    });
  } else {
    [
      [-0.08, 0.04, 0.3],
      [0.1, -0.05, -0.5],
      [0.0, 0.1, 1.4],
    ].forEach(([x, z, ry]) => {
      const p = group(g, x, 0.02, z);
      p.rotation.set(0.5, ry, 0.2);
      const b = mesh(G.sphere(1, 14, 10), M.ceramic(C.pink40, 0.4, 0.5), p, 0, 0.09, 0);
      b.scale.set(0.09, 0.105, 0.09);
      const leaf = mesh(G.sphere(1, 10, 6), M.soft(C.green20, 0.6), p, 0, 0.18, 0, false);
      leaf.scale.set(0.065, 0.022, 0.065);
      pieces.push(p);
    });
  }
  pieces.forEach((p) => {
    p.userData.rest = p.position.clone();
    p.userData.size = p.scale.clone();
  });
  return { group: g, puddle, pieces };
}

/** a plate, the three pancakes that land on it, and one topping per tone (one is shown) */
export function makePlate() {
  const g = new THREE.Group();
  const body = group(g);
  mesh(G.plate(PASS.plateR), M.ceramic(C.ink0, 0.26, 0.75), body);
  const stack = group(body);
  const cakes = [0, 1, 2].map((n) => stackedPancake(stack, stackY(n)));
  const toppings = {};
  for (const name of TONE_NAMES) toppings[name] = topping(stack, name);
  return { group: g, body, stack, cakes, toppings };
}

/** the small sideways shifts that make each stack look hand-made */
export function stackJitter(orderIndex, n) {
  return [(hash(orderIndex, n * 7 + 1) - 0.5) * 0.07, (hash(orderIndex, n * 7 + 2) - 0.5) * 0.07, hash(orderIndex, n * 7 + 3) * 6.28];
}

// ── order tickets ────────────────────────────────────────────────────────────

let ticketKit = null;
// a ticket comes in the three tones of an order, or "late" (red, with a burnt stack)
const TICKET_KINDS = [...TONE_NAMES, "late"];

function kit() {
  if (ticketKit) return ticketKit;
  const faces = {};
  const bars = {};
  for (const name of TICKET_KINDS) {
    const map = T.ticketFace(name);
    faces[name] = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.85,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      emissive: "#ffffff",
      emissiveMap: map,
      emissiveIntensity: 0.34,
    });
    bars[name] = new THREE.MeshBasicMaterial({ color: (TONES[name] || LATE).c40, toneMapped: false });
  }
  const stamp = new THREE.MeshBasicMaterial({ map: T.checkStamp(), transparent: true, toneMapped: false, depthWrite: false });
  const stampLate = new THREE.MeshBasicMaterial({ map: T.lateStamp(), transparent: true, toneMapped: false, depthWrite: false });
  const bar = new THREE.PlaneGeometry(1, 1);
  bar.translate(0.5, 0, 0);
  ticketKit = { faces, bars, stamp, stampLate, bar };
  return ticketKit;
}

export function disposeTicketKit() {
  if (!ticketKit) return;
  for (const name of TICKET_KINDS) {
    ticketKit.faces[name].map.dispose();
    ticketKit.faces[name].dispose();
    ticketKit.bars[name].dispose();
  }
  for (const m of [ticketKit.stamp, ticketKit.stampLate]) {
    m.map.dispose();
    m.dispose();
  }
  ticketKit.bar.dispose();
  ticketKit = null;
}

/** an order ticket hanging from its clip: the origin is the clip, on the rail */
export function makeTicket() {
  const k = kit();
  const W = RAIL.ticketW;
  const H = RAIL.ticketH;
  const g = new THREE.Group();
  const swing = group(g);
  mesh(G.block(0.17, 0.13, 0.08, 0.035, 0.025, 4), M.soft(C.plum, 0.5), swing, 0, -0.09, 0);
  const paper = mesh(G.plane(W, H), k.faces.yellow, swing, 0, -0.07 - H / 2, 0.012);
  paper.receiveShadow = false;
  // the progress bar: its track is drawn on the paper (26 px in, 18 px high, of 240 x 336)
  const barW = W * ((240 - 52 - 8) / 240);
  const barH = H * (10 / 336);
  const bar = new THREE.Mesh(k.bar, k.bars.yellow);
  bar.position.set(-barW / 2, -0.07 - H + H * (35 / 336), 0.016);
  bar.scale.set(0.001, barH, 1);
  swing.add(bar);
  const stamp = new THREE.Mesh(G.plane(0.56, 0.56), k.stamp);
  stamp.position.set(0.12, -0.07 - H * 0.56, 0.03);
  stamp.visible = false;
  stamp.renderOrder = 3;
  swing.add(stamp);
  return {
    group: g,
    swing,
    paper,
    bar,
    barW,
    barH,
    stamp,
    /** one of the three tones, or "late" */
    setTone(name) {
      paper.material = k.faces[name];
      bar.material = k.bars[name];
      stamp.material = name === "late" ? k.stampLate : k.stamp;
    },
  };
}

// ── what a kitchen without Pancake leaves behind ─────────────────────────────

/** a pancake nobody flipped: the same disc, burnt. Its origin is its centre. */
export function makeBurntPancake() {
  const g = new THREE.Group();
  const h = GRIDDLE.thick;
  const body = new THREE.MeshStandardMaterial({ color: FOOD.batter, roughness: 0.92 });
  const face = new THREE.MeshStandardMaterial({ color: FOOD.batter, roughness: 0.92 });
  mesh(G.puck(GRIDDLE.r, h, PANCAKE_BEVEL, 36), body, g, 0, -h / 2, 0);
  mesh(G.disc(GRIDDLE.r - 0.085, 32), face, g, 0, h / 2 + 0.0015, 0, false).receiveShadow = true;
  return { group: g, body, face };
}

/** a flame: three tongues that the show stretches and sways. Its base sits on y = 0. */
export function makeFlame() {
  const g = new THREE.Group();
  // The inner tongues stand towards the camera (up and +z), clear of the outer one, which
  // would hide them: [color, size, x, y, z]. The show scales these offsets with the flame.
  const tongues = [
    [C.orange20, 1, 0, 0, 0],
    [C.yellow20, 0.6, 0.02, 0.16, 0.26],
    [C.ink0, 0.3, -0.01, 0.25, 0.41],
  ].map(([color, size, x, y, z]) => {
    const m = mesh(G.flame(), M.glow(color), g, x, y, z, false);
    m.scale.setScalar(size);
    m.userData.size = size;
    m.userData.at = [x, y, z];
    return m;
  });
  return { group: g, tongues };
}
