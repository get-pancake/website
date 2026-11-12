// The static set: the slab, the three intake belts, the bowl, the griddle, the pass, the way
// out, and the rail the order tickets hang from. Returns the handles the animation moves.

import * as THREE from "three";
import { C, FOOD, TONES } from "./palette.js";
import * as G from "./geo.js";
import * as M from "./mats.js";
import * as T from "./textures.js";
import { FLOOR, BOWL, INTAKE, GRIDDLE, PASS, OUT, RAIL } from "./layout.js";

export function mesh(geo, mat, parent, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = shadow;
  if (parent) parent.add(m);
  return m;
}

export function group(parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

/** a soft dark patch on the floor, under something: the cheap half of the ambient shadow */
export function softShadow(parent, tex, x, z, w, d, opacity = 0.2, y = 0.004, rotY = 0) {
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    color: C.plum,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
  });
  const m = new THREE.Mesh(G.floorPlane(1, 1), mat);
  m.position.set(x, y, z);
  m.scale.set(w, 1, d);
  m.rotation.y = rotY;
  m.renderOrder = 1;
  parent.add(m);
  return m;
}

function buildFloor(root, tex) {
  const top = -0.06; // the slab's top; the tiles bring the floor up to y = 0
  const page = top - FLOOR.slabH - 0.34; // the page the slab floats over

  // the page: it only shows the slab's shadow
  const catcher = new THREE.Mesh(G.floorPlane(70, 50), new THREE.ShadowMaterial({ color: C.plum, opacity: 0.16 }));
  catcher.position.set(FLOOR.cx, page, FLOOR.cz);
  catcher.receiveShadow = true;
  root.add(catcher);
  softShadow(root, tex.slab, FLOOR.cx + 0.25, FLOOR.cz - 0.2, FLOOR.slabW + 4.4, FLOOR.slabD + 4.4, 0.1, page + 0.002);

  mesh(G.block(FLOOR.slabW, FLOOR.slabH, FLOOR.slabD, 1.25, 0.2, 18), M.soft(C.ink30, 0.72), root, FLOOR.cx, top - FLOOR.slabH, FLOOR.cz);

  // the tiles: a faint checker, each one a rolled little block
  const n = FLOOR.cols * FLOOR.rows;
  const tiles = new THREE.InstancedMesh(G.block(0.95, 0.06, 0.95, 0.15, 0.028, 4, 2), M.soft("#ffffff", 0.7), n);
  const m4 = new THREE.Matrix4();
  const a = new THREE.Color(C.ink10);
  const b = new THREE.Color(C.ink20).lerp(new THREE.Color(C.yellow10), 0.16);
  let i = 0;
  for (let cx = 0; cx < FLOOR.cols; cx++) {
    for (let rz = 0; rz < FLOOR.rows; rz++) {
      m4.makeTranslation(FLOOR.x0 + 0.5 + cx, top, FLOOR.z0 + 0.5 + rz);
      tiles.setMatrixAt(i, m4);
      tiles.setColorAt(i, (cx + rz) % 2 ? a : b);
      i++;
    }
  }
  tiles.receiveShadow = true;
  tiles.castShadow = false;
  root.add(tiles);
}

function counter(root, x, z, w, d, top, color) {
  const g = group(root, x, 0, z);
  const slabH = 0.13;
  mesh(G.block(w, top - slabH + 0.02, d, 0.42, 0.1, 12), M.soft(color), g);
  mesh(G.block(w + 0.12, slabH, d + 0.12, 0.46, 0.05, 12), M.soft(C.ink10, 0.55), g, 0, top - slabH, 0);
  return g;
}

/** the length of one arrow on a belt */
export const CHEVRON = 0.52;

