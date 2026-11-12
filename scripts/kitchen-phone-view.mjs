#!/usr/bin/env node
/**
 * Kitchen phone view: measures PHONE_VIEW (components/sections/landing-v3/kitchen/layout.js),
 * the window of the kitchen scene that a phone shows.
 *
 *   node scripts/kitchen-phone-view.mjs
 *
 * On a phone the whole kitchen is as wide as the page's text, and neither side is cut (founder,
 * 2026-11-12: "Faut pas qu'il dépasse des deux côtés"). The window is the kitchen's outline as
 * it is drawn, with its shadow. To find it, the script draws the scene in a large window, in both
 * modes, with both casts and at two dozen moments of the loop. It finds the box of every pixel
 * that is not the page's cream and converts that box to the camera's units. Then it adds 16/358
 * of the kitchen's width on each side and 5 % of the picture's height above and below. On phones
 * kitchen.css makes the picture 16/358 wider than the text on each side, so the outline lands on
 * the page's 16 px margins. The script prints the window for layout.js and the picture's shape
 * for kitchen.css.
 *
 * Measure again after you change what the kitchen spans (the slab, its shadow, a station). Then
 * draw the stills again with scripts/kitchen-posters.mjs.
 *
 * Like scripts/kitchen-posters.mjs, it needs three and Playwright. Two variables point at
 * another copy: PLAYWRIGHT_MODULE for Playwright and CHROMIUM_PATH for Chromium. KITCHEN_GPU=1
 * draws on this machine's graphics card instead of in software. It is faster, and the box is
 * the same within a pixel.
 */
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KITCHEN = join(ROOT, "components/sections/landing-v3/kitchen") + sep;
const LAYOUT = join(KITCHEN, "layout.js");
const THREE = join(ROOT, "node_modules/three/build/three.module.min.js");
/** the picture is drawn under 600 px wide, so it casts a phone's shadow (kitchen.js, `small`) */
const DRAW = { width: 560, scale: 3 };
/** a pixel is part of the kitchen once its three channels differ from the cream by more than this */
const INK = 18;
/** the moments of each loop that are measured, in seconds after its still's moment */
const PROBES = Array.from({ length: 24 }, (_, i) => i * 1.5);
/** the margins round the outline: 16 px of a 358 px text column on each side, 5 % above and below */
const SIDE = 16 / 358;
const AIR = 0.05;
/** the phone the picture's shape is given for: the stage is as wide as its screen */
const PHONE = 390;
const COMBOS = [
  ["with", "pancakes"],
  ["without", "pancakes"],
  ["with", "people"],
  ["without", "people"],
];

const fail = (message) => {
  console.error(`kitchen-phone-view: ${message}`);
  process.exit(1);
};
if (!existsSync(THREE)) fail("three is not installed. Run: npm install");
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright"));
} catch {
  fail("Playwright is not installed. Run: npm install --no-save playwright && npx playwright install chromium");
}

/** the page that draws the scene: it frames the outline of FRAME with room to spare, then
    measures the kitchen in that window */
const HARNESS = `<!doctype html>
<html><head><meta charset="utf-8" />
<style>html,body{margin:0;overflow:hidden}#stage{position:fixed;inset:0}</style>
<script type="importmap">{ "imports": { "three": "/three.module.min.js" } }</script>
</head><body><div id="stage"></div>
<script type="module">
import * as THREE from "three";
import { FRAME, CENTRE } from "/kitchen/layout.js";
import { createPancakeKitchen, POSTER_TIMES, PAGE_COLOR } from "/kitchen/kitchen.js";

// the outline of FRAME from the scene's resting angle (kitchen.js: azimuth 14, elevation 43)
const DEG = Math.PI / 180;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 220);
const target = new THREE.Vector3(...CENTRE);
const az = 14 * DEG;
const el = 43 * DEG;
camera.position.copy(target).addScaledVector(new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)), 90);
camera.lookAt(target);
camera.updateMatrixWorld();
let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
for (const box of FRAME) {
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Vector3(i & 1 ? box.max[0] : box.min[0], i & 2 ? box.max[1] : box.min[1], i & 4 ? box.max[2] : box.min[2]).applyMatrix4(camera.matrixWorldInverse);
    [x0, x1, y0, y1] = [Math.min(x0, p.x), Math.max(x1, p.x), Math.min(y0, p.y), Math.max(y1, p.y)];
  }
}
const mx = (x1 - x0) * 0.2;
const my = (y1 - y0) * 0.3;
window.ROOM = [x0 - mx, x1 + mx, y0 - my, y1 + my];

// one mode and cast: the box of its pixels that are not the page's cream, over every probe
window.measure = (mode, cast, probes, ink) => {
  const stage = document.getElementById("stage");
  const kitchen = createPancakeKitchen(stage, {
    mode, cast, view: window.ROOM, time: POSTER_TIMES[mode], autoplay: false, interactive: false,
    intro: false, badges: false, maxPixelRatio: 3,
  });
  const out = document.createElement("canvas");
  out.width = kitchen.canvas.width;
  out.height = kitchen.canvas.height;
  const g = out.getContext("2d", { willReadFrequently: true });
  const cream = [1, 3, 5].map((i) => parseInt(PAGE_COLOR.slice(i, i + 2), 16));
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  for (const at of probes) {
    // twice: the jolt of a moment shows a frame late (kitchen.js, draw)
    kitchen.seek(POSTER_TIMES[mode] + at);
    kitchen.seek(POSTER_TIMES[mode] + at);
    g.fillStyle = PAGE_COLOR;
    g.fillRect(0, 0, out.width, out.height);
    g.drawImage(kitchen.canvas, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, out.width, out.height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (Math.abs(data[i] - cream[0]) + Math.abs(data[i + 1] - cream[1]) + Math.abs(data[i + 2] - cream[2]) <= ink) continue;
        if (x < box[0]) box[0] = x;
        if (y < box[1]) box[1] = y;
        if (x > box[2]) box[2] = x;
        if (y > box[3]) box[3] = y;
      }
    }
  }
  const size = { width: stage.clientWidth, height: stage.clientHeight, pixelsW: out.width, pixelsH: out.height };
  kitchen.dispose();
  return { box, size };
};
document.documentElement.dataset.ready = "1";
</script></body></html>`;

