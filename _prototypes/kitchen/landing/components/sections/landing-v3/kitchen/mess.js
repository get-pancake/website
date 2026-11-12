// Without Pancake. The same kitchen with nobody to hold it together: a belt gives way and the
// ingredients spill, everything has to go through one big slow tank (the warehouse), the pipe
// out of it leaks, the pancakes burn, the orders pile up, and the one plate that leaves is late.
//
// Like the rest of the show, every position here is a pure function of the time. Two loops:
//   BELTS  (9 s)   the left belt breaks, the mixer chef mends it, the pipe springs a leak, the
//                  chef mends that, and the belt breaks again
//   ORDER  (12 s)  batter drips out of the tank, one pancake forms, nobody flips it, it burns,
//                  the cook puts the fire out and blows what is left on a plate, which leaves

import * as THREE from "three";
import { C, FOOD } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import * as T_ from "./textures.js";
import { BOWL, INTAKE, GRIDDLE, PASS, OUT, RAIL } from "./layout.js";
import { WORDS } from "./words.js";
import { mesh, group, softShadow } from "./world.js";
import { makeTicket, makeBurntPancake, makeFlame } from "./props.js";
import { pool, sprites, put } from "./fx.js";
import { clamp, lerp, prog, mod, ease, bump, hop, wobble, hash, TAU, mix3, toss, along } from "./util.js";

export const BELTS = 9;
export const ORDER = 12;
const BROKEN = 4.2; // how long the left belt stays down before it is mended
const LEAK_AT = 4.5; // when, in the belts' loop, the pipe starts to leak
const DROOP = 0.62; // how far a broken tip hangs, in radians
const RELOAD = 36; // the tank's progress bar starts again from nothing every RELOAD seconds

const SLOT_Y = GRIDDLE.y + GRIDDLE.thick / 2;
const slot = (c, j) => [GRIDDLE.x + GRIDDLE.cols[c], SLOT_Y, GRIDDLE.z + GRIDDLE.rows[j]];
const PLATE_Y = PASS.top + 0.03;

// the one pancake of each loop, in the column next to the tank
const MAIN = [0, 1];
const DRIPS = [0.6, 1.8, 3.0, 4.2]; // when a drop of batter lands
const COOKED = 7.0; // the ring is full, and nobody flips
const ALIGHT = 8.5;
const DOUSED = 10.8;
const BLOWN = 11.2; // the cook blows what is left towards the plate
const FLIGHT = 0.64;
const PLATE_IN = 9.0;
const SHIP = 12.4;
const DONE = SHIP + 0.5;
const PUSH = 1.25;
const EXIT_X = 8.66;
export const EXIT = SHIP + (EXIT_X - PASS.plate[0] - PUSH) / OUT.speed;

// what earlier loops left on the griddle: [column, row, lit from, lit until] in the order's
// loop. Something is always alight, and the cook is always one fire behind.
// They burn in the middle and front rows: in the back row a flame would hide a chef who
// stands behind the griddle.
const CHARRED = [
  [1, 2, 0.4, 3.4],
  [2, 1, 2.2, 6.0],
  [2, 2, 5.0, 8.4],
  [1, 0, -1, -1],
];
const FIRES = [
  ...CHARRED.filter((c) => c[2] >= 0).map(([c, j, from, to]) => ({ at: slot(c, j), from, to })),
  { at: slot(MAIN[0], MAIN[1]), from: ALIGHT, to: DOUSED },
];

// the tank that stands where the bowl was
const TANK = { x: BOWL.x, z: BOWL.z, r: 1.05, h: 2.45 };
const PIPE = [
  [TANK.x + 0.98, 1.35, TANK.z],
  [TANK.x + 1.5, 2.15, TANK.z],
  [TANK.x + 2.3, 2.5, TANK.z - 0.05],
  [GRIDDLE.x + GRIDDLE.cols[0] - 0.25, 2.34, GRIDDLE.z],
  [GRIDDLE.x + GRIDDLE.cols[0], 1.9, GRIDDLE.z],
];
const LEAK = [TANK.x + 1.62, 2.24, TANK.z];
const NOZZLE = PIPE[PIPE.length - 1];

// where the mixer chef stands to mend the belt, and to mend the pipe
const AT_BELT = [INTAKE.belts[0].hinge[0] - 0.05, 1.0];
const AT_PIPE = [LEAK[0] + 0.1, 1.32];
const TO_BELT = [AT_PIPE, [TANK.x - 0.1, 2.25], AT_BELT];
const TO_PIPE = [AT_BELT, [TANK.x + 0.2, 2.05], AT_PIPE];

/** is the tip of belt `b` down at time t? The corner belt always is: nobody has had the time. */
export const beltDown = (b, t) => b === 1 || (b === 0 && mod(t, BELTS) < BROKEN);

/** how far the tip of belt `b` hangs at time t: 0 flat, 1 down (it overshoots as it falls) */
export function beltDroop(b, t) {
  if (b === 1) return 1 + 0.035 * Math.sin(t * 2.3);
  if (b !== 0) return 0;
  const x = mod(t, BELTS);
  if (x < BROKEN) return ease.outBack(clamp(x / 0.3), 2) + wobble(x - 0.3, 0.09, 17, 6);
  return 1 - ease.outCubic(clamp((x - BROKEN) / 0.16)) + wobble(x - BROKEN - 0.16, -0.07, 21, 7);
}
export const DROOP_ANGLE = DROOP;

/** how much the pipe leaks at time t, 0..1 */
function leaking(t) {
  const x = mod(t - LEAK_AT, BELTS);
  return x < BROKEN ? clamp(x / 0.25) : 1 - clamp((x - BROKEN) / 0.2);
}