function buildBelt(root, tex, { from, dir, len, y, width, supportColor, portalColor, arches, tip }) {
  const g = group(root, from[0], 0, from[1]);
  g.rotation.y = -Math.atan2(dir[1], dir[0]);
  const deckH = 0.18;
  // a stretch of belt: the deck, its two rails and the arrows that run along it
  const stretch = (parent, x0, L, top) => {
    mesh(G.block(L, deckH, width, 0.085, 0.06, 6), M.soft(C.plum, 0.8), parent, x0 + L / 2, top - deckH, 0);
    for (const s of [-1, 1]) {
      mesh(G.block(L - 0.08, 0.1, 0.1, 0.045, 0.035, 4), M.soft(C.ink10, 0.55), parent, x0 + L / 2, top - 0.035, s * (width / 2 - 0.03));
    }
    const map = tex.chevrons.clone();
    map.needsUpdate = true;
    map.repeat.set((L - 0.2) / CHEVRON, 1);
    const chev = new THREE.Mesh(
      G.floorPlane(L - 0.2, width - 0.34),
      new THREE.MeshBasicMaterial({ map, color: C.ink70, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false }),
    );
    chev.position.set(x0 + L / 2, top + 0.003, 0);
    chev.renderOrder = 1;
    parent.add(chev);
    return map;
  };
  // the run that sits on the support, then the tip that overhangs the bowl: it hinges at the
  // end of the support, and droops when the belt breaks
  const main = len - tip;
  const map = stretch(g, 0, main, y);
  const tipGroup = group(g, main, y, 0);
  const tipMap = stretch(tipGroup, 0, tip, 0);

  // the support, with arches
  const sx0 = 0.35;
  const sLen = main - sx0;
  const sH = y - deckH + 0.03;
  const sup = mesh(G.viaduct(sLen, sH, width - 0.28, arches, 0.07), M.soft(supportColor), g, sx0, 0, 0);
  softShadow(g, tex.rect, len / 2 + 0.1, 0, len + 0.7, width + 0.9, 0.16);

  // the tunnel the belt comes out of, and the dark inside of it
  const P = { W: width + 0.74, H: y + 1.14, D: 1.12, holeW: width + 0.14, holeH: y + 0.78 };
  const portal = mesh(G.archBlock(P.W, P.H, P.D, P.holeW, P.holeH, 0.36, 0.08), M.soft(portalColor), g, P.D / 2, 0, 0);
  portal.rotation.y = Math.PI / 2;
  mesh(G.block(P.D - 0.42, P.holeH - 0.05, P.holeW - 0.03, 0.03, 0.02, 3), M.soft(C.plum, 0.9), g, 0.03 + (P.D - 0.42) / 2, 0, 0, false);
  softShadow(g, tex.rect, P.D / 2, 0, P.D + 1.0, P.W + 1.0, 0.2);
  return { group: g, map, tip: tipGroup, tipMap, main, sup, from, dir, len, y, width, mouth: P.D, top: P.H };
}

function buildBowl(root, tex) {
  const g = group(root, BOWL.x, 0, BOWL.z);
  softShadow(g, tex.blob, 0.05, 0, 3.4, 3.4, 0.3);
  mesh(G.puck(0.8, BOWL.base + 0.02, 0.05, 48), M.ceramic(C.purple30, 0.4, 0.4), g);
  // everything above the foot wobbles when something lands in the batter
  const body = group(g, 0, BOWL.base, 0);
  mesh(G.bowl(BOWL.r, 0.74, BOWL.h, 0.11), M.ceramic(C.purple20, 0.36, 0.55), body);
  const batter = mesh(G.puck(BOWL.batterR, 0.2, 0.04, 56), M.ceramic(FOOD.batter, 0.32, 0.5), body, 0, BOWL.batterY - BOWL.base - 0.2, 0, false);
  batter.receiveShadow = true;
  // the swirl the spoon leaves
  const pts = [];
  for (let i = 0; i <= 44; i++) {
    const a = (i / 44) * Math.PI * 3.3;
    const r = 0.1 + (i / 44) * 0.74;
    pts.push([Math.cos(a) * r, 0, Math.sin(a) * r]);
  }
  const swirl = mesh(G.tube(pts, 0.035, 90), M.ceramic(FOOD.batterDeep, 0.35, 0.4), body, 0, BOWL.batterY - BOWL.base - 0.012, 0, false);
  swirl.scale.y = 0.45;
  return { group: g, body, batter, swirl };
}

