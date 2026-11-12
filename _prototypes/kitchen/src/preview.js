// The preview page (index.html): mounts the kitchen and wires the few review controls.
//
// URL parameters, for review and for screenshots:
//   ?t=12.5       draw the loop at 12.5 s and stay paused
//   ?intro=0.6    with ?t, draw the opening pop at 0.6 s
//   ?speed=0.5    play slower or faster
//   ?az=14&el=43&zoom=2&target=0.3,1,-0.4    move the camera (here, a close-up of the griddle)
//   ?mode=without           the kitchen without Pancake
//   ?cast=people            little chefs in place of the pancake chefs
//   ?shadows=pcf|vsm|none   ?dpr=1   ?bare=1 (the stage alone, full window)

import { createPancakeKitchen } from "./kitchen.js";

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

// the lines to try under the scene: a click shows the next one, and each mode has its own
const line = $("kitchen-line");
const next = $("kitchen-next");
let lines = line ? JSON.parse(line.dataset.linesWith) : [];
let shown = 0;
if (line && next) {
  next.addEventListener("click", () => {
    shown = (shown + 1) % lines.length;
    line.textContent = lines[shown];
  });
}

// the two switches: with or without Pancake, and who cooks
function reflect() {
  if (!kitchen) return;
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === kitchen.mode)));
  document.querySelectorAll("[data-cast]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cast === kitchen.cast)));
  document.querySelectorAll("[data-key]").forEach((k) => (k.hidden = k.dataset.key !== kitchen.mode));
  if (line) {
    lines = JSON.parse(kitchen.mode === "without" ? line.dataset.linesWithout : line.dataset.linesWith);
    shown = 0;
    line.textContent = lines[0];
  }
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
