// The few textures of the scene, all drawn on a canvas at start: soft shadows, the belt
// chevrons, the order tickets, the counter digits. No image file is loaded.

import * as THREE from "three";
import { C, FOOD, TONES, LATE } from "./palette.js";
import { drawLogo } from "./logos.js";

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function texture(cv, { repeat = false, srgb = true } = {}) {
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  t.needsUpdate = true;
  return t;
}

function rrect(g, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + rr, y);
  g.lineTo(x + w - rr, y);
  g.arcTo(x + w, y, x + w, y + rr, rr);
  g.lineTo(x + w, y + h - rr);
  g.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  g.lineTo(x + rr, y + h);
  g.arcTo(x, y + h, x, y + h - rr, rr);
  g.lineTo(x, y + rr);
  g.arcTo(x, y, x + rr, y, rr);
  g.closePath();
}

/** a round soft shadow: white in the alpha channel, tinted by the material */
export function blobShadow() {
  const s = 128;
  const cv = canvas(s, s);
  const g = cv.getContext("2d");
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.62)");
  grad.addColorStop(0.75, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return texture(cv, { srgb: false });
}

/** a soft rounded rectangle shadow, for the slab and the stations. `w`/`h` set the aspect. */
export function rectShadow(w, h, radius = 0.18, blur = 0.16) {
  const W = 256;
  const H = Math.max(32, Math.round((256 * h) / w));
  const cv = canvas(W, H);
  const g = cv.getContext("2d");
  const pad = blur * W;
  g.filter = `blur(${pad * 0.5}px)`;
  g.fillStyle = "#fff";
  rrect(g, pad, pad, W - pad * 2, H - pad * 2, radius * W);
  g.fill();
  return texture(cv, { srgb: false });
}

/** the moving arrows on a belt: one tile, repeated along the belt */
export function chevrons() {
  const W = 96;
  const H = 128;
  const cv = canvas(W, H);
  const g = cv.getContext("2d");
  g.clearRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 9;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(W * 0.3, H * 0.24);
  g.lineTo(W * 0.62, H * 0.5);
  g.lineTo(W * 0.3, H * 0.76);
  g.stroke();
  return texture(cv, { repeat: true, srgb: false });
}

