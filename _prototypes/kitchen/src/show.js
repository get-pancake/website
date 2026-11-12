// The animation. Every position on screen is a pure function of the time `t` (in seconds):
// nothing is simulated or accumulated, so the loop can be drawn at any moment, in any order.
//
// The rhythm: one order every T seconds. An order is a ticket on the rail, three pancakes in
// one column of the griddle, then a plate at the pass.
//
//   t = k*T        the mixer chef throws three ladles of batter on a free column
//   + FLIP.at      the cook flips the column, front pancake first
//   + SERVE.at     the cook sends the three pancakes to the plate
//   + TOP.at       the plater tops the stack with what the ticket asks for
//   + SHIP         the bell rings, the plate is pushed onto the way out, the ticket is stamped
//
// The offsets are chosen so that, within one period, the beats follow each other instead of
// landing together: pour, topping, flip, bell, new plate, serve.

import * as THREE from "three";
import { C, FOOD, TONES } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import * as T_ from "./textures.js";
import { BOWL, INTAKE, GRIDDLE, PASS, OUT, RAIL, CHEFS } from "./layout.js";
import { mesh, group } from "./world.js";
import { makeChef, CHEF_SHOULDER } from "./chef.js";
import { makeIngredient, makeGriddlePancake, makePlate, makeTicket, stackY, STACK_TOP, stackJitter, disposeTicketKit } from "./props.js";
import { clamp, lerp, prog, mod, ease, bump, hop, wobble, hash, TAU } from "./util.js";

export const T = 3; // seconds between two orders
const CYCLE = 3 * T; // a column of the griddle cooks one order per cycle
const POUR = { gap: 0.13, air: 0.6 };
const FLIP = { at: 3.9, gap: 0.14, air: 0.52 };
const SERVE = { at: 8.4, gap: 0.2, air: 0.64 };
const PLATE_IN = { at: 7.7, air: 0.5 };
const TOP = { at: 9.55, gap: 0.1, air: 0.42 };
const SHIP = 10.45;
const DONE = SHIP + 0.5; // the ticket leaves the rail
const PUSH = 1.25; // how far the plater shoves the plate
const EXIT_X = 8.66; // the plate is inside the arch
const EXIT_TAU = SHIP + (EXIT_X - PASS.plate[0] - PUSH) / OUT.speed;
const BEAT = T / 2; // the cook acts every half period, a flip then a serve
const COUNT_FROM = 128;

const ORDER_TONES = ["yellow", "purple", "pink", "yellow", "pink", "purple", "purple", "yellow", "pink", "purple", "yellow", "pink"];
const toneOf = (k) => ORDER_TONES[mod(k, ORDER_TONES.length)];

const N_PLATES = 6;
const N_TICKETS = 9;
const N_ITEMS = 6;

const PLATE_Y = PASS.top + 0.03;
const SLOT_Y = GRIDDLE.y + GRIDDLE.thick / 2;
const slot = (c, j) => [GRIDDLE.x + GRIDDLE.cols[c], SLOT_Y, GRIDDLE.z + GRIDDLE.rows[j]];
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const mix3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** a throw from a to b whose apex is `h` above the straight line */
const toss = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * hop(u), lerp(a[2], b[2], u)];

function pool(parent, n, geometry, material, shadow = false) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geometry, material);
    m.visible = false;
    m.castShadow = shadow;
    parent.add(m);
    list.push(m);
  }
  return list;
}

function put(m, p, s) {
  if (!(s > 0.002)) {
    m.visible = false;
    return;
  }
  m.visible = true;
  m.position.set(p[0], p[1], p[2]);
  m.scale.setScalar(s);
}

