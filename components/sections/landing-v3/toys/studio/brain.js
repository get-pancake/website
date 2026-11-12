// The brain, as a toy: one soft pink piece whose folds are in the piece itself. Two sets show it:
// the 1-2-3's third picture (scene-brain.js), and the engine of "Run your revenue engine from
// Claude" (scene-engine.js), small.

import { C } from "./parts.js";

/** Classic Perlin noise in 3D, from a seed: the same folds on every machine. */
function perlin(seed) {
  const perm = Array.from({ length: 256 }, (_, i) => i);
  let s = seed >>> 0;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const grad = (hash, x, y, z) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };
  return (x, y, z) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u), lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
      lerp(
        lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
        v,
      ),
      w,
    );
  };
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** the piece's shape (the half-width of a unit brain is 1) and where its folds come from */
const BRAIN = {
  /** half-sizes of the unit brain: across, up, front to back */
  across: 1.0,
  up: 0.8,
  long: 1.24,
  /** the folds: how many across the piece, how they wander, how deep, how narrow the grooves */
  folds: 1.9,
  wander: 0.5,
  depth: 0.078,
  groove: [0.012, 0.27],
  /** the groove between its two halves */
  halves: { depth: 0.2, width: 0.05 },
  /** under this height (of the unit brain) it is flat: it stands on its stand */
  flat: -0.46,
  /** how far it is turned on its stand (degrees): its front to the left of the picture */
  turn: -52,
  seed: 57,
};

/**
 * The brain: a ball pushed in along winding grooves (where a noise crosses zero), with one long
 * groove between its two halves, which mirror each other. Each point also takes a colour: the
 * piece's pink on a fold, deeper in a groove, so the folds still read at the size of a step card.
 */
function brainGeometry(THREE, fold, groove, size, detail) {
  const B = BRAIN;
  const W = detail;
  const H = Math.round(detail * 0.66);
  const g = new THREE.SphereGeometry(1, W, H);
  const pos = g.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const main = perlin(B.seed);
  const warp = perlin(B.seed + 31);
  const v = new THREE.Vector3();
  const top = new THREE.Color(fold);
  const deep = new THREE.Color(groove);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    // (the two halves mirror each other: the folds are drawn on |x|)
    const x = Math.abs(v.x);
    const { y, z } = v;
    const k = 1.7;
    const wx = warp(x * k + 13.1, y * k, z * k) * B.wander;
    const wy = warp(x * k, y * k + 27.7, z * k) * B.wander;
    const wz = warp(x * k, y * k, z * k + 41.3) * B.wander;
    const n = Math.abs(main((x + wx) * B.folds + 5.2, (y + wy) * B.folds + 9.4, (z + wz) * B.folds + 3.7));
    // 0 in a groove, 1 on a fold, round on the way
    // (a fold is round: it rises fast out of its groove, then levels)
    const up = 1 - (1 - smoothstep(B.groove[0], B.groove[1], n)) ** 1.5;
    const between = Math.exp(-(v.x * v.x) / (2 * B.halves.width * B.halves.width));
    // (no fold under the piece, where it stands)
    const under = smoothstep(-0.2, -0.55, y);
    const r = 1 - B.depth * (1 - up) * (1 - under) - B.halves.depth * between * (1 - under * 0.6);
    let py = y * r * B.up;
    if (py < B.flat) py = B.flat + (py - B.flat) * 0.22;
    pos.setXYZ(i, v.x * r * B.across * size, py * size, z * r * B.long * size);
    c.copy(deep).lerp(top, Math.min(up, 1 - between * 0.85));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  // the ball's seam and its two poles hold the same point several times: one normal for each
  const nor = g.attributes.normal;
  const mean = (ids) => {
    v.set(0, 0, 0);
    for (const id of ids) v.x += nor.getX(id), (v.y += nor.getY(id)), (v.z += nor.getZ(id));
    v.normalize();
    for (const id of ids) nor.setXYZ(id, v.x, v.y, v.z);
  };
  for (let row = 1; row < H; row++) mean([row * (W + 1), row * (W + 1) + W]);
  mean(Array.from({ length: W + 1 }, (_, k) => k));
  mean(Array.from({ length: W + 1 }, (_, k) => H * (W + 1) + k));
  nor.needsUpdate = true;
  return g;
}


/**
 * The piece, of half-width `r`, standing on y = 0 and turned as the sets show it (its front to
 * the left of the picture). `detail`: how fine its mesh is (a small piece needs less).
 * Returns the piece and how high it is.
 */
export function brainPiece(THREE, r, detail = 440) {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0 });
  const fold = new THREE.Color(C.pink20).lerp(new THREE.Color(C.pink30), 0.42);
  const groove = new THREE.Color(C.pink30).lerp(new THREE.Color(C.pink40), 0.45);
  const piece = new THREE.Mesh(brainGeometry(THREE, fold, groove, r, detail), material);
  piece.castShadow = true;
  piece.receiveShadow = true;
  piece.position.y = -BRAIN.flat * r;
  piece.rotation.y = (BRAIN.turn * Math.PI) / 180;
  return { piece, height: (BRAIN.up - BRAIN.flat) * r };
}