function buildGriddle(root, tex) {
  const g = counter(root, GRIDDLE.x, GRIDDLE.z, GRIDDLE.w, GRIDDLE.d, GRIDDLE.top, C.pink20);
  softShadow(g, tex.rect, 0.1, 0, GRIDDLE.w + 1.5, GRIDDLE.d + 1.5, 0.3);
  mesh(G.block(GRIDDLE.w - 0.48, 0.09, GRIDDLE.d - 0.42, 0.34, 0.035, 12), M.soft(C.plum, 0.48), g, 0, GRIDDLE.top - 0.02, 0);
  // knobs on the front
  for (const dx of [-1.25, 0, 1.25]) {
    const k = mesh(G.puck(0.13, 0.1, 0.04, 24), M.ceramic(C.ink10, 0.4, 0.4), g, dx, 0.47, GRIDDLE.d / 2 - 0.02);
    k.rotation.x = Math.PI / 2;
  }
  // the cooking rings: a faint track under each pancake, and the arc that fills as it cooks
  const rings = [];
  const y = GRIDDLE.y + 0.004;
  for (let c = 0; c < 3; c++) {
    rings.push([]);
    for (let r = 0; r < 3; r++) {
      const x = GRIDDLE.cols[c];
      const z = GRIDDLE.rows[r];
      const track = new THREE.Mesh(G.ringArc(0.445, 0.5, 1), M.glow(C.ink90, 0.55));
      track.position.set(x, y, z);
      g.add(track);
      const mat = new THREE.MeshBasicMaterial({ color: C.yellow30, toneMapped: false });
      const arcMesh = new THREE.Mesh(G.ringArc(0.44, 0.505, 1), mat);
      arcMesh.position.set(x, y + 0.002, z);
      arcMesh.visible = false;
      g.add(arcMesh);
      rings[c].push({ arc: arcMesh, mat, track });
    }
  }
  return { group: g, rings };
}

function buildPass(root, tex) {
  const g = counter(root, PASS.x, PASS.z, PASS.w, PASS.d, PASS.top, C.yellow20);
  softShadow(g, tex.rect, 0.1, 0, PASS.w + 1.5, PASS.d + 1.5, 0.3);
  const lx = (x) => x - PASS.x;
  const lz = (z) => z - PASS.z;

  // the mat the plate waits on
  mesh(G.puck(PASS.plateR + 0.1, 0.03, 0.012, 48), M.soft(C.yellow10, 0.7), g, lx(PASS.plate[0]), PASS.top, lz(PASS.plate[1]), false).receiveShadow = true;

  // the toppings: butter, blueberries, strawberries
  const caddy = [];
  PASS.caddy.xs.forEach((x, i) => {
    const tone = TONES[PASS.caddy.tones[i]];
    const b = group(g, lx(x), PASS.top, lz(PASS.caddy.z));
    mesh(G.bowl(0.3, 0.19, 0.24, 0.045, 32), M.ceramic(C.ink0, 0.3, 0.6), b);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + i;
      const rr = k === 0 ? 0 : 0.13;
      const piece =
        i === 0
          ? mesh(G.block(0.13, 0.1, 0.13, 0.03, 0.025, 3), M.soft(C.yellow20, 0.5), b)
          : mesh(G.sphere(0.075, 14, 10), M.ceramic(tone.c40, 0.35, 0.5), b);
      piece.position.set(Math.cos(a) * rr, i === 0 ? 0.15 : 0.2, Math.sin(a) * rr);
      if (k === 0) piece.position.y += 0.05;
      piece.rotation.y = a;
    }
    caddy.push([x, PASS.top + 0.24, PASS.caddy.z]);
  });

  // the spare plates
  for (let k = 0; k < 4; k++) {
    mesh(G.plate(PASS.plateR * 0.94), M.ceramic(C.ink0, 0.28, 0.7), g, lx(PASS.stack[0]), PASS.top + k * 0.052, lz(PASS.stack[1]));
  }

  // the bell
  const bell = group(g, 0, PASS.top, 0);
  mesh(G.puck(0.2, 0.045, 0.02, 28), M.soft(C.plum, 0.5), bell);
  const bellDome = group(bell, 0, 0.04, 0);
  mesh(G.dome(0.17), M.ceramic(C.yellow40, 0.26, 0.9), bellDome);
  mesh(G.sphere(0.045, 12, 8), M.ceramic(C.plum, 0.3, 0.8), bellDome, 0, 0.18, 0);
  return { group: g, caddy, bell, bellDome };
}