/** the face of an order ticket: a paper slip with the stack it asks for, in one tone */
export function ticketFace(toneName) {
  const late = toneName === "late";
  const tone = late ? LATE : TONES[toneName];
  const W = 240;
  const H = 336;
  const cv = canvas(W, H);
  const g = cv.getContext("2d");

  // paper
  g.fillStyle = C.ink0;
  rrect(g, 0, 0, W, H, 26);
  g.fill();
  // header band
  g.save();
  rrect(g, 0, 0, W, H, 26);
  g.clip();
  g.fillStyle = tone.c20;
  g.fillRect(0, 0, W, 76);
  g.restore();
  // punch hole
  g.fillStyle = C.plum;
  g.globalAlpha = 0.85;
  g.beginPath();
  g.arc(W / 2, 38, 11, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;

  // the stack: three pancakes seen from the side, with the topping of this tone
  const cx = W / 2;
  const base = 222;
  // plate
  g.fillStyle = C.ink40;
  g.beginPath();
  g.ellipse(cx, base + 16, 86, 15, 0, 0, Math.PI * 2);
  g.fill();
  const layer = (y, w, fill) => {
    g.fillStyle = fill;
    rrect(g, cx - w / 2, y - 15, w, 30, 15);
    g.fill();
  };
  layer(base, 136, late ? FOOD.burnt : FOOD.golden);
  layer(base - 27, 128, late ? FOOD.burntCrumb : C.yellow30);
  layer(base - 54, 120, late ? FOOD.burnt : FOOD.golden);
  // topping
  g.fillStyle = tone.c40;
  if (late) {
    // nothing on top but two wisps of smoke
    g.strokeStyle = C.ink60;
    g.lineWidth = 9;
    g.lineCap = "round";
    for (const dx of [-22, 20]) {
      g.beginPath();
      g.moveTo(cx + dx, base - 78);
      g.bezierCurveTo(cx + dx - 16, base - 96, cx + dx + 16, base - 108, cx + dx, base - 126);
      g.stroke();
    }
  } else if (toneName === "yellow") {
    g.fillStyle = FOOD.syrup;
    rrect(g, cx - 54, base - 78, 108, 20, 10);
    g.fill();
    rrect(g, cx + 26, base - 70, 16, 34, 8);
    g.fill();
    g.fillStyle = C.ink0;
    rrect(g, cx - 20, base - 96, 40, 26, 7);
    g.fill();
    g.fillStyle = C.yellow20;
    rrect(g, cx - 20, base - 96, 40, 26, 7);
    g.globalAlpha = 0.75;
    g.fill();
    g.globalAlpha = 1;
  } else {
    for (const [dx, dy, r] of [
      [-28, -80, 16],
      [2, -90, 18],
      [30, -79, 15],
    ]) {
      g.beginPath();
      g.arc(cx + dx, base + dy, r, 0, Math.PI * 2);
      g.fill();
    }
  }

  // two lines of "text", and the track of the progress bar (the bar itself is a mesh)
  g.fillStyle = C.ink40;
  rrect(g, 30, 96, 116, 12, 6);
  g.fill();
  rrect(g, 30, 116, 72, 12, 6);
  g.fill();
  g.fillStyle = C.ink30;
  rrect(g, 26, H - 44, W - 52, 18, 9);
  g.fill();
  return texture(cv);
}

/** the red stamp of an order that left too late: a clock */
export function lateStamp() {
  const s = 128;
  const cv = canvas(s, s);
  const g = cv.getContext("2d");
  g.fillStyle = C.red30;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = C.ink0;
  g.lineWidth = 11;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.arc(s / 2, s / 2, 34, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.moveTo(s / 2, s / 2 - 20);
  g.lineTo(s / 2, s / 2);
  g.lineTo(s / 2 + 15, s / 2 + 9);
  g.stroke();
  return texture(cv);
}

/** a third-party logo on a white tile, for the warehouse machine */
export function logoPlate(key) {
  const s = 192;
  const cv = canvas(s, s);
  const g = cv.getContext("2d");
  g.fillStyle = C.ink0;
  rrect(g, 0, 0, s, s, 44);
  g.fill();
  drawLogo(g, key, 34, 34, s - 68);
  return texture(cv);
}

/** the green "served" stamp */
export function checkStamp() {
  const s = 128;
  const cv = canvas(s, s);
  const g = cv.getContext("2d");
  g.fillStyle = C.green20;
  g.beginPath();
  g.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = C.ink0;
  g.lineWidth = 15;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(s * 0.3, s * 0.53);
  g.lineTo(s * 0.45, s * 0.67);
  g.lineTo(s * 0.71, s * 0.37);
  g.stroke();
  return texture(cv);
}

// Seven-segment digits, drawn with rounded bars so the counter needs no font.
const SEG = {
  0: "abcdef",
  1: "bc",
  2: "abged",
  3: "abgcd",
  4: "fgbc",
  5: "afgcd",
  6: "afgedc",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};

function drawDigit(g, d, x, y, w, h, t, on, off) {
  const bars = {
    a: [x + t, y, w - 2 * t, t],
    g: [x + t, y + h / 2 - t / 2, w - 2 * t, t],
    d: [x + t, y + h - t, w - 2 * t, t],
    f: [x, y + t * 0.6, t, h / 2 - t * 0.9],
    b: [x + w - t, y + t * 0.6, t, h / 2 - t * 0.9],
    e: [x, y + h / 2 + t * 0.3, t, h / 2 - t * 0.9],
    c: [x + w - t, y + h / 2 + t * 0.3, t, h / 2 - t * 0.9],
  };
  for (const k of Object.keys(bars)) {
    const lit = SEG[d].includes(k);
    if (!lit && !off) continue;
    g.fillStyle = lit ? on : off;
    const [bx, by, bw, bh] = bars[k];
    rrect(g, bx, by, bw, bh, t / 2);
    g.fill();
  }
}

/**
 * The counter on the way out: a small pancake mark and a number. Returns the texture and a
 * `set(n)` that redraws it.
 */
export function counterFace() {
  const W = 320;
  const H = 128;
  const cv = canvas(W, H);
  const g = cv.getContext("2d");
  const tex = texture(cv);
  let shown = -1;
  const set = (n) => {
    const v = Math.max(0, Math.floor(n)) % 10000;
    if (v === shown) return;
    shown = v;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.plum;
    rrect(g, 0, 0, W, H, 34);
    g.fill();
    // the mark: a small stack
    const mx = 58;
    const my = 70;
    const stack = [
      [C.pink30, 14, -2],
      [C.purple30, 0, 3],
      [C.yellow30, -14, -1],
    ];
    for (const [col, dy, dx] of stack) {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(mx + dx, my + dy, 30, 15, 0, 0, Math.PI * 2);
      g.fill();
    }
    const s = String(v).padStart(4, " ");
    for (let i = 0; i < 4; i++) {
      // a blank place still shows its unlit bars, like a real display
      drawDigit(g, s[i] === " " ? "8" : s[i], 112 + i * 48, 28, 36, 72, 9, s[i] === " " ? "rgba(255,233,209,0.09)" : C.yellow10, "rgba(255,233,209,0.09)");
    }
    tex.needsUpdate = true;
  };
  set(0);
  return { tex, set };
}

/** the "+1" that rises when a plate leaves */
export function plusOne() {
  const W = 160;
  const H = 96;
  const cv = canvas(W, H);
  const g = cv.getContext("2d");
  g.fillStyle = C.green20;
  rrect(g, 0, 0, W, H, 48);
  g.fill();
  // a plus sign, then a "1" drawn as a stroke: no font to load
  g.strokeStyle = C.ink0;
  g.lineWidth = 14;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(38, 48);
  g.lineTo(76, 48);
  g.moveTo(57, 29);
  g.lineTo(57, 67);
  g.moveTo(98, 38);
  g.lineTo(112, 26);
  g.lineTo(112, 70);
  g.stroke();
  return texture(cv);
}