export function createShow(world, scene, opts = {}) {
  const root = group(scene);
  const tex = world.tex;
  const cBatter = new THREE.Color(FOOD.batter);
  const cCrumb = new THREE.Color(FOOD.crumb);
  const cGolden = new THREE.Color(FOOD.golden);
  const up = new THREE.Vector3(0, 1, 0);
  const v3 = new THREE.Vector3();
  const pointer = { x: 0, y: 0, on: 0 };

  // ── the cast ───────────────────────────────────────────────────────────────
  const chefs = {
    mixer: makeChef(CHEFS.mixer, tex),
    cook: makeChef(CHEFS.cook, tex),
    plater: makeChef(CHEFS.plater, tex),
  };
  Object.values(chefs).forEach((c) => root.add(c.root));

  // the mixer's ladle: its origin is the hand, it points along +y to the cup
  const LADLE = 1.3;
  const ladleTool = group(root);
  mesh(G.cylinder(0.04, 0.045, LADLE - 0.1, 12), M.soft(C.yellow40, 0.6), ladleTool);
  const cup = mesh(G.sphere(1, 18, 12), M.ceramic(C.ink10, 0.35, 0.5), ladleTool, 0, LADLE, 0);
  cup.scale.set(0.2, 0.13, 0.2);
  const cupBatter = mesh(G.sphere(1, 14, 10), M.ceramic(FOOD.batter, 0.32, 0.5), ladleTool, 0, LADLE + 0.02, 0.06, false);

  // the cook's spatula: handle then blade, along +y, flat on its z
  const SPATULA = 1.0;
  const spatula = group(root);
  mesh(G.cylinder(0.04, 0.04, 0.6, 12), M.soft(C.plum, 0.5), spatula);
  mesh(G.block(0.34, 0.42, 0.045, 0.02, 0.016, 4), M.ceramic(C.ink60, 0.3, 0.5), spatula, 0, 0.58, 0);

  // the ingredients on the belts: a few of each kind per belt, shown in turn
  const items = INTAKE.belts.map((b) => {
    const list = [];
    for (let i = 0; i < N_ITEMS; i++) {
      const g = group(root);
      g.visible = false;
      const kinds = {};
      for (const kind of new Set(b.kinds)) {
        kinds[kind] = makeIngredient(kind);
        g.add(kinds[kind]);
      }
      list.push({ g, kinds });
    }
    return list;
  });

  // the pancakes on the griddle: two sets of three per column, used in turn, because a batch
  // is still in the air on its way to the plate when the next one is poured
  const cakes = [0, 1, 2].map(() =>
    [0, 1].map(() =>
      [0, 1, 2].map(() => {
        const p = makeGriddlePancake();
        p.group.visible = false;
        root.add(p.group);
        return p;
      }),
    ),
  );

  const plates = [];
  for (let i = 0; i < N_PLATES; i++) {
    const p = makePlate();
    p.group.visible = false;
    root.add(p.group);
    plates.push(p);
  }

  const tickets = [];
  for (let i = 0; i < N_TICKETS; i++) {
    const tk = makeTicket();
    tk.group.visible = false;
    root.add(tk.group);
    tickets.push(tk);
  }

  // ── small effects ──────────────────────────────────────────────────────────
  const dot = G.sphere(1, 10, 8);
  const batterDots = pool(root, 3 * 2 * 5 + 9 * 4, dot, M.ceramic(FOOD.batter, 0.35, 0.4));
  // steam: soft round sprites, two per pancake
  const steamMat = new THREE.SpriteMaterial({ map: tex.blob, color: "#ffffff", transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  const steam = [];
  for (let i = 0; i < 9 * 2; i++) {
    const sp = new THREE.Sprite(steamMat);
    sp.visible = false;
    root.add(sp);
    steam.push(sp);
  }
  const puffMat = M.soft(C.ink0, 0.9);
  const puffs = pool(root, 9 * 3 + 12, dot, puffMat);
  const sparkGeo = new THREE.OctahedronGeometry(1, 0);
  const sparks = pool(root, 8, sparkGeo, M.glow(C.yellow30));
  const ripples = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(
      G.ringArc(0.82, 1, 1),
      new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    );
    m.visible = false;
    root.add(m);
    return m;
  });
  const bellRings = [0, 1].map(() => {
    const m = new THREE.Mesh(
      G.ringArc(0.86, 1, 1),
      new THREE.MeshBasicMaterial({ color: C.yellow40, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    );
    m.visible = false;
    root.add(m);
    return m;
  });
  const plusTex = T_.plusOne();
  const plus = new THREE.Mesh(
    G.plane(0.8, 0.48),
    new THREE.MeshBasicMaterial({ map: plusTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
  );
  plus.visible = false;
  plus.renderOrder = 4;
  root.add(plus);

  // ── the mixer's ladle, as a function of time ───────────────────────────────
  const STIR = [BOWL.x + 0.12, BOWL.batterY + 0.1, BOWL.z + 0.1];
  const SCOOP = [BOWL.x + 0.5, BOWL.batterY - 0.03, BOWL.z + 0.22];
  const BACK = [BOWL.x + 0.6, 2.55, BOWL.z + 0.5];
  const FWD = [BOWL.x + 2.6, 2.0, BOWL.z + 0.6];
  const stirAt = (t) => {
    const a = t * 4.4;
    return [STIR[0] + Math.cos(a) * 0.46, STIR[1], STIR[2] + Math.sin(a) * 0.4];
  };
  /** where the cup of the ladle is at time t */
  function ladleTip(t) {
    const k = Math.floor((t + 0.9) / T);
    const s = t - k * T; // -0.9 .. 2.1 around the pour
    if (s < -0.5) return mix3(stirAt(t), SCOOP, ease.inOutSine(prog(s, -0.9, -0.5)));
    if (s < -0.12) return toss(SCOOP, BACK, 0.1, ease.outCubic(prog(s, -0.5, -0.12)));
    if (s < 0.34) return toss(BACK, FWD, 0.3, ease.inOutQuad(prog(s, -0.12, 0.34)));
    if (s < 1.0) return toss(FWD, stirAt(t), 0.2, ease.inOutSine(prog(s, 0.34, 1.0)));
    return stirAt(t);
  }

  // ── chefs ──────────────────────────────────────────────────────────────────
  // Each returns where the chef is and what the hands do at time t; `pose` then adds what
  // depends on speed (the trailing pancakes, the wobbling toque).

  function mixerAt(t) {
    const home = CHEFS.mixer.home;
    const k = Math.floor((t + 0.9) / T);
    const s = t - k * T;
    const a = t * 4.4;
    const throwing = bump(prog(s, -0.2, 0.5));
    const tip = ladleTip(t);
    return {
      x: home[0] + Math.cos(a) * 0.035 * (1 - throwing) + 0.16 * throwing,
      z: home[1] + Math.sin(a) * 0.035 * (1 - throwing) - 0.1 * throwing,
      y: 0.2 * hop(prog(s, -0.02, 0.36)),
      squash: -0.1 * bump(prog(s, -0.3, -0.02)) + 0.1 * bump(prog(s, -0.02, 0.3)) + wobble(s - 0.36, -0.12, 22, 9),
      tip,
      loaded: s > -0.5 && s < 0.26,
      look: s > -0.25 && s < 0.9 ? [GRIDDLE.x, GRIDDLE.z] : [tip[0], tip[2]],
      lift: throwing,
    };
  }

  const cookCol = (i) => (mod(i, 2) === 0 ? mod(i / 2, 3) : mod((i - 3) / 2, 3));
  function cookAt(t) {
    const i = Math.floor((t - FLIP.at + 0.95) / BEAT);
    const s = t - (FLIP.at + BEAT * i); // -0.95 .. 0.55 around the action
    const x0 = GRIDDLE.x + GRIDDLE.cols[cookCol(i - 1)];
    const x1 = GRIDDLE.x + GRIDDLE.cols[cookCol(i)];
    const u = prog(s, -0.95, -0.34);
    const hops = Math.abs(x1 - x0) > 1.9 ? 2 : 1;
    const x = lerp(x0, x1, ease.inOutSine(u));
    const z = CHEFS.cook.z;
    const serve = mod(i, 2) === 1;
    const landed = (s + 0.34) * 1; // time since the last hop ended
    // the spatula: rest, slide under the front pancake, flick
    const rest = [x + 0.12, 1.3, z - 0.82];
    const under = [x1 + 0.02, GRIDDLE.y + 0.06, GRIDDLE.z + GRIDDLE.rows[2] + 0.2];
    const flick = serve ? [x1 + 0.75, 2.15, GRIDDLE.z + 0.6] : [x1, 2.1, GRIDDLE.z + 0.35];
    let tip;
    if (s < -0.3) tip = rest;
    else if (s < 0) tip = mix3(rest, under, ease.inOutQuad(prog(s, -0.3, 0)));
    else if (s < 0.15) tip = toss(under, flick, 0.15, ease.outCubic(prog(s, 0, 0.15)));
    else tip = mix3(flick, [x1 + 0.12, 1.3, z - 0.82], ease.inOutSine(prog(s, 0.2, 0.55)));
    return {
      x,
      z,
      y: u < 1 ? 0.34 * Math.abs(Math.sin(hops * Math.PI * u)) : 0.16 * hop(prog(s, 0, 0.3)),
      squash: wobble(landed, -0.16, 22, 9) * (s < 0 ? 1 : 0) - 0.1 * bump(prog(s, -0.3, 0)) + 0.14 * bump(prog(s, 0, 0.3)) + wobble(s - 0.3, -0.1, 22, 9),
      tip,
      serve,
      look: serve && s > 0.05 ? [PASS.plate[0], PASS.plate[1]] : [x1, GRIDDLE.z],
      lift: bump(prog(s, -0.05, 0.4)),
    };
  }

  function platerAt(t) {
    const home = CHEFS.plater.home;
    const k = Math.floor((t - TOP.at + 0.5) / T);
    const s = t - k * T - TOP.at; // -0.5 .. 2.5 around the topping
    const tone = toneOf(k);
    const ci = PASS.caddy.tones.indexOf(tone);
    const step = ease.inOutSine(prog(s, 0.7, 0.9)) * (1 - ease.inOutSine(prog(s, 1.3, 1.75)));
    const x = home[0] - 0.24 * step;
    const z = home[1] - 0.36 * step;
    const restR = [x + 0.62, 0.42, z + 0.16];
    const restL = [x - 0.62, 0.42, z + 0.16];
    // right hand: point at the topping, sweep to the plate, then push the plate
    const point = [PASS.caddy.xs[ci] * 0.35 + x * 0.65 + 0.25, 1.75, z - 0.75];
    const sweep = [PASS.plate[0] + 0.1, 1.45, z - 0.95];
    const plateL = [PASS.plate[0] - 0.56, PLATE_Y + 0.16, PASS.plate[1] + 0.12];
    const pushed = [plateL[0] + 0.95, plateL[1], plateL[2]];
    let handR;
    if (s < 0) handR = mix3(restR, point, ease.outCubic(prog(s, -0.45, -0.08)));
    else if (s < 0.3) handR = toss(point, sweep, 0.12, ease.inOutQuad(prog(s, 0, 0.28)));
    else if (s < 0.9) handR = mix3(mix3(sweep, restR, ease.inOutSine(prog(s, 0.3, 0.6))), plateL, ease.inOutSine(prog(s, 0.68, 0.9)));
    else if (s < 1.2) handR = mix3(plateL, pushed, ease.outCubic(prog(s, 0.9, 1.12)));
    else if (s < 1.8) handR = toss(pushed, [x + 0.7, 1.5, z - 0.5], 0.1, ease.inOutSine(prog(s, 1.2, 1.5)));
    else handR = mix3([x + 0.7, 1.5, z - 0.5], restR, ease.inOutSine(prog(s, 1.8, 2.2)));
    // left hand: ring the bell
    const bellTop = [PASS.bell[0], PASS.top + 0.36, PASS.bell[1]];
    const above = [bellTop[0], bellTop[1] + 0.5, bellTop[2] + 0.1];
    let handL;
    if (s < 0.6) handL = restL;
    else if (s < 0.82) handL = mix3(restL, above, ease.outCubic(prog(s, 0.6, 0.82)));
    else if (s < 0.9) handL = mix3(above, bellTop, ease.inQuad(prog(s, 0.82, 0.9)));
    else if (s < 1.1) handL = mix3(bellTop, above, ease.outCubic(prog(s, 0.9, 1.1)));
    else handL = mix3(above, restL, ease.inOutSine(prog(s, 1.1, 1.6)));
    // this order's pancakes land on the plate just before the topping
    const landed = s - (SERVE.at + SERVE.air - TOP.at);
    return {
      x,
      z,
      y: 0.26 * hop(prog(s, 0.92, 1.3)),
      squash:
        -0.08 * bump(prog(s, 0.74, 0.92)) +
        0.12 * bump(prog(s, 0.92, 1.2)) +
        wobble(s - 1.3, -0.14, 22, 9) +
        wobble(landed, -0.05, 20, 8) +
        wobble(landed - SERVE.gap, -0.05, 20, 8) +
        wobble(landed - SERVE.gap * 2, -0.05, 20, 8),
      handL,
      handR,
      look: s > 1.2 && s < 1.9 ? [PASS.stack[0], PASS.stack[1]] : s > -0.5 && s < 0.1 ? [PASS.caddy.xs[ci], PASS.caddy.z] : [PASS.plate[0] + 0.6 * prog(s, 0.9, 1.3), PASS.plate[1]],
      lift: 0,
    };
  }

  const STATE = { mixer: mixerAt, cook: cookAt, plater: platerAt };
  // a chef that is tapped jumps: when it was last tapped, and where it stands
  const poked = { mixer: -99, cook: -99, plater: -99 };
  const standing = { mixer: [0, 0], cook: [0, 0], plater: [0, 0] };
  const BLINK = { mixer: [3.7, 0.4], cook: [4.3, 1.9], plater: [3.1, 2.7] };
  let camAz = 0;
  const camRight = new THREE.Vector3(1, 0, 0);
  const camBack = new THREE.Vector3(0, 0, 1);

  function drawChef(name, t, appear) {
    const chef = chefs[name];
    const now = STATE[name](t);
    const was = STATE[name](t - 0.07);
    const vx = (now.x - was.x) / 0.07;
    const vz = (now.z - was.z) / 0.07;
    const vy = ((now.y || 0) - (was.y || 0)) / 0.07;
    const lag = [clamp(-vx * 0.035, -0.13, 0.13), clamp(-vz * 0.035, -0.13, 0.13)];
    // the eyes: towards what the chef works on, in the plane of the face
    const dx = now.look[0] - now.x;
    const dz = now.look[1] - now.z;
    const len = Math.hypot(dx, dz) || 1;
    const lx = (dx * camRight.x + dz * camRight.z) / len;
    const lz = (dx * camBack.x + dz * camBack.z) / len;
    const [period, phase] = BLINK[name];
    const b = mod(t + phase, period);
    const s = chef.scale;
    standing[name][0] = now.x;
    standing[name][1] = now.z;
    const pk = t - poked[name];
    const jump = pk >= 0 && pk < 1.4;
    if (jump) {
      now.y = (now.y || 0) + 0.8 * hop(prog(pk, 0.06, 0.6));
      now.squash += -0.2 * bump(prog(pk, 0, 0.12)) + 0.14 * bump(prog(pk, 0.08, 0.4)) + wobble(pk - 0.6, -0.22, 22, 8);
    }

    let handL = now.handL || null;
    let handR = now.handR || null;
    if (now.tip) {
      // the tool is held between the tip and the shoulder
      const tool = name === "mixer" ? LADLE : SPATULA;
      // the mixer holds the ladle high, to pass over the rim of the bowl
      const reach = name === "mixer" ? 1.75 : CHEF_SHOULDER * s;
      const sh = [now.x + 0.2 * s, reach + (now.y || 0), now.z - 0.05];
      const d = [sh[0] - now.tip[0], sh[1] - now.tip[1], sh[2] - now.tip[2]];
      const dl = Math.hypot(d[0], d[1], d[2]) || 1;
      handR = [now.tip[0] + (d[0] / dl) * tool, now.tip[1] + (d[1] / dl) * tool, now.tip[2] + (d[2] / dl) * tool];
      const obj = name === "mixer" ? ladleTool : spatula;
      obj.position.set(handR[0], handR[1], handR[2]);
      v3.set(-d[0] / dl, -d[1] / dl, -d[2] / dl);
      obj.quaternion.setFromUnitVectors(up, v3);
      obj.scale.setScalar(appear);
      handL = [now.x - 0.6 * s, (0.42 + 0.5 * now.lift + (now.y || 0)) * s, now.z + 0.16 - 0.25 * now.lift];
    }
    chef.pose({
      x: now.x,
      z: now.z,
      y: now.y,
      squash: now.squash + 0.012 * Math.sin(t * 2.3 + phase),
      lag,
      az: camAz,
      nod: clamp(-vy * 0.03, -0.12, 0.12),
      look: [lx * 0.9 + pointer.x * 0.45 * pointer.on, lz * 0.8 + pointer.y * 0.4 * pointer.on],
      blink: jump && pk < 0.7 ? bump(prog(pk, 0.05, 0.7)) : b < 0.13 ? bump(b / 0.13) : 0,
      roll: jump ? 0.3 * Math.sin(prog(pk, 0.06, 0.6) * TAU) : 0,
      hat: [lag[0] * 2.2 + 0.03 * Math.sin(t * 2.9 + phase), lag[1] * 2.2 - clamp(vy * 0.05, -0.2, 0.2)],
      handL,
      handR,
    });
    chef.root.scale.setScalar(s * appear);
    chef.root.visible = appear > 0.01;
    return now;
  }

  // ── belts and the bowl ─────────────────────────────────────────────────────
  const PERIOD = INTAKE.gap / INTAKE.speed;
  const DROP = 0.4;
  let dotCursor = 0;
  const nextDot = () => batterDots[dotCursor++];

  function drawIntake(t, appear) {
    let jiggle = 0;
    world.belts.forEach((belt, b) => {
      const spec = INTAKE.belts[b];
      belt.map.offset.x = -mod((t * INTAKE.speed) / 0.52, 1);
      const phase = (b * PERIOD) / 3;
      const n0 = Math.floor((t - phase) / PERIOD);
      const end = [spec.to[0], INTAKE.y + 0.01, spec.to[1]];
      const land = [spec.to[0] + spec.dir[0] * 0.5, BOWL.batterY - 0.05, spec.to[1] + spec.dir[1] * 0.5];
      for (let i = 0; i < N_ITEMS; i++) {
        const n = n0 - i;
        const item = items[b][mod(n, N_ITEMS)];
        const age = t - phase - n * PERIOD;
        const s = age * INTAKE.speed;
        const kind = spec.kinds[mod(n, spec.kinds.length)];
        for (const key in item.kinds) item.kinds[key].visible = key === kind;
        const turn = hash(n, b) * TAU;
        if (s <= spec.len) {
          item.g.visible = s > 0.3;
          item.g.position.set(spec.from[0] + spec.dir[0] * s, INTAKE.y + 0.006, spec.from[1] + spec.dir[1] * s);
          item.g.rotation.set(0, turn, Math.sin(t * 9 + n) * 0.02);
          item.g.scale.setScalar(appear);
        } else {
          const u = (age - spec.len / INTAKE.speed) / DROP;
          if (u < 1) {
            const p = toss(end, land, 0.3, u);
            item.g.visible = true;
            item.g.position.set(p[0], p[1], p[2]);
            item.g.rotation.set(u * 2.4, turn, u * 1.1);
            item.g.scale.setScalar(appear);
          } else if (u < 1.3) {
            const k = 1 - (u - 1) / 0.3;
            item.g.visible = true;
            item.g.position.set(land[0], land[1] - 0.22 * (1 - k), land[2]);
            item.g.scale.setScalar(k * appear);
          } else item.g.visible = false;
        }
      }
      // the splashes of the last two ingredients that fell in
      const landPhase = phase + spec.len / INTAKE.speed + DROP;
      const nl = Math.floor((t - landPhase) / PERIOD);
      for (let e = 0; e < 2; e++) {
        const n = nl - e;
        const x = t - landPhase - n * PERIOD;
        if (e === 0) {
          jiggle += wobble(x, 0.03, 21, 7);
          const ring = ripples[b];
          const rv = prog(x, 0, 0.7);
          ring.visible = rv < 1 && appear > 0.9;
          ring.position.set(land[0], BOWL.batterY + 0.012, land[2]);
          ring.scale.setScalar(0.12 + 0.42 * ease.outCubic(rv));
          ring.material.opacity = 0.75 * (1 - rv);
        }
        for (let d = 0; d < 5; d++) {
          const m = nextDot();
          const a = hash(n, d * 3 + b) * TAU;
          const vr = 0.5 + hash(n, d * 3 + 1) * 0.9;
          const vy = 1.7 + hash(n, d * 3 + 2) * 1.1;
          const life = 0.5;
          put(m, [land[0] + Math.cos(a) * vr * x, land[1] + 0.06 + vy * x - 4.6 * x * x, land[2] + Math.sin(a) * vr * x], x < life ? 0.062 * (1 - x / life) * appear : 0);
        }
      }
    });
    // the bowl jiggles, the swirl follows the spoon
    const j = jiggle;
    world.bowl.body.scale.set(1 - j * 0.5, 1 + j, 1 - j * 0.5);
    world.bowl.swirl.rotation.y = -t * 1.5;
    world.out.map.offset.x = -mod((t * OUT.speed) / 0.6, 1);
  }

  // ── the griddle ────────────────────────────────────────────────────────────
  function drawCake(cake, k, c, j, tau, appear) {
    const g = cake.group;
    const at = slot(c, j);
    const launch = j * POUR.gap;
    const land = launch + POUR.air;
    const fl = FLIP.at + (2 - j) * FLIP.gap;
    const flEnd = fl + FLIP.air;
    const sv = SERVE.at + (2 - j) * SERVE.gap;
    const svEnd = sv + SERVE.air;
    if (tau < launch || tau >= svEnd) {
      g.visible = false;
      return;
    }
    g.visible = true;
    let pos = at;
    let sx = 1;
    let sy = 1;
    let rx = 0;
    let rz = 0;
    if (tau < land) {
      // the ladle of batter, in the air
      const from = ladleTip(k * T + launch);
      const u = (tau - launch) / POUR.air;
      pos = toss(from, at, 1.0 + 0.2 * dist2(from, at), u);
      sx = 0.42;
      sy = 2.3;
      rx = u * 1.2;
    } else if (tau < fl) {
      const x = tau - land;
      sx = lerp(0.42, 1, ease.outBack(clamp(x / 0.3), 2.4));
      sy = lerp(2.3, 1, ease.outCubic(clamp(x / 0.18))) * (1 + wobble(x - 0.18, -0.24, 25, 9));
      sy *= 1 - 0.3 * bump(prog(tau, fl - 0.12, fl));
      pos = [at[0], GRIDDLE.y + (GRIDDLE.thick / 2) * sy, at[2]];
    } else if (tau < flEnd) {
      const u = (tau - fl) / FLIP.air;
      pos = [at[0], at[1] + 1.2 * hop(u), at[2]];
      rx = Math.PI * ease.inOutQuad(u);
      sy = 1 + 0.12 * bump(u);
    } else if (tau < sv) {
      rx = Math.PI;
      sy = (1 + wobble(tau - flEnd, -0.3, 25, 9)) * (1 - 0.3 * bump(prog(tau, sv - 0.12, sv)));
      pos = [at[0], GRIDDLE.y + (GRIDDLE.thick / 2) * sy, at[2]];
    } else {
      const n = 2 - j; // its place in the stack
      const jit = stackJitter(k, n);
      const to = [PASS.plate[0] + jit[0], PLATE_Y + stackY(n) + GRIDDLE.thick / 2, PASS.plate[1] + jit[1]];
      const u = (tau - sv) / SERVE.air;
      pos = toss(at, to, 1.55 + 0.14 * dist2(at, to), u);
      rx = Math.PI + TAU * ease.inOutSine(u);
      rz = Math.sin(u * Math.PI) * 0.35;
    }
    g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.set(rx, 0, rz);
    g.scale.set(sx * appear, sy * appear, sx * appear);

    const a = ease.outQuad(prog(tau, land, fl));
    const b = ease.outQuad(prog(tau, flEnd, SERVE.at));
    cake.faceB.color.lerpColors(cBatter, cGolden, a);
    cake.faceA.color.lerpColors(cBatter, cGolden, b);
    cake.body.color.lerpColors(cBatter, cCrumb, (a + b) / 2);
  }

  function drawGriddle(t, appear) {
    let s = 0;
    let p = 0;
    for (let c = 0; c < 3; c++) {
      const m = Math.floor((t - c * T) / CYCLE);
      const k = c + 3 * m;
      const tau = t - k * T;
      const tone = TONES[toneOf(k)];
      for (let j = 0; j < 3; j++) {
        // this batch, and the one before it while it flies to the plate
        drawCake(cakes[c][mod(m, 2)][j], k, c, j, tau, appear);
        drawCake(cakes[c][mod(m - 1, 2)][j], k - 3, c, j, tau + CYCLE, appear);

        const ring = world.griddle.rings[c][j];
        const at = slot(c, j);
        const land = j * POUR.gap + POUR.air;
        const fl = FLIP.at + (2 - j) * FLIP.gap;
        const flEnd = fl + FLIP.air;
        const sv = SERVE.at + (2 - j) * SERVE.gap;

        // steam, the splat of the batter, the puff of a flip: all at this slot
        const cooking = tau >= land + 0.3 && tau < sv && !(tau >= fl && tau < flEnd);
        for (let e = 0; e < 2; e++) {
          const sm = steam[s++];
          const period = 1.5;
          const x = mod(tau + e * 0.75 + hash(c * 3 + j, 9) * period, period) / period;
          put(sm, [at[0] + Math.sin(tau * 2 + e * 3 + j) * 0.09, at[1] + 0.3 + x * 1.0, at[2] - 0.1], cooking ? (0.22 + 0.34 * x) * bump(x) * appear : 0);
        }
        const xs = tau - land;
        for (let e = 0; e < 4; e++) {
          const dm = nextDot();
          const a = hash(k * 3 + j, e) * TAU;
          const vr = 0.7 + hash(k * 3 + j, e + 5) * 0.6;
          put(dm, [at[0] + Math.cos(a) * (0.3 + vr * xs), GRIDDLE.y + 0.04 + 1.5 * xs - 5 * xs * xs, at[2] + Math.sin(a) * (0.3 + vr * xs)], xs > 0 && xs < 0.42 ? 0.05 * (1 - xs / 0.42) * appear : 0);
        }
        const xf = tau - flEnd;
        for (let e = 0; e < 3; e++) {
          const pm = puffs[p++];
          const a = (e / 3) * TAU + hash(k, j) * 2;
          put(pm, [at[0] + Math.cos(a) * (0.36 + xf * 0.8), GRIDDLE.y + 0.08 + xf * 0.5, at[2] + Math.sin(a) * (0.36 + xf * 0.8)], xf > 0 && xf < 0.4 ? 0.085 * bump(0.25 + (0.75 * xf) / 0.4) * appear : 0);
        }

        const on = tau >= land && tau < sv;
        ring.arc.visible = on && appear > 0.9;
        if (on) {
          ring.arc.geometry = G.ringArc(0.44, 0.505, Math.max(1 / 48, prog(tau, land, SERVE.at)));
          ring.mat.color.set(tone.c30);
        }
      }
    }
  }

  // ── the pass and the way out ───────────────────────────────────────────────
  const STACK_SRC = [PASS.stack[0], PASS.top + 0.26, PASS.stack[1]];
  let puffCursor = 0;

  function drawPass(t, appear) {
    plates.forEach((p) => (p.group.visible = false));
    for (let i = 27; i < puffs.length; i++) puffs[i].visible = false;
    puffCursor = 27;
    const kMax = Math.floor((t - PLATE_IN.at) / T);
    const kMin = Math.ceil((t - EXIT_TAU) / T);
    for (let k = kMin; k <= kMax; k++) {
      const tau = t - k * T;
      if (tau < PLATE_IN.at || tau >= EXIT_TAU) continue;
      const plate = plates[mod(k, N_PLATES)];
      const tone = toneOf(k);
      plate.group.visible = true;
      let x = PASS.plate[0];
      let y = PLATE_Y;
      let z = PASS.plate[1];
      let spin = 0;
      let size = 1;
      let squash = 0;
      const inEnd = PLATE_IN.at + PLATE_IN.air;
      if (tau < inEnd) {
        const u = (tau - PLATE_IN.at) / PLATE_IN.air;
        [x, y, z] = toss(STACK_SRC, [x, y, z], 0.85, u);
        spin = (1 - u) * -2.6;
        size = 0.94 + 0.06 * u;
      } else if (tau < SHIP) {
        squash = wobble(tau - inEnd, -0.22, 26, 9);
      } else {
        const s = tau - SHIP;
        x = PASS.plate[0] + PUSH * (1 - Math.exp(-5 * s)) + OUT.speed * s;
        y = lerp(PLATE_Y, OUT.y + 0.005, prog(x, 5.05, 5.45));
        size = 1 - 0.86 * prog(x, 8.12, EXIT_X);
        spin = 0.5 * (1 - Math.exp(-4 * s));
      }
      plate.group.position.set(x, y, z);
      plate.group.rotation.y = spin;
      plate.group.scale.setScalar(size * appear);

      // the pancakes that have landed, and the squash of each landing
      let press = 0;
      plate.cakes.forEach((cake, n) => {
        const landed = SERVE.at + n * SERVE.gap + SERVE.air;
        cake.visible = tau >= landed;
        const jit = stackJitter(k, n);
        cake.position.set(jit[0], stackY(n), jit[1]);
        cake.rotation.y = jit[2];
        press += wobble(tau - landed, -0.2, 24, 8);
        // a puff of crumbs when it lands
        for (let e = 0; e < 4 && tau < SHIP; e++) {
          const m = puffs[puffCursor++];
          if (!m) continue;
          const xl = tau - landed;
          const a = (e / 4) * TAU + n;
          put(m, [PASS.plate[0] + Math.cos(a) * (0.42 + xl * 0.9), PLATE_Y + stackY(n) + 0.08 + xl * 0.3, PASS.plate[1] + Math.sin(a) * (0.42 + xl * 0.9)], xl > 0 && xl < 0.32 ? 0.07 * (1 - xl / 0.32) * appear : 0);
        }
      });
      plate.stack.scale.set(1 - press * 0.4, 1 + press, 1 - press * 0.4);
      plate.body.scale.set(1, 1 + squash, 1);

      // the topping the ticket asks for
      for (const name in plate.toppings) {
        const tp = plate.toppings[name];
        const on = name === tone && tau >= TOP.at;
        tp.group.visible = on;
        if (!on) continue;
        const ci = PASS.caddy.tones.indexOf(name);
        const src = [PASS.caddy.xs[ci] - PASS.plate[0], PASS.top + 0.3 - PLATE_Y - STACK_TOP, PASS.caddy.z - PASS.plate[1]];
        tp.pieces.forEach((piece, i) => {
          const u = (tau - TOP.at - i * TOP.gap) / TOP.air;
          const rest = piece.userData.rest;
          const size0 = piece.userData.size;
          if (u < 0) {
            piece.visible = false;
            return;
          }
          piece.visible = true;
          const bounce = u < 1 ? 1 : 1 + wobble((u - 1) * TOP.air, 0.3, 26, 9);
          if (u < 1) {
            const q = toss(src, [rest.x, rest.y, rest.z], 1.25, u);
            piece.position.set(q[0], q[1], q[2]);
          } else piece.position.copy(rest);
          piece.scale.set(size0.x * (2 - bounce), size0.y * bounce, size0.z * (2 - bounce));
        });
        const v = prog(tau, TOP.at + 0.25, TOP.at + 0.8);
        tp.puddle.visible = v > 0;
        const pv = ease.outBack(v, 1.4);
        tp.puddle.scale.set(Math.max(0.001, pv), Math.max(0.001, ease.outCubic(v)), Math.max(0.001, pv));
      }
    }

    // the bell, the sparks and the two rings when a plate ships
    const ks = Math.floor((t - SHIP) / T);
    const xs = t - SHIP - ks * T;
    world.pass.bellDome.scale.set(1 + wobble(xs, 0.22, 34, 7), 1 - wobble(xs, 0.2, 34, 7), 1 + wobble(xs, 0.22, 34, 7));
    world.pass.bellDome.rotation.z = wobble(xs, 0.22, 30, 6);
    bellRings.forEach((r, e) => {
      const x = xs - e * 0.14;
      const v = prog(x, 0, 0.6);
      r.visible = x > 0 && v < 1 && appear > 0.9;
      r.position.set(PASS.bell[0], PASS.top + 0.2, PASS.bell[1]);
      r.scale.setScalar(0.2 + 0.75 * ease.outCubic(v));
      r.material.opacity = 0.9 * (1 - v);
    });
    sparks.forEach((m, e) => {
      const a = (e / sparks.length) * TAU + ks;
      const vr = 1.5 + hash(ks, e) * 1.3;
      const x = xs;
      const life = 0.55;
      put(m, [PASS.plate[0] + 0.3 + Math.cos(a) * vr * x * 0.6, PLATE_Y + STACK_TOP + 0.3 + (2.2 + hash(ks, e + 9)) * x - 4 * x * x, PASS.plate[1] + Math.sin(a) * vr * x * 0.6], x > 0 && x < life ? 0.075 * bump(0.2 + (0.8 * x) / life) * appear : 0);
      m.rotation.set(x * 7, x * 5 + e, 0);
    });

    // the counter ticks when a plate has left
    const served = Math.floor((t - EXIT_TAU) / T);
    world.out.counter.set(COUNT_FROM + served);
    const xe = t - EXIT_TAU - served * T;
    world.out.board.scale.setScalar(1 + wobble(xe, 0.16, 20, 7));
    const pv = prog(xe, 0, 1.0);
    plus.visible = pv < 1 && appear > 0.9;
    plus.position.set(OUT.portalX - 0.75, 3.2 + 0.7 * ease.outCubic(pv), OUT.z + 0.55);
    plus.material.opacity = pv < 0.7 ? 1 : 1 - (pv - 0.7) / 0.3;
    plus.scale.setScalar(ease.outBack(clamp(pv / 0.25), 2.6));
  }

  // ── the tickets ────────────────────────────────────────────────────────────
  const SHIFT = 0.55;
  const PRINT = 1.0;

  function drawTickets(t, appear) {
    tickets.forEach((tk) => (tk.group.visible = false));
    const kMin = Math.floor((t - DONE - 0.5) / T);
    const kMax = Math.ceil((t - DONE + 6 * T + PRINT) / T);
    let printing = 0;
    for (let k = kMin; k <= kMax; k++) {
      const a = k * T + DONE - t; // seconds before this ticket leaves the rail
      if (a > 6 * T + PRINT || a < -0.5) continue;
      const tk = tickets[mod(k, N_TICKETS)];
      tk.setTone(toneOf(k));
      tk.group.visible = true;
      let at = 0;
      let swing = 0;
      let feed = 1;
      let drop = 0;
      let size = 1;
      let roll = 0;
      if (a > 6 * T) {
        // coming out of the printer, in small jerks
        const u = 1 - (a - 6 * T) / PRINT;
        const steps = 6;
        const f = u * steps;
        feed = (Math.floor(f) + ease.outCubic(f - Math.floor(f))) / steps;
        at = 6;
        printing = Math.max(printing, bump(u));
      } else if (a >= 0) {
        const n = Math.max(0, Math.ceil(a / T) - 1);
        const e = (n + 1) * T - a; // since the rail last moved
        const u = clamp(e / SHIFT);
        at = n + 1 - ease.inOutCubic(u);
        swing = -0.3 * bump(u) + wobble(e - SHIFT, 0.14, 12, 4.2);
      } else {
        const u = -a / 0.5;
        at = -1.15 * ease.inQuad(u);
        drop = 1.5 * u * u;
        roll = -1.3 * u;
        size = 1 - ease.inCubic(u);
      }
      tk.group.position.set(RAIL.slot0 - at * RAIL.pitch, RAIL.y - 0.02 - drop, RAIL.z + 0.07);
      tk.group.rotation.set(-0.08, camAz * 0.5, roll);
      tk.group.scale.setScalar(size * appear);
      tk.swing.rotation.z = swing + 0.028 * Math.sin(t * 1.8 + k * 1.3);
      tk.swing.scale.y = Math.max(0.02, feed);
      tk.bar.scale.x = Math.max(0.001, tk.barW * prog(t, k * T, k * T + SHIP));
      const stamped = 0.5 - a;
      tk.stamp.visible = stamped > 0;
      tk.stamp.scale.setScalar(ease.outBack(clamp(stamped / 0.22), 2.6));
      tk.stamp.rotation.z = -0.2;
    }
    const body = world.rail.printerBody;
    body.position.x = Math.sin(t * 64) * 0.014 * printing;
    body.scale.set(1 + 0.03 * printing, 1 - 0.04 * printing, 1);
  }

  // ── the first second: the kitchen pops out of the floor ────────────────────
  let introT = typeof opts.introAt === "number" ? opts.introAt : opts.intro === false || opts.autoplay === false ? 99 : 0;
  const INTRO = [
    [world.belts[0].group, 0.0],
    [world.belts[1].group, 0.08],
    [world.belts[2].group, 0.16],
    [world.bowl.group, 0.26],
    [world.griddle.group, 0.36],
    [world.pass.group, 0.46],
    [world.out.group, 0.56],
    [world.rail.group, 0.66],
  ];

  function update(t, dt, camera) {
    introT += dt;
    if (camera) {
      camera.matrixWorld.extractBasis(camRight, v3, camBack);
      camAz = Math.atan2(camBack.x, camBack.z);
      camRight.y = 0;
      camRight.normalize();
      camBack.y = 0;
      camBack.normalize();
      plus.quaternion.copy(camera.quaternion);
    }
    pointer.on += ((pointer.x || pointer.y ? 1 : 0) - pointer.on) * (1 - Math.exp(-dt * 4));
    for (const [g, delay] of INTRO) {
      const v = ease.outBack(prog(introT, delay, delay + 0.6), 1.5);
      g.scale.setScalar(Math.max(0.0001, v));
    }
    const appear = ease.outBack(prog(introT, 1.0, 1.5), 1.6);
    dotCursor = 0;
    drawIntake(t, appear);
    drawGriddle(t, appear);
    drawPass(t, appear);
    drawTickets(t, appear);
    const mixer = drawChef("mixer", t, ease.outBack(prog(introT, 0.8, 1.3), 1.8));
    drawChef("cook", t, ease.outBack(prog(introT, 0.9, 1.4), 1.8));
    drawChef("plater", t, ease.outBack(prog(introT, 1.0, 1.5), 1.8));
    cupBatter.visible = mixer.loaded;
    cupBatter.scale.setScalar(0.15);
  }

  return {
    update,
    pointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    reset() {
      introT = 99;
    },
    /** play the opening again: the kitchen pops out of the floor */
    replay() {
      introT = 0;
    },
    /** the chef under a point of the canvas (x, y in -1..1, y up), or null */
    pick(x, y, camera, aspect) {
      let best = null;
      let near = 0.11;
      for (const name in standing) {
        v3.set(standing[name][0], 0.7, standing[name][1]).project(camera);
        const d = Math.hypot((v3.x - x) * aspect, v3.y - y);
        if (d < near) {
          near = d;
          best = name;
        }
      }
      return best;
    },
    poke(name, t) {
      if (name in poked && t - poked[name] > 1.2) poked[name] = t;
    },
    dispose() {
      disposeTicketKit();
      steamMat.dispose();
      sparkGeo.dispose();
      plusTex.dispose();
      world.out.counter.tex.dispose();
    },
  };
}
