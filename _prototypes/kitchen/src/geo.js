// Geometry builders. Every shape in the kitchen is a rounded block, a turned shape (a puck, a
// bowl) or an extruded outline (an arch, a viaduct): the "soft toy" look comes from the bevels,
// whose normals are averaged so that light rolls over each edge.

import * as THREE from "three";

const cache = new Map();

function cached(key, make) {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
}

export function disposeGeometries() {
  cache.forEach((g) => g.dispose());
  cache.clear();
}

/**
 * Welds vertices that share a position, then recomputes area-weighted normals. On an extruded
 * shape this keeps the big flat faces flat and turns each bevel into one smooth roll.
 */
export function smooth(geo, tol = 1e-4) {
  const src = geo.index ? geo.toNonIndexed() : geo;
  const pos = src.attributes.position;
  const ids = new Map();
  const out = [];
  const index = [];
  const inv = 1 / tol;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const key = `${Math.round(x * inv)}_${Math.round(y * inv)}_${Math.round(z * inv)}`;
    let id = ids.get(key);
    if (id === undefined) {
      id = out.length / 3;
      ids.set(key, id);
      out.push(x, y, z);
    }
    index.push(id);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(out, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  if (src !== geo) src.dispose();
  geo.dispose();
  return g;
}

/** points of an arc, from angle a0 to a1 (radians), both ends included */
function arcPoints(cx, cy, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/**
 * A closed outline from a list of points. Two points in the same place are merged: a doubled
 * point makes the bevel of an extrusion shoot out as a spike.
 */
function outline(points) {
  const kept = [];
  for (const p of points) {
    const last = kept[kept.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-5) kept.push(p);
  }
  const first = kept[0];
  const end = kept[kept.length - 1];
  if (kept.length > 1 && Math.hypot(first[0] - end[0], first[1] - end[1]) <= 1e-5) kept.pop();
  return new THREE.Shape(kept.map((p) => new THREE.Vector2(p[0], p[1])));
}

/** a rectangle with rounded corners, centred, `seg` segments per corner */
export function roundedRectShape(w, d, r, seg = 8) {
  const x = w / 2;
  const y = d / 2;
  const rr = Math.max(0.001, Math.min(r, x, y));
  const q = Math.PI / 2;
  return outline([
    ...arcPoints(x - rr, -y + rr, rr, -q, 0, seg),
    ...arcPoints(x - rr, y - rr, rr, 0, q, seg),
    ...arcPoints(-x + rr, y - rr, rr, q, 2 * q, seg),
    ...arcPoints(-x + rr, -y + rr, rr, 2 * q, 3 * q, seg),
  ]);
}

function extrude(shape, depth, bevel, curve = 8, bevelSegments = 4) {
  const b = Math.max(0, Math.min(bevel, depth / 2 - 1e-3));
  return new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * b,
    bevelEnabled: b > 0,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: -b,
    bevelSegments,
    curveSegments: curve,
    steps: 1,
  });
}

/**
 * A block with a rounded footprint (corner radius `r`) and rolled top and bottom edges.
 * Width on x, height on y, depth on z. Its base sits on y = 0.
 */
export function block(w, h, d, r = 0.2, bevel = 0.06, curve = 8, bevelSegments = 4) {
  const key = `block:${w}:${h}:${d}:${r}:${bevel}:${curve}:${bevelSegments}`;
  return cached(key, () => {
    const b = Math.min(bevel, h / 2 - 1e-3, Math.max(r - 1e-3, 0.001));
    const g = extrude(roundedRectShape(w, d, r, curve), h, b, 1, bevelSegments);
    g.rotateX(-Math.PI / 2);
    g.translate(0, b, 0);
    return smooth(g);
  });
}

function puckProfile(r, h, bevel) {
  const b = Math.max(0.001, Math.min(bevel, h / 2, r));
  const n = 6;
  const pts = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, b + Math.sin(a) * b));
  }
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b));
  }
  pts.push(new THREE.Vector2(0, h));
  return pts;
}

/** A disc with rolled edges (a pancake, a plate foot, a knob). Base on y = 0. */
export function puck(r, h, bevel = 0.05, seg = 40) {
  const key = `puck:${r}:${h}:${bevel}:${seg}`;
  return cached(key, () => new THREE.LatheGeometry(puckProfile(r, h, bevel), seg));
}

/** A flat disc lying on y = 0, facing up. */
export function disc(r, seg = 40) {
  const key = `disc:${r}:${seg}`;
  return cached(key, () => {
    const g = new THREE.CircleGeometry(r, seg);
    g.rotateX(-Math.PI / 2);
    return g;
  });
}

/** A flat arc of a ring lying on y = 0, starting at the far side and going clockwise. */
export function ringArc(inner, outer, frac, seg = 48) {
  const steps = Math.max(1, Math.round(seg * frac));
  const key = `ring:${inner}:${outer}:${steps}:${seg}`;
  return cached(key, () => {
    const g = new THREE.RingGeometry(inner, outer, steps, 1, Math.PI / 2, -(steps / seg) * Math.PI * 2);
    g.rotateX(-Math.PI / 2);
    // RingGeometry drawn with a negative angle faces down: flip the winding.
    const idx = g.index.array;
    for (let i = 0; i < idx.length; i += 3) {
      const t = idx[i];
      idx[i] = idx[i + 2];
      idx[i + 2] = t;
    }
    g.computeVertexNormals();
    return g;
  });
}