function buildOut(root, tex) {
  const g = group(root, OUT.x0, 0, OUT.z);
  const len = OUT.x1 - OUT.x0;
  const deckH = 0.18;
  mesh(G.block(len, deckH, OUT.width, 0.085, 0.06, 6), M.soft(C.plum, 0.8), g, len / 2, OUT.y - deckH, 0);
  for (const s of [-1, 1]) {
    mesh(G.block(len - 0.08, 0.1, 0.1, 0.045, 0.035, 4), M.soft(C.ink10, 0.55), g, len / 2, OUT.y - 0.035, s * (OUT.width / 2 - 0.03));
  }
  const map = tex.chevrons.clone();
  map.needsUpdate = true;
  map.repeat.set(len / 0.6, 2);
  const chev = new THREE.Mesh(
    G.floorPlane(len - 0.2, OUT.width - 0.4),
    new THREE.MeshBasicMaterial({ map, color: C.ink70, transparent: true, opacity: 0.45, depthWrite: false, toneMapped: false }),
  );
  chev.position.set(len / 2, OUT.y + 0.003, 0);
  chev.renderOrder = 1;
  g.add(chev);
  mesh(G.viaduct(len - 0.9, OUT.y - deckH + 0.03, OUT.width - 0.3, 2, 0.07), M.soft(C.yellow10), g, 0.05, 0, 0);
  softShadow(g, tex.rect, len / 2, 0, len + 0.9, OUT.width + 1.0, 0.2);

  // the arch the plates leave through
  const P = { W: OUT.width + 0.82, H: 2.52, D: 1.16, holeW: OUT.width + 0.16, holeH: 2.02 };
  const px = OUT.portalX - OUT.x0;
  const portal = mesh(G.archBlock(P.W, P.H, P.D, P.holeW, P.holeH, 0.4, 0.09), M.soft(C.yellow30), g, px, 0, 0);
  portal.rotation.y = Math.PI / 2;
  mesh(G.block(P.D - 0.44, P.holeH - 0.05, P.holeW - 0.03, 0.03, 0.02, 3), M.soft(C.plum, 0.9), g, px + 0.2, 0, 0, false);
  softShadow(g, tex.rect, px, 0, P.D + 1.1, P.W + 1.1, 0.22);

  // the counter of stacks served, on top of the arch
  const sign = group(g, px, P.H - 0.02, 0);
  sign.rotation.y = 0.34;
  mesh(G.cylinder(0.06, 0.06, 0.32, 12), M.soft(C.plum, 0.5), sign, -0.42, 0, 0);
  mesh(G.cylinder(0.06, 0.06, 0.32, 12), M.soft(C.plum, 0.5), sign, 0.42, 0, 0);
  const board = group(sign, 0, 0.56, 0);
  board.rotation.x = -0.42;
  mesh(G.block(1.66, 0.14, 0.72, 0.16, 0.05, 8), M.soft(C.plum, 0.45), board).rotation.x = Math.PI / 2;
  const face = T.counterFace();
  const screen = new THREE.Mesh(G.plane(1.5, 0.6), new THREE.MeshBasicMaterial({ map: face.tex, toneMapped: false }));
  screen.position.set(0, 0, 0.146);
  board.add(screen);
  return { group: g, map, counter: face, board, len };
}

