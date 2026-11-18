// The review page (index.html): the scene outside the landing page, with controls to pause it,
// slow it down and swap who cooks. scripts/kitchen-posters.mjs draws the still pictures from
// it. The landing page's own component is ../../LpKitchen.tsx.
//
// URL parameters, for review and for screenshots:
//   ?t=12.5       draw the loop at 12.5 s and stay paused
//   ?intro=0.6    with ?t, draw the opening pop at 0.6 s
//   ?speed=0.5    play slower or faster
//   ?az=14&el=43&zoom=2&target=0.3,1,-0.4    move the camera (here, a close-up of the griddle)
//   ?mode=without           the kitchen without Pancake
//   ?cast=people            little chefs in place of the pancake chefs
//   ?logos=0                without Pancake: no vendor mark on the tank
//   ?poster=1               the still of the mode, as the landing page's pictures are drawn
//   ?phone=1                what a phone shows: the whole kitchen as wide as the text, no tilt
//   ?shadows=pcf|vsm|none   ?dpr=1   ?bare=1 (the stage alone, full window)

import { createPancakeKitchen, POSTER_TIMES, PHONE_VIEW } from "../kitchen.js";
import { WORDS } from "../words.js";

const q = new URLSearchParams(location.search);
const options = {};
for (const [key, name] of [
  ["az", "azimuth"],
  ["el", "elevation"],
  ["zoom", "zoom"],
  ["pad", "pad"],
]) {
  const v = Number(q.get(key));
  if (q.has(key) && !Number.isNaN(v)) options[name] = v;
}
if (q.has("target")) options.target = q.get("target").split(",").map(Number);
if (q.has("shadows")) options.shadows = q.get("shadows");
if (q.has("dpr")) options.maxPixelRatio = Number(q.get("dpr"));
if (q.has("t")) {
  options.time = Number(q.get("t"));
  options.autoplay = false;
  options.interactive = false;
}
if (q.has("intro")) options.introAt = Number(q.get("intro"));
if (q.has("mode")) options.mode = q.get("mode");
if (q.has("cast")) options.cast = q.get("cast");
if (q.get("logos") === "0") options.vendorLogos = false;
if (q.has("poster")) {
  // exactly what the landing page's component starts from: see LpKitchen.tsx
  options.time = POSTER_TIMES[options.mode === "without" ? "without" : "with"];
  options.autoplay = false;
  options.interactive = true;
  options.intro = false;
}
if (q.has("phone")) {
  // what a phone shows (LpKitchen.tsx under 768 px): its own window, from a still angle
  options.view = PHONE_VIEW;
  options.interactive = false;
}
if (q.has("bare")) document.body.classList.add("bare");

const stage = document.getElementById("kitchen");
const note = document.getElementById("kitchen-note");
const $ = (id) => document.getElementById(id);

let kitchen = null;
try {
  kitchen = createPancakeKitchen(stage, options);
  stage.dataset.live = "1";
} catch (error) {
  // no WebGL here: the still frame stays, with a line that says so
  if (note) note.hidden = false;
  document.documentElement.classList.add("no-live");
}

if (kitchen) {
  if (q.has("speed")) kitchen.setSpeed(Number(q.get("speed")));
  if (q.has("t") && !q.has("intro")) kitchen.seek(Number(q.get("t")));
  if (q.has("poster")) kitchen.seek(options.time);

  const play = $("kitchen-play");
  const paint = () => {
    if (!play) return;
    play.textContent = kitchen.playing ? "Pause" : "Play";
    play.setAttribute("aria-pressed", String(!kitchen.playing));
  };
  if (play) {
    play.addEventListener("click", () => {
      if (kitchen.playing) kitchen.stop();
      else kitchen.start();
      paint();
    });
    paint();
  }
  document.querySelectorAll("[data-speed]").forEach((b) => {
    b.addEventListener("click", () => {
      kitchen.setSpeed(Number(b.dataset.speed));
      document.querySelectorAll("[data-speed]").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    });
  });
  const again = $("kitchen-replay");
  if (again) {
    again.addEventListener("click", () => {
      kitchen.replay();
      if (!kitchen.playing) {
        kitchen.start();
        paint();
      }
    });
  }
}

// the heading and the switch say what the section says (words.js)
const title = $("kitchen-title");
if (title) title.textContent = WORDS.title;
document.querySelectorAll("[data-mode]").forEach((b) => (b.textContent = WORDS[b.dataset.mode].option));

// the two switches: with or without Pancake, and who cooks
function reflect() {
  if (!kitchen) return;
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === kitchen.mode)));
  document.querySelectorAll("[data-cast]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cast === kitchen.cast)));
  document.querySelectorAll("[data-key]").forEach((k) => (k.hidden = k.dataset.key !== kitchen.mode));
}
if (kitchen) {
  document.querySelectorAll("[data-mode]").forEach((b) =>
    b.addEventListener("click", () => {
      kitchen.setMode(b.dataset.mode);
      reflect();
    }),
  );
  document.querySelectorAll("[data-cast]").forEach((b) =>
    b.addEventListener("click", () => {
      kitchen.setCast(b.dataset.cast);
      reflect();
    }),
  );
  reflect();
}

window.__kitchen = kitchen;
document.documentElement.dataset.ready = "1";
