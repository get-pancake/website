// Small math helpers. Everything the animation does is a pure function of time, so these are
// the only "physics" the scene has: easings, arcs and damped wobbles.

export const TAU = Math.PI * 2;

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
/** progress of v between a and b, clamped to 0..1 */
export const prog = (v, a, b) => clamp(invLerp(a, b, v));
/** true modulo, also for negative values */
export const mod = (a, n) => ((a % n) + n) % n;

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * TAU) / 3) + 1;
  },
};

/** 0 → 1 → 0 over t in 0..1 */
export const bump = (t) => (t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t));
/** parabola 0 → 1 → 0, the height of a throw */
export const hop = (t) => (t <= 0 || t >= 1 ? 0 : 4 * t * (1 - t));

/**
 * A damped wobble that starts at `x = 0` (the moment something lands): amp * e^(-decay x) * cos(freq x).
 * Returns 0 before the event. Used for every squash, ring and jiggle.
 */
export const wobble = (x, amp = 1, freq = 22, decay = 9) =>
  x < 0 ? 0 : amp * Math.exp(-decay * x) * Math.cos(freq * x);

/** deterministic hash of an integer to 0..1 */
export function hash(n, salt = 0) {
  let h = (Math.imul(n | 0, 374761393) + Math.imul(salt | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
/** between two points [x, y, z] */
export const mix3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** a throw from a to b whose apex is `h` above the straight line */
export const toss = (a, b, h, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * hop(u), lerp(a[2], b[2], u)];

/**
 * A walk along a list of points [x, z] at constant speed: where it is at `u` (0..1), which way
 * it heads, and how far it has gone.
 */
export function along(points, u) {
  let total = 0;
  const lens = [];
  for (let i = 1; i < points.length; i++) {
    const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = clamp(u) * total;
  const gone = d;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? clamp(d / lens[i]) : 0;
      const a = points[i];
      const b = points[i + 1];
      return { x: lerp(a[0], b[0], k), z: lerp(a[1], b[1], k), face: Math.atan2(b[0] - a[0], b[1] - a[1]), gone, total };
    }
    d -= lens[i];
  }
  return { x: points[0][0], z: points[0][1], face: 0, gone: 0, total };
}