function buildRail(root, tex) {
  const g = group(root, 0, 0, RAIL.z);
  for (const x of [RAIL.x0, RAIL.x1]) {
    mesh(G.puck(0.3, 0.12, 0.05, 28), M.soft(C.ink40), g, x, 0, 0);
    mesh(G.cylinder(0.085, 0.085, RAIL.y + 0.05, 16), M.soft(C.ink10, 0.5), g, x, 0, 0);
    mesh(G.sphere(0.15, 16, 12), M.ceramic(C.pink30, 0.35, 0.6), g, x, RAIL.y + 0.1, 0);
    softShadow(g, tex.blob, x, 0, 1.0, 1.0, 0.22);
  }
  const rail = mesh(G.cylinder(0.045, 0.045, RAIL.x1 - RAIL.x0, 12), M.soft(C.plum, 0.5), g, RAIL.x0, RAIL.y, 0);
  rail.rotation.z = -Math.PI / 2;

  // the printer the tickets come out of
  const printer = group(g, RAIL.printer, RAIL.y - 0.02, 0);
  const body = group(printer);
  mesh(G.block(0.98, 0.6, 0.62, 0.17, 0.07, 8), M.ceramic(C.ink10, 0.42, 0.35), body, 0, -0.1, 0);
  mesh(G.block(0.7, 0.06, 0.2, 0.03, 0.02, 3), M.soft(C.plum, 0.6), body, 0, -0.125, 0.14, false);
  mesh(G.sphere(0.045, 10, 8), M.glow(C.green20), body, 0.33, 0.36, 0.3, false);
  mesh(G.block(0.34, 0.035, 0.1, 0.02, 0.012, 3), M.soft(C.ink40), body, -0.2, 0.36, 0.29, false);
  return { group: g, printer, printerBody: body };
}

function buildProps(root, tex) {
  // a plant, for the corner by the way out
  const plant = group(root, 9.0, 0, 2.42);
  softShadow(plant, tex.blob, 0.04, 0, 1.5, 1.5, 0.26);
  mesh(G.cylinder(0.36, 0.27, 0.5, 24), M.soft(C.pink30), plant);
  mesh(G.puck(0.4, 0.1, 0.04, 24), M.soft(C.pink20), plant, 0, 0.46, 0);
  const leaves = group(plant, 0, 0.55, 0);
  const leafMat = M.soft(C.green20, 0.6);
  [
    [0, 0.42, 0, 0.3, 0.56, 0.3],
    [-0.24, 0.24, 0.06, 0.24, 0.42, 0.24],
    [0.25, 0.2, -0.05, 0.22, 0.38, 0.22],
    [0.03, 0.2, 0.24, 0.2, 0.34, 0.2],
  ].forEach(([x, y, z, sx, sy, sz]) => {
    const l = mesh(G.sphere(1, 18, 14), leafMat, leaves, x, y, z);
    l.scale.set(sx, sy, sz);
  });

  // flour sacks, waiting in the front corner
  const sacks = group(root, -8.5, 0, 1.75);
  softShadow(sacks, tex.blob, 0.2, 0.15, 2.3, 2.1, 0.24);
  const sack = (x, z, ry, s) => {
    const sg = group(sacks, x, 0, z);
    sg.rotation.y = ry;
    sg.scale.setScalar(s);
    mesh(G.block(0.7, 0.8, 0.5, 0.2, 0.09, 8), M.soft(C.ink20, 0.88), sg);
    mesh(G.block(0.34, 0.14, 0.2, 0.07, 0.04, 5), M.soft(C.ink20, 0.88), sg, 0, 0.77, 0);
    mesh(G.block(0.72, 0.22, 0.52, 0.205, 0.02, 8), M.soft(C.blue20, 0.7), sg, 0, 0.28, 0, false);
  };
  sack(0, 0, 0.25, 1);
  sack(0.66, 0.42, -0.45, 0.84);
  return { leaves };
}

export function buildWorld(scene) {
  const root = group(scene);
  const tex = {
    blob: T.blobShadow(),
    rect: T.rectShadow(1, 1, 0.2, 0.2),
    slab: T.rectShadow(FLOOR.slabW + 4.4, FLOOR.slabD + 4.4, 0.16, 0.12),
    chevrons: T.chevrons(),
  };

  buildFloor(root, tex);
  const belts = INTAKE.belts.map((b) =>
    buildBelt(root, tex, {
      from: b.from,
      dir: b.dir,
      len: b.len,
      y: INTAKE.y,
      width: INTAKE.width,
      supportColor: C.blue10,
      portalColor: C.blue20,
      arches: b.len - INTAKE.tip > 3 ? 3 : 2,
      tip: INTAKE.tip,
    }),
  );
  const bowl = buildBowl(root, tex);
  const griddle = buildGriddle(root, tex);
  const pass = buildPass(root, tex);
  const out = buildOut(root, tex);
  const rail = buildRail(root, tex);
  const props = buildProps(root, tex);

  return { root, tex, belts, bowl, griddle, pass, out, rail, props };
}