function burning(fire, tau) {
  if (tau < fire.from || tau > fire.to) return 0;
  return clamp((tau - fire.from) / 0.35) * clamp((fire.to - tau) / 0.25);
}

export function createMess(world, root, tex, opts = {}) {
  const set = group(root);
  const v3 = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const cBatter = new THREE.Color(FOOD.batter);
  const cCrumb = new THREE.Color(FOOD.crumb);
  const cGolden = new THREE.Color(FOOD.golden);
  const cBurntCrumb = new THREE.Color(FOOD.burntCrumb);
  const cBurnt = new THREE.Color(FOOD.burnt);
  const cTmp = new THREE.Color();

  // ── the tank, its two logos, its gauge, its hourglass and the pipe out of it ──
  const tank = group(set, TANK.x, 0, TANK.z);
  softShadow(tank, tex.blob, 0.08, 0, 3.5, 3.5, 0.34);
  const tankBody = group(tank);
  mesh(G.puck(TANK.r + 0.1, 0.16, 0.05, 48), M.soft(C.ink60, 0.6), tankBody);
  mesh(
    G.lathe(
      "tank",
      [
        [0, 0.1],
        [TANK.r - 0.03, 0.1],
        [TANK.r, 0.2],
        [TANK.r, TANK.h - 0.52],
        [TANK.r - 0.06, TANK.h - 0.3],
        [TANK.r - 0.25, TANK.h - 0.1],
        [TANK.r - 0.55, TANK.h],
        [0, TANK.h + 0.03],
      ],
      56,
    ),
    M.soft(C.ink30, 0.5),
    tankBody,
  );
  for (const y of [0.5, TANK.h - 0.72]) mesh(G.puck(TANK.r + 0.035, 0.11, 0.04, 56), M.soft(C.blue20, 0.5), tankBody, 0, y, 0);
  // the hatches the belts come in through
  for (const b of INTAKE.belts) {
    const a = Math.atan2(-b.dir[0], -b.dir[1]);
    const h = mesh(G.block(1.02, 0.78, 0.16, 0.12, 0.03, 6), M.soft(C.plum, 0.85), tankBody, Math.sin(a) * (TANK.r - 0.05), INTAKE.y - 0.5, Math.cos(a) * (TANK.r - 0.05), false);
    h.rotation.y = a;
  }
  // the two vendor marks, on the front: `vendorLogos: false` leaves the tank bare
  const plates = (opts.vendorLogos === false ? [] : ["snowflake", "bigquery"]).map((key, i) => {
    const a = (i ? 1 : -1) * 0.37;
    const map = T_.logoPlate(key);
    const p = new THREE.Mesh(G.plane(0.72, 0.72), new THREE.MeshBasicMaterial({ map, toneMapped: false, alphaTest: 0.5 }));
    p.position.set(Math.sin(a) * (TANK.r + 0.025), 1.6, Math.cos(a) * (TANK.r + 0.025));
    p.rotation.y = a;
    tankBody.add(p);
    return map;
  });
  // the gauge: a dark screen, and a bar that crawls
  const gauge = group(tankBody, 0, 0.86, TANK.r - 0.07);
  mesh(G.block(1.34, 0.34, 0.3, 0.1, 0.04, 6), M.soft(C.plum, 0.5), gauge, 0, -0.17, 0, false);
  const barGeo = new THREE.PlaneGeometry(1, 1);
  barGeo.translate(0.5, 0, 0);
  const barMat = new THREE.MeshBasicMaterial({ color: C.orange20, toneMapped: false });
  mesh(G.plane(1.1, 0.1), M.glow(C.ink90), gauge, 0, 0, 0.152, false);
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(-0.55, 0, 0.154);
  gauge.add(bar);
  const lamp = mesh(G.sphere(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: C.red30, toneMapped: false }), tankBody, 0.5, 1.17, TANK.r * 0.86, false);
  // the hourglass on top: it turns over, and nothing comes out any faster
  const glass = group(tankBody, 0, TANK.h + 0.36, 0);
  const cone = [
    [0, 0],
    [0.05, 0.01],
    [0.17, 0.2],
    [0.2, 0.27],
    [0, 0.27],
  ];
  for (const s of [1, -1]) {
    const c = mesh(G.lathe("hourglass", cone, 20), M.ceramic(C.yellow10, 0.2, 0.9), glass, 0, 0, 0, false);
    c.scale.y = s;
    mesh(G.puck(0.23, 0.06, 0.025, 20), M.soft(C.plum, 0.5), glass, 0, s * 0.3 - 0.03, 0);
  }
  const sand = mesh(G.sphere(1, 12, 8), M.soft(C.yellow40, 0.7), glass, 0, -0.16, 0, false);
  sand.scale.set(0.11, 0.07, 0.11);
  // the pipe, and where it leaks
  mesh(G.tube(PIPE.map((p) => [p[0] - TANK.x, p[1], p[2] - TANK.z]), 0.11, 48), M.soft(C.blue20, 0.5), tank);
  mesh(G.puck(0.17, 0.12, 0.04, 20), M.soft(C.blue30, 0.5), tank, NOZZLE[0] - TANK.x, NOZZLE[1] - 0.1, NOZZLE[2] - TANK.z);
  const flange = mesh(G.puck(0.17, 0.14, 0.04, 20), M.soft(C.blue30, 0.5), tank, PIPE[0][0] - TANK.x + 0.03, PIPE[0][1] - 0.02, 0);
  flange.rotation.z = -0.55;
  const patch = mesh(G.block(0.3, 0.3, 0.3, 0.1, 0.04, 5), M.soft(C.pink30, 0.6), tank, LEAK[0] - TANK.x, LEAK[1] - 0.15, LEAK[2] - TANK.z, false);
  patch.rotation.z = -0.6;
  // the puddle under the leak
  const puddle = mesh(G.puck(0.55, 0.035, 0.016, 32), M.ceramic(FOOD.batter, 0.25, 0.7), set, LEAK[0], 0.004, LEAK[2] + 0.1, false);
  puddle.receiveShadow = true;

  // ── what is on the griddle ─────────────────────────────────────────────────
  const charred = CHARRED.map(([c, j]) => {
    const p = makeBurntPancake();
    p.body.color.set(FOOD.burntCrumb);
    p.face.color.set(FOOD.burnt);
    const at = slot(c, j);
    p.group.position.set(at[0], at[1], at[2]);
    p.group.rotation.y = hash(c, j) * TAU;
    set.add(p.group);
    return p;
  });
  const cake = makeBurntPancake();
  set.add(cake.group);
  const flames = FIRES.map(() => {
    const f = makeFlame();
    f.group.visible = false;
    set.add(f.group);
    return f;
  });
  const glowMat = new THREE.SpriteMaterial({ map: tex.blob, color: C.orange20, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  const glows = sprites(set, FIRES.length, glowMat);
  const smokeMat = new THREE.SpriteMaterial({ map: tex.blob, color: C.ink80, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
  const smoke = sprites(set, 26, smokeMat);
  const dot = G.sphere(1, 10, 8);
  const drops = pool(set, 14, dot, M.ceramic(FOOD.batter, 0.3, 0.5));
  const foam = pool(set, 10, dot, M.soft(C.ink0, 0.9));
  const sparkGeo = new THREE.OctahedronGeometry(1, 0);
  const sparks = pool(set, 10, sparkGeo, M.glow(C.yellow30));

  // ── a warning sign over what is broken, and an alarm over each chef ────────
  const warn = [0, 1, 2].map(() => {
    const g = group(set);
    const tri = new THREE.Shape();
    tri.moveTo(0, 0.5);
    tri.lineTo(0.5, -0.36);
    tri.lineTo(-0.5, -0.36);
    tri.closePath();
    const plate = new THREE.Mesh(new THREE.ShapeGeometry(tri), M.glow(C.yellow30));
    g.add(plate);
    mesh(G.plane(0.1, 0.34), M.glow(C.plum), g, 0, 0.03, 0.004, false);
    mesh(G.plane(0.11, 0.11), M.glow(C.plum), g, 0, -0.24, 0.004, false);
    g.visible = false;
    return g;
  });
  const alarms = [0, 1, 2].map(() => {
    const g = group(set);
    mesh(G.capsule(0.07, 0.22, 10), M.glow(C.red30), g, 0, 0.3, 0, false);
    mesh(G.sphere(0.08, 12, 8), M.glow(C.red30), g, 0, 0, 0, false);
    g.visible = false;
    return g;
  });
  const sweat = pool(set, 6, dot, M.ceramic(C.blue30, 0.2, 0.8));

  // the cook's extinguisher: its origin is the hand, it points along +y
  const hose = group(set);
  mesh(G.capsule(0.13, 0.26, 12), M.ceramic(C.pink40, 0.3, 0.7), hose, 0, 0.05, 0);
  mesh(G.cylinder(0.07, 0.09, 0.16, 12), M.soft(C.plum, 0.5), hose, 0, 0.26, 0);
  mesh(G.cylinder(0.05, 0.075, 0.18, 12), M.soft(C.plum, 0.5), hose, 0, 0.4, 0);
  hose.visible = false;

  // ── the orders: late tickets on the rail, the ones that fall, the plate ────
  const late = [];
  for (let i = 0; i < 8; i++) {
    const tk = makeTicket();
    tk.setTone("late");
    tk.group.visible = false;
    set.add(tk.group);
    late.push(tk);
  }
  const fallen = [];
  for (let i = 0; i < 6; i++) {
    const tk = makeTicket();
    tk.setTone("late");
    tk.group.visible = false;
    set.add(tk.group);
    fallen.push(tk);
  }
  const dishes = [0, 1].map(() => {
    const g = group(set);
    mesh(G.plate(PASS.plateR), M.ceramic(C.ink0, 0.26, 0.75), g);
    const p = makeBurntPancake();
    p.body.color.set(FOOD.burntCrumb);
    p.face.color.set(FOOD.burnt);
    p.group.position.y = 0.045 + GRIDDLE.thick / 2;
    g.add(p.group);
    g.visible = false;
    return { g, cake: p.group };
  });

  // ── the chefs ──────────────────────────────────────────────────────────────
  // The mixer chef runs between the belt and the pipe with the ladle, and hits what broke.
  function fixerAt(t) {
    const x = mod(t, BELTS);
    const toBelt = x < BROKEN + 0.4;
    // the run: pipe to belt, then belt to pipe
    const u = toBelt ? prog(x, 0.15, 3.35) : prog(x, BROKEN + 0.45, BELTS - 1.2);
    const p = along(toBelt ? TO_BELT : TO_PIPE, ease.inOutSine(u));
    const running = u > 0 && u < 1;
    const hitAt = toBelt ? BROKEN : BELTS - 0.3; // the blow lands
    const target = toBelt ? [INTAKE.belts[0].hinge[0], INTAKE.y + 0.12, INTAKE.belts[0].hinge[1]] : [LEAK[0], LEAK[1] + 0.05, LEAK[2]];
    const s = x - hitAt; // around the blow
    const carried = [p.x + Math.sin(p.face) * 0.25, 2.25 + 0.12 * Math.sin(p.gone * 7), p.z + Math.cos(p.face) * 0.25];
    const raised = [target[0] + (p.x - target[0]) * 0.35, target[1] + 1.25, target[2] + (p.z - target[2]) * 0.35];
    let tip = carried;
    if (!running) {
      if (s < -0.34) tip = mix3(carried, raised, ease.outCubic(prog(s, -0.75, -0.34)));
      else if (s < 0) tip = mix3(raised, target, ease.inCubic(prog(s, -0.34, 0)));
      else tip = mix3(mix3(target, raised, ease.outCubic(prog(s, 0, 0.16)) * 0.5), carried, ease.inOutSine(prog(s, 0.2, 0.55)));
    }
    return {
      x: p.x,
      z: p.z,
      y: running ? 0.3 * Math.abs(Math.sin((p.gone / 0.8) * Math.PI)) : 0.22 * hop(prog(s, -0.2, 0.2)),
      squash: running ? -0.1 * Math.pow(1 - Math.abs(Math.sin((p.gone / 0.8) * Math.PI)), 4) : -0.12 * bump(prog(s, -0.5, -0.2)) + wobble(s, -0.16, 22, 8),
      tip,
      loaded: false,
      look: running ? [p.x + Math.sin(p.face) * 3, p.z + Math.cos(p.face) * 3] : [target[0], target[2]],
      face: running ? p.face : Math.atan2(target[0] - p.x, target[2] - p.z),
      stride: p.gone * 7,
      lift: running ? 0.6 : 1,
      alarm: toBelt ? bump(prog(x, 0, 0.9)) : bump(prog(x, LEAK_AT, LEAK_AT + 0.9)),
    };
  }

  // The cook runs along the griddle with the extinguisher, from one fire to the next.
  // [when, which column]: the cook is at each fire as it is about to go out
  const COLS = [
    [0, 0],
    [2.4, 1],
    [3.5, 1],
    [5.0, 2],
    [8.5, 2],
    [9.8, 0],
    [ORDER, 0],
  ];
  function fighterAt(t, stage) {
    const tau = mod(t, ORDER);
    let i = 0;
    while (i < COLS.length - 2 && tau >= COLS[i + 1][0]) i++;
    const [t0, c0] = COLS[i];
    const [t1, c1] = COLS[i + 1];
    const u = c0 === c1 ? 1 : prog(tau, t0, t1);
    const x0 = GRIDDLE.x + GRIDDLE.cols[c0];
    const x1 = GRIDDLE.x + GRIDDLE.cols[c1];
    const x = lerp(x0, x1, ease.inOutSine(u));
    const z = stage.cook.z + 0.12 * Math.sin(t * 5.3);
    const moving = c0 !== c1 && u < 1;
    const gone = Math.abs(x - x0);
    // what the nozzle points at: the fire being put out, or what is left of the pancake
    let fire = null;
    for (const f of FIRES) if (tau > f.to - 0.75 && tau < f.to + 0.1) fire = f;
    const blowing = tau > BLOWN - 0.35 && tau < BLOWN + 0.3;
    const aim = fire ? fire.at : blowing ? slot(MAIN[0], MAIN[1]) : null;
    const jitter = 0.07 * Math.sin(t * 23);
    return {
      x,
      z,
      y: moving ? 0.3 * Math.abs(Math.sin((gone / 0.62) * Math.PI)) : 0.1 * Math.abs(Math.sin(t * 9)),
      squash: moving ? -0.08 * Math.pow(1 - Math.abs(Math.sin((gone / 0.62) * Math.PI)), 4) : 0.03 * Math.sin(t * 18),
      aim: aim ? [aim[0] + jitter, aim[1] + 0.25, aim[2]] : [x + (moving ? Math.sign(x1 - x0) : 0) * 0.6, 1.45, z + stage.work * 0.9],
      spraying: aim ? 1 : 0,
      look: aim ? [aim[0], aim[2]] : [x + (x1 - x0) * 2, z + stage.work * 2],
      face: moving ? Math.atan2(x1 - x0, stage.work * 0.9) : stage.work > 0 ? 0 : Math.PI,
      stride: gone * 9 + t * 4,
      lift: 0.4,
      alarm: Math.max(...FIRES.map((f) => bump(prog(tau, f.from, f.from + 0.9)))),
    };
  }

  // The plater runs up and down the front of the kitchen with both hands in the air.
  const LAP = [
    [-7.3, 2.45],
    [6.3, 2.3],
  ];
  function runnerAt(t) {
    const u = mod(t - 7.45, ORDER) / ORDER;
    const out = u < 0.5;
    const k = out ? u * 2 : 2 - u * 2;
    const x = lerp(LAP[0][0], LAP[1][0], ease.inOutSine(k));
    const gone = Math.abs(x - LAP[0][0]);
    const z = lerp(LAP[0][1], LAP[1][1], k) + 0.22 * Math.sin(gone * 1.9);
    const dir = out ? 1 : -1;
    const wave = Math.sin(t * 13);
    return {
      x,
      z,
      y: 0.32 * Math.abs(Math.sin((gone / 0.85) * Math.PI)),
      squash: -0.1 * Math.pow(1 - Math.abs(Math.sin((gone / 0.85) * Math.PI)), 4),
      handL: [x - 0.42 + 0.08 * wave, 2.0 + 0.1 * wave, z + 0.05],
      handR: [x + 0.42 + 0.08 * wave, 2.0 - 0.1 * wave, z + 0.05],
      look: [x + dir * 4, z],
      face: Math.atan2(dir, 0.25),
      stride: gone * 8,
      lift: 0,
      alarm: bump(prog(mod(t, 4), 0, 0.9)),
    };
  }

  const STATE = { mixer: fixerAt, cook: fighterAt, plater: runnerAt };

  /** how many plates have left since the kitchen went without Pancake */
  const served = (t) => Math.floor((t - EXIT) / ORDER);

  // ── drawing ────────────────────────────────────────────────────────────────
  let cursor = { smoke: 0, drop: 0 };
  const nextSmoke = () => smoke[cursor.smoke++];
  const nextDrop = () => drops[cursor.drop++];

  function puff(at, t, seed, k) {
    // two wisps of smoke over a point, `k` how thick
    for (let e = 0; e < 2; e++) {
      const sp = nextSmoke();
      if (!sp) return;
      const x = mod(t * 0.55 + e * 0.5 + hash(seed, 3), 1);
      put(sp, [at[0] + Math.sin(t * 1.7 + e * 2 + seed) * 0.18 * x, at[1] + 0.25 + x * 1.9, at[2] - 0.12], k > 0.02 ? (0.4 + 0.8 * x) * bump(x) * k : 0);
    }
  }

  function drawTank(t, m) {
    tank.scale.setScalar(Math.max(0.0001, m));
    tank.visible = m > 0.001;
    puddle.scale.setScalar(Math.max(0.0001, m));
    // it rumbles, and the hourglass turns over
    tankBody.position.set(Math.sin(t * 43) * 0.006, 0, Math.cos(t * 37) * 0.006);
    tankBody.scale.set(1 + 0.006 * Math.sin(t * 6.1), 1 - 0.006 * Math.sin(t * 6.1), 1 + 0.006 * Math.sin(t * 6.1));
    const turn = mod(t, 3.2);
    glass.rotation.z = Math.floor(t / 3.2) * Math.PI + Math.PI * ease.inOutCubic(clamp(turn / 0.6));
    sand.position.y = -0.16 + 0.02 * Math.sin(t * 9);
    // the bar: it crawls, and every so often starts again from nothing
    const x = mod(t, RELOAD);
    const done = 0.04 + 0.9 * (x / RELOAD);
    bar.scale.set(Math.max(0.001, 1.1 * done), 0.1, 1);
    const restart = x < 1.4;
    barMat.color.set(restart && Math.sin(t * 22) > 0 ? C.red30 : C.orange20);
    lamp.visible = Math.sin(t * 7) > -0.2;
  }

  function drawPipe(t, m) {
    // the drip at the nozzle: a drop falls for each of the four that make the pancake
    const tau = mod(t, ORDER);
    const land = [NOZZLE[0], GRIDDLE.y + 0.06, NOZZLE[2]];
    for (const at of DRIPS) {
      const d = nextDrop();
      const u = (tau - (at - 0.42)) / 0.42;
      put(d, [NOZZLE[0], lerp(NOZZLE[1] - 0.16, land[1], u * u), NOZZLE[2]], u > 0 && u < 1 ? 0.085 * m : 0);
      d.scale.y = 0.085 * m * 1.5;
    }
    // the leak: a string of drops to the floor, until the chef mends it
    const leak = leaking(t) * m;
    for (let e = 0; e < 5; e++) {
      const d = nextDrop();
      const u = mod(t * 1.7 + e / 5, 1);
      put(d, [LEAK[0] + 0.07 * Math.sin(e * 2.4), lerp(LEAK[1] - 0.12, 0.06, u * u), LEAK[2] + 0.12 + 0.05 * Math.cos(e * 1.7)], leak > 0.05 ? 0.06 * leak * (1 - 0.4 * u) : 0);
    }
    patch.visible = leak < 0.5;
    puddle.scale.set(Math.max(0.0001, m * (0.75 + 0.25 * leak)), 1, Math.max(0.0001, m * (0.75 + 0.25 * leak)));
  }

  function drawBelts(t, m) {
    // sparks when the left belt gives way, a sign over each belt that is down
    const x = mod(t, BELTS);
    const hinge = INTAKE.belts[0].hinge;
    sparks.forEach((sp, e) => {
      const a = (e / sparks.length) * TAU + Math.floor(t / BELTS);
      const vr = 1.0 + hash(e, 4) * 1.4;
      put(sp, [hinge[0] + 0.2 + Math.cos(a) * vr * x * 0.7, INTAKE.y + 0.1 + (2.4 + hash(e, 5)) * x - 5 * x * x, hinge[1] + Math.sin(a) * vr * x * 0.7], x < 0.5 ? 0.07 * (1 - x / 0.5) * m : 0);
      sp.rotation.set(x * 9, x * 6 + e, 0);
    });
    [0, 1].forEach((b) => {
      const sign = warn[b];
      const h = INTAKE.belts[b].hinge;
      const down = beltDown(b, t);
      const since = b === 0 ? x : 9;
      const k = (down ? ease.outBack(clamp(since / 0.3), 2.4) : 0) * m;
      sign.visible = k > 0.02;
      sign.position.set(h[0] - 0.15, INTAKE.y + 1.0 + 0.08 * Math.sin(t * 4 + b), h[1]);
      sign.scale.setScalar(0.62 * k * (1 + 0.06 * Math.sin(t * 9 + b)));
      if (down) puff([h[0] + INTAKE.belts[b].dir[0] * 0.3, INTAKE.y - 0.2, h[1] + INTAKE.belts[b].dir[1] * 0.3], t, 40 + b, 0.5 * m);
    });
    const leak = leaking(t);
    warn[2].visible = leak * m > 0.5;
    warn[2].position.set(LEAK[0] + 0.1, LEAK[1] + 0.85 + 0.08 * Math.sin(t * 4.3), LEAK[2]);
    warn[2].scale.setScalar(0.62 * leak * m);
  }

  function drawGriddle(t, m, appear) {
    const tau = mod(t, ORDER);
    // what earlier loops left: charred, some of it alight
    charred.forEach((p, i) => {
      p.group.scale.setScalar(appear);
      p.group.visible = appear > 0.01;
      const [c, j, from] = CHARRED[i];
      const lit = from >= 0 && tau >= from - 0.4;
      puff(slot(c, j), t, i * 7, (lit ? 0.35 : 0.6) * appear);
    });
    // the one pancake: it grows a drop at a time, cooks, and nobody comes
    const at = slot(MAIN[0], MAIN[1]);
    const landed = DRIPS.filter((d) => tau >= d).length;
    const last = landed ? tau - DRIPS[landed - 1] : -1;
    const size = landed ? lerp(0.3, 1, (landed - 1 + ease.outBack(clamp(last / 0.28), 2)) / DRIPS.length) : 0;
    const flying = tau >= BLOWN;
    const gone = tau >= BLOWN + FLIGHT;
    const g = cake.group;
    g.visible = landed > 0 && !gone && appear > 0.01;
    const cooked = ease.outQuad(prog(tau, DRIPS[3], COOKED));
    const burnt = ease.inOutQuad(prog(tau, COOKED, ALIGHT));
    cake.body.color.copy(cTmp.lerpColors(cBatter, cCrumb, cooked)).lerp(cBurntCrumb, burnt);
    cake.face.color.copy(cTmp.lerpColors(cBatter, cGolden, cooked * 0.5)).lerp(cBurnt, burnt);
    if (flying && !gone) {
      const u = (tau - BLOWN) / FLIGHT;
      const to = [PASS.plate[0], PLATE_Y + 0.045 + GRIDDLE.thick / 2, PASS.plate[1]];
      const p = toss(at, to, 2.3, u);
      g.position.set(p[0], p[1], p[2]);
      g.rotation.set(TAU * 1.5 * u, 0, Math.sin(u * Math.PI) * 0.5);
      g.scale.setScalar(appear);
    } else {
      const sy = 1 + wobble(last, -0.2, 24, 9) * (landed < 4 || last < 1 ? 1 : 0);
      g.position.set(at[0], GRIDDLE.y + (GRIDDLE.thick / 2) * sy, at[2]);
      g.rotation.set(0, 0, 0);
      g.scale.set(size * appear, sy * appear, size * appear);
    }
    puff(at, t, 91, (gone ? 0 : clamp(burnt * 1.4)) * appear);

    // the fires
    FIRES.forEach((f, i) => {
      const k = burning(f, tau) * appear;
      const fl = flames[i];
      fl.group.visible = k > 0.02;
      fl.group.position.set(f.at[0], GRIDDLE.y + GRIDDLE.thick, f.at[2]);
      fl.tongues.forEach((tg, e) => {
        const s = tg.userData.size * 1.1 * k;
        const at = tg.userData.at;
        tg.position.set(at[0] * 1.1 * k, at[1] * 1.1 * k, at[2] * 1.1 * k);
        tg.scale.set(s * (0.9 + 0.12 * Math.sin(t * 17 + e + i)), s * (0.85 + 0.25 * Math.sin(t * 13 + e * 2.1 + i) + 0.1 * Math.sin(t * 29 + e)), s * (0.9 + 0.12 * Math.cos(t * 15 + e)));
        tg.rotation.z = 0.14 * Math.sin(t * 9 + e * 1.3 + i);
        tg.rotation.x = 0.1 * Math.sin(t * 7 + e);
      });
      const gl = glows[i];
      put(gl, [f.at[0], GRIDDLE.y + 0.3, f.at[2]], k > 0.02 ? 1.5 * k * (1 + 0.08 * Math.sin(t * 19 + i)) : 0);
      puff([f.at[0], f.at[1] + 0.5, f.at[2]], t, 60 + i * 5, k * 0.9);
    });

    // the rings: the one that cooks fills, then turns red; the charred ones stay red
    const blink = Math.sin(t * 11) > 0;
    for (let c = 0; c < 3; c++) {
      for (let j = 0; j < 3; j++) {
        const ring = world.griddle.rings[c][j];
        const isMain = c === MAIN[0] && j === MAIN[1];
        const isCharred = CHARRED.some(([cc, jj]) => cc === c && jj === j);
        if (isMain) {
          const on = tau >= DRIPS[3] && !flying;
          ring.arc.visible = on && m > 0.6;
          if (on) {
            ring.arc.geometry = G.ringArc(0.44, 0.505, Math.max(1 / 48, prog(tau, DRIPS[3], COOKED)));
            ring.mat.color.set(tau < COOKED ? C.yellow30 : blink ? C.red30 : C.red20);
          }
        } else if (isCharred) {
          ring.arc.visible = m > 0.6;
          ring.arc.geometry = G.ringArc(0.44, 0.505, 1);
          ring.mat.color.set(Math.sin(t * 5 + c * 2 + j) > 0.2 ? C.red30 : C.red20);
        } else ring.arc.visible = false;
      }
    }
  }

  function drawOrders(t, m, appear, camAz) {
    // the rail: every ticket is late, and they only move when a plate at last leaves
    late.forEach((tk) => (tk.group.visible = false));
    const kMin = Math.floor((t - DONE - 0.5) / ORDER);
    const kMax = Math.ceil((t - DONE + 6 * ORDER + 1) / ORDER);
    for (let k = kMin; k <= kMax; k++) {
      const a = k * ORDER + DONE - t;
      if (a > 6 * ORDER + 1 || a < -0.5) continue;
      const tk = late[mod(k, late.length)];
      tk.group.visible = appear > 0.01;
      let at = 0;
      let swing = 0;
      let feed = 1;
      let drop = 0;
      let size = 1;
      let roll = 0;
      if (a > 6 * ORDER) {
        const f = (1 - (a - 6 * ORDER)) * 6;
        feed = (Math.floor(f) + ease.outCubic(f - Math.floor(f))) / 6;
        at = 6;
      } else if (a >= 0) {
        const n = Math.max(0, Math.ceil(a / ORDER) - 1);
        const e = (n + 1) * ORDER - a;
        at = n + 1 - ease.inOutCubic(clamp(e / 0.55));
        swing = -0.3 * bump(clamp(e / 0.55)) + wobble(e - 0.55, 0.14, 12, 4.2);
      } else {
        const u = -a / 0.5;
        at = -1.15 * ease.inQuad(u);
        drop = 1.5 * u * u;
        roll = -1.3 * u;
        size = 1 - ease.inCubic(u);
      }
      // a late order shakes, in fits
      const fit = bump(prog(mod(t + k * 0.83, 2.6), 0, 0.7));
      tk.group.position.set(RAIL.slot0 - at * RAIL.pitch, RAIL.y - 0.02 - drop, RAIL.z + 0.07);
      tk.group.rotation.set(-0.08, camAz * 0.5, roll);
      tk.group.scale.setScalar(size * appear);
      tk.swing.rotation.z = swing + 0.11 * fit * Math.sin(t * 34 + k);
      tk.swing.scale.y = Math.max(0.02, feed);
      tk.bar.scale.x = tk.barW;
      const stamped = 0.5 - a;
      tk.stamp.visible = stamped > 0;
      tk.stamp.scale.setScalar(ease.outBack(clamp(stamped / 0.22), 2.6));
      tk.stamp.rotation.z = -0.2;
    }
    // the printer keeps printing: with no room on the rail, the tickets fall and pile up
    fallen.forEach((tk, i) => {
      const off = (i % 3) * 4 + 1.5;
      const q = Math.floor((t - off) / ORDER) + (i < 3 ? 0 : -1);
      const x = t - (q * ORDER + off);
      const spot = [RAIL.printer - 0.5 + hash(q, i) * 1.5, 0.03 + (i % 3) * 0.012, RAIL.z + 0.55 + hash(q, i + 9) * 0.75];
      const from = [RAIL.printer, RAIL.y - 0.02, RAIL.z + 0.07];
      tk.group.visible = appear > 0.01 && x >= 0 && x < 2 * ORDER - 0.6;
      tk.bar.scale.x = tk.barW;
      tk.stamp.visible = false;
      if (x < 1) {
        const f = x * 6;
        tk.swing.scale.y = Math.max(0.02, (Math.floor(f) + ease.outCubic(f - Math.floor(f))) / 6);
        tk.group.position.set(from[0], from[1], from[2]);
        tk.group.rotation.set(-0.08, camAz * 0.5, 0);
        tk.swing.rotation.z = 0;
        tk.group.scale.setScalar(appear);
      } else {
        const u = clamp((x - 1) / 0.85);
        const p = mix3(from, spot, ease.inQuad(u));
        tk.swing.scale.y = 1;
        tk.swing.rotation.z = 0;
        tk.group.position.set(p[0] + 0.3 * Math.sin(u * 7) * (1 - u), p[1], p[2]);
        // flat on the floor: a turn about its own face, then laid down
        tk.group.rotation.set(-0.08 - (Math.PI / 2 - 0.08) * ease.inOutSine(u), camAz * 0.5 * (1 - u), (hash(q, i + 3) - 0.5) * 2.6 * u + 0.5 * Math.sin(u * 9) * (1 - u));
        tk.group.scale.setScalar(appear * (1 - prog(x, 2 * ORDER - 1.2, 2 * ORDER - 0.6)));
      }
    });
    const printing = Math.max(...[1.5, 5.5, 9.5].map((off) => bump(prog(mod(t - off, ORDER), 0, 1))));
    if (m > 0.5) {
      world.rail.printerBody.position.x = Math.sin(t * 64) * 0.014 * printing;
      world.rail.printerBody.scale.set(1 + 0.03 * printing, 1 - 0.04 * printing, 1);
    }

    // the plate: it waits a long time for one burnt pancake, then leaves
    dishes.forEach((d, i) => {
      const cyc = Math.floor((t - PLATE_IN) / ORDER) - i;
      const tau = t - cyc * ORDER;
      const on = tau >= PLATE_IN && tau < EXIT;
      d.g.visible = on && appear > 0.01;
      if (!on) return;
      let x = PASS.plate[0];
      let y = PLATE_Y;
      let z = PASS.plate[1];
      let size = 1;
      let squash = 0;
      if (tau < PLATE_IN + 0.5) {
        [x, y, z] = toss([PASS.stack[0], PASS.top + 0.26, PASS.stack[1]], [x, y, z], 0.85, (tau - PLATE_IN) / 0.5);
      } else if (tau < SHIP) {
        squash = wobble(tau - PLATE_IN - 0.5, -0.22, 26, 9) + wobble(tau - BLOWN - FLIGHT, -0.2, 24, 8);
      } else {
        const s = tau - SHIP;
        x = PASS.plate[0] + PUSH * (1 - Math.exp(-5 * s)) + OUT.speed * s;
        y = lerp(PLATE_Y, OUT.y + 0.005, prog(x, 5.05, 5.45));
        size = 1 - 0.86 * prog(x, 8.12, EXIT_X);
      }
      d.g.position.set(x, y, z);
      d.g.scale.set(size * appear, size * appear * (1 + squash), size * appear);
      d.cake.visible = tau >= BLOWN + FLIGHT;
      if (d.cake.visible) puff([x, y + 0.2, z], t, 120 + i, 0.5 * size * appear);
    });
  }

  function drawPanic(states, heads, brows, t, m) {
    // an alarm over a chef when something goes wrong, and sweat all the time
    ["mixer", "cook", "plater"].forEach((name, i) => {
      const st = states[name];
      const head = heads[name];
      const brow = brows[name];
      const a = alarms[i];
      const k = (st.alarm || 0) * m;
      a.visible = k > 0.03;
      a.position.set(st.x, head + 0.55 + (st.y || 0) + 0.2 * k, st.z);
      a.scale.setScalar(ease.outBack(clamp(k * 1.4), 2.2));
      for (let e = 0; e < 2; e++) {
        const d = sweat[i * 2 + e];
        const x = mod(t * 1.8 + e * 0.5 + i * 0.3, 1);
        const side = e ? 1 : -1;
        put(d, [st.x + side * (0.42 + 0.5 * x), brow + (st.y || 0) + 0.75 * x - 1.7 * x * x, st.z + 0.12], 0.085 * (1 - x) * m);
        d.scale.y *= 1.45;
      }
    });
  }

  return {
    STATE,
    served,
    /** how hard the kitchen shakes at time t: a jolt when the belt gives way */
    jolt: (t) => wobble(mod(t, BELTS), 1, 34, 7),
    /** draws the set; `m` is how far the kitchen has gone to pieces, `appear` scales what moves */
    draw(t, m, appear, camAz) {
      cursor = { smoke: 0, drop: 0 };
      set.visible = m > 0.001;
      if (!set.visible) return;
      warn.forEach((w) => w.rotation.set(0, camAz, 0));
      drawTank(t, m);
      drawPipe(t, m);
      drawBelts(t, m);
      drawGriddle(t, m, appear);
      drawOrders(t, m, appear, camAz);
      for (let i = cursor.smoke; i < smoke.length; i++) smoke[i].visible = false;
      for (let i = cursor.drop; i < drops.length; i++) drops[i].visible = false;
    },
    drawPanic,
    /** the extinguisher in the cook's hand, and what comes out of it */
    drawHose(hand, aim, spraying, t, m) {
      hose.visible = m > 0.02;
      if (!hose.visible) {
        foam.forEach((f) => (f.visible = false));
        return;
      }
      const d = [aim[0] - hand[0], aim[1] - hand[1], aim[2] - hand[2]];
      const dl = Math.hypot(d[0], d[1], d[2]) || 1;
      hose.position.set(hand[0], hand[1], hand[2]);
      hose.quaternion.setFromUnitVectors(up, v3.set(d[0] / dl, d[1] / dl, d[2] / dl));
      hose.scale.setScalar(m);
      const from = [hand[0] + (d[0] / dl) * 0.55, hand[1] + (d[1] / dl) * 0.55, hand[2] + (d[2] / dl) * 0.55];
      foam.forEach((f, e) => {
        const u = mod(t * 3.2 + e / foam.length, 1);
        const p = mix3(from, aim, u);
        put(f, [p[0] + 0.12 * u * Math.sin(e * 2.3 + t * 8), p[1] + 0.1 * u * Math.cos(e * 1.9), p[2] + 0.12 * u * Math.sin(e * 3.1)], spraying ? (0.05 + 0.13 * u) * bump(0.1 + 0.9 * u) * m : 0);
      });
    },
    /** the badges of this mode: what broke, the tank that loads, the lead that is late */
    badges(t, m, list, feed) {
      if (m < 0.5) return;
      const k = prog(m, 0.6, 1);
      const x = mod(t, BELTS);
      const hinge = INTAKE.belts[0].hinge;
      list.push({ id: "m-belt", kind: "warn", icon: "warn", text: WORDS.beltDown, at: [hinge[0] - 0.4, INTAKE.y + 2.05, hinge[1]], scale: ease.outBack(clamp(x / 0.3), 2) * k, alpha: (1 - prog(x, 2.6, 3.0)) * k });
      const xl = mod(t - LEAK_AT, BELTS);
      list.push({ id: "m-leak", kind: "warn", icon: "warn", text: WORDS.pipeLeak, at: [LEAK[0] + 1.3, LEAK[1] + 1.25, LEAK[2] - 0.4], scale: ease.outBack(clamp(xl / 0.3), 2) * k, alpha: (1 - prog(xl, 2.6, 3.0)) * k });
      const xr = mod(t, RELOAD);
      const pct = Math.floor(4 + 90 * (xr / RELOAD));
      list.push({ id: "m-tank", kind: "wait", icon: "wait", text: xr < 1.4 ? WORDS.tankRebuilding : `${WORDS.tankLoading} ${pct}%`, at: [TANK.x - 0.1, TANK.h + 1.4, TANK.z], scale: k * (1 + 0.1 * bump(prog(xr, 0, 0.5))), alpha: k });
      const xe = mod(t - EXIT, ORDER);
      const late = WORDS.late[mod(Math.floor((t - EXIT) / ORDER), WORDS.late.length)];
      list.push({ id: "m-out", kind: "late", icon: late.icon, text: late.text, at: feed, scale: k * (1 + 0.16 * wobble(xe, 1, 16, 6)), alpha: k });
    },
    dispose() {
      plates.forEach((p) => p.dispose());
      barGeo.dispose();
      barMat.dispose();
      glowMat.dispose();
      smokeMat.dispose();
      sparkGeo.dispose();
    },
  };
}