const MIME = { ".js": "text/javascript" };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (path === "/harness.html") return void res.writeHead(200, { "content-type": "text/html" }).end(HARNESS);
  if (path === "/three.module.min.js") return void res.writeHead(200, { "content-type": "text/javascript" }).end(readFileSync(THREE));
  const file = normalize(join(KITCHEN, path.replace(/^\/kitchen\//, "")));
  if (!path.startsWith("/kitchen/") || !file.startsWith(KITCHEN) || !existsSync(file) || !statSync(file).isFile()) {
    return void res.writeHead(404).end();
  }
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));

const gpu = process.env.KITCHEN_GPU === "1";
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: gpu ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const round = (n) => Math.round(n * 1000) / 1000;
try {
  const context = await browser.newContext({ viewport: { width: DRAW.width, height: 300 }, deviceScaleFactor: DRAW.scale });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/harness.html`);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 60_000 });
  if (problems.length) fail(problems[0]);
  const room = await page.evaluate(() => window.ROOM);
  // the drawing has the window's own shape, so that its pixels map straight onto the window
  await page.setViewportSize({ width: DRAW.width, height: Math.round((DRAW.width * (room[3] - room[2])) / (room[1] - room[0])) });

  // the kitchen's outline in the camera's units: [left, right, bottom, top]
  let outline = [Infinity, -Infinity, Infinity, -Infinity];
  for (const [mode, cast] of COMBOS) {
    const { box, size } = await page.evaluate(([m, c, p, i]) => window.measure(m, c, p, i), [mode, cast, PROBES, INK]);
    if (problems.length) fail(problems[0]);
    if (box[0] < 2 || box[1] < 2 || box[2] > size.pixelsW - 3 || box[3] > size.pixelsH - 3) {
      fail(`the ${mode} kitchen (${cast}) touches the edge of the drawing: give ROOM more room`);
    }
    // the camera's window for this drawing, as kitchen.js fits a view (fit, with pad 1)
    const aspect = size.width / size.height;
    const half = Math.max((room[3] - room[2]) / 2, (room[1] - room[0]) / 2 / aspect);
    const [cx, cy] = [(room[0] + room[1]) / 2, (room[2] + room[3]) / 2];
    const [left, top] = [cx - half * aspect, cy + half];
    const [unitsW, unitsH] = [2 * half * aspect, 2 * half];
    const seen = [
      left + (box[0] / size.pixelsW) * unitsW,
      left + ((box[2] + 1) / size.pixelsW) * unitsW,
      top - ((box[3] + 1) / size.pixelsH) * unitsH,
      top - (box[1] / size.pixelsH) * unitsH,
    ];
    console.log(`${mode.padEnd(7)} ${cast.padEnd(8)} x ${round(seen[0])} to ${round(seen[1])}, y ${round(seen[2])} to ${round(seen[3])}`);
    outline = [Math.min(outline[0], seen[0]), Math.max(outline[1], seen[1]), Math.min(outline[2], seen[2]), Math.max(outline[3], seen[3])];
  }

  // the window: the outline, 16/358 of its width on each side, and 5 % of the picture above and
  // below, rounded so that a picture 390 px wide is a whole number of pixels high
  const kitchenW = outline[1] - outline[0];
  const viewW = kitchenW * (1 + 2 * SIDE);
  const tall = Math.round((PHONE * (outline[3] - outline[2])) / (1 - 2 * AIR) / viewW);
  const viewH = (viewW * tall) / PHONE;
  const middle = (outline[2] + outline[3]) / 2;
  const view = [outline[0] - kitchenW * SIDE, outline[1] + kitchenW * SIDE, middle - viewH / 2, middle + viewH / 2].map(round);
  const now = readFileSync(LAYOUT, "utf8").match(/export const PHONE_VIEW = (\[[^\]]*\])/)?.[1];
  console.log(`
PHONE_VIEW, in components/sections/landing-v3/kitchen/layout.js${now === JSON.stringify(view).replace(/,/g, ", ") ? " (unchanged)" : ""}:
  export const PHONE_VIEW = ${JSON.stringify(view).replace(/,/g, ", ")};

The picture's shape, ${PHONE} x ${tall}: kitchen.css, on phones, aspect-ratio: ${PHONE} / ${tall}
(scripts/kitchen-posters.mjs reads it from PHONE_VIEW: the phone stills are ${PHONE * 3} x ${tall * 3}).`);
} finally {
  await browser.close();
  server.close();
}