/** A thick-walled bowl: outer radius `rTop` at the rim, `rBot` at the foot, height `h`. */
export function bowl(rTop, rBot, h, t = 0.09, seg = 56) {
  const key = `bowl:${rTop}:${rBot}:${h}:${t}:${seg}`;
  return cached(key, () => {
    const pts = [new THREE.Vector2(0, 0)];
    const n = 16;
    const quad = (p0, p1, p2, u) => {
      const k = 1 - u;
      return new THREE.Vector2(
        k * k * p0[0] + 2 * k * u * p1[0] + u * u * p2[0],
        k * k * p0[1] + 2 * k * u * p1[1] + u * u * p2[1],
      );
    };
    // foot, then the outer wall
    pts.push(new THREE.Vector2(rBot * 0.82, 0));
    for (let i = 0; i <= n; i++) pts.push(quad([rBot, 0.02], [rTop * 1.04, h * 0.32], [rTop, h - t / 2], i / n));
    // the rolled rim
    for (let i = 1; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      pts.push(new THREE.Vector2(rTop - t / 2 + (Math.cos(a) * t) / 2, h - t / 2 + (Math.sin(a) * t) / 2));
    }
    // the inner wall, down to the centre
    for (let i = 0; i <= n; i++) {
      pts.push(quad([rTop - t, h - t / 2], [rTop * 1.04 - t * 1.3, h * 0.32 + t], [rBot * 0.55, t * 1.4], i / n));
    }
    pts.push(new THREE.Vector2(0, t * 1.4));
    return new THREE.LatheGeometry(pts, seg);
  });
}

/**
 * A block with a tunnel through it (the mouth a belt comes out of). The tunnel runs along z.
 * Width `W` on x, height `H` on y, length `D` on z. Base on y = 0.
 */
export function archBlock(W, H, D, holeW, holeH, r = 0.3, bevel = 0.07) {
  const key = `arch:${W}:${H}:${D}:${holeW}:${holeH}:${r}:${bevel}`;
  return cached(key, () => {
    const hw = holeW / 2;
    const top = holeH - hw;
    const q = Math.PI / 2;
    const s = outline([
      [-W / 2, 0],
      ...arcPoints(-W / 2 + r, H - r, r, 2 * q, q, 8),
      ...arcPoints(W / 2 - r, H - r, r, q, 0, 8),
      [W / 2, 0],
      [hw, 0],
      ...arcPoints(0, top, hw, 0, 2 * q, 20),
      [-hw, 0],
    ]);
    const g = extrude(s, D, bevel, 1);
    g.translate(0, 0, -D / 2 + Math.min(bevel, D / 2 - 1e-3));
    return smooth(g);
  });
}

/**
 * The support of a raised belt: a long block with arches cut out of it. Length `L` on x
 * (from 0 to L), height `H`, width `W` on z (centred). Base on y = 0.
 */
export function viaduct(L, H, W, arches = 2, bevel = 0.06) {
  const key = `viaduct:${L}:${H}:${W}:${arches}:${bevel}`;
  return cached(key, () => {
    const pier = Math.max(0.28, L * 0.08);
    const aw = (L - pier * (arches + 1)) / arches;
    const ah = Math.max(aw / 2 + 0.05, Math.min(H - 0.3, H * 0.72));
    const pts = [
      [0, 0],
      [0, H],
      [L, H],
      [L, 0],
    ];
    for (let i = arches - 1; i >= 0; i--) {
      const x0 = pier + i * (aw + pier);
      const x1 = x0 + aw;
      const cy = ah - aw / 2;
      pts.push([x1, 0], ...arcPoints((x0 + x1) / 2, cy, aw / 2, 0, Math.PI, 16), [x0, 0]);
    }
    const s = outline(pts);
    const g = extrude(s, W, bevel, 1);
    g.translate(0, 0, -W / 2 + Math.min(bevel, W / 2 - 1e-3));
    return smooth(g);
  });
}

/** A shallow dinner plate of radius `r`. Its well sits 0.04 above the base. */
export function plate(r, seg = 48) {
  const key = `plate:${r}:${seg}`;
  return cached(key, () => {
    const p = [
      [0, 0],
      [r * 0.5, 0],
      [r * 0.6, 0.012],
      [r * 0.93, 0.085],
      [r * 0.99, 0.1],
      [r, 0.112],
      [r * 0.99, 0.124],
      [r * 0.93, 0.118],
      [r * 0.6, 0.05],
      [r * 0.52, 0.04],
      [0, 0.04],
    ];
    return new THREE.LatheGeometry(
      p.map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    );
  });
}

/** The top half of a sphere, base on y = 0 (a bell, a cup, a dome). */
export function dome(r, seg = 24) {
  const key = `dome:${r}:${seg}`;
  return cached(key, () => new THREE.SphereGeometry(r, seg, 12, 0, Math.PI * 2, 0, Math.PI / 2));
}

export function sphere(r, w = 24, h = 16) {
  const key = `sphere:${r}:${w}:${h}`;
  return cached(key, () => new THREE.SphereGeometry(r, w, h));
}

export function capsule(r, length, seg = 16) {
  const key = `capsule:${r}:${length}:${seg}`;
  return cached(key, () => new THREE.CapsuleGeometry(r, length, 8, seg));
}

export function cylinder(rTop, rBot, h, seg = 24) {
  const key = `cyl:${rTop}:${rBot}:${h}:${seg}`;
  return cached(key, () => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  });
}

export function plane(w, h) {
  const key = `plane:${w}:${h}`;
  return cached(key, () => new THREE.PlaneGeometry(w, h));
}

/** A plane lying on y = 0, facing up. */
export function floorPlane(w, d) {
  const key = `floor:${w}:${d}`;
  return cached(key, () => {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    return g;
  });
}

export function tube(points, radius, seg = 40, closed = false) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    closed,
    "catmullrom",
    0.5,
  );
  return new THREE.TubeGeometry(curve, seg, radius, 10, closed);
}
