#!/usr/bin/env node
/**
 * Kitchen phone loops: draws the kitchen section's phone pictures (public/lp/kitchen/*-phone.*)
 * from the scene itself.
 *
 *   node scripts/kitchen-phone-loops.mjs
 *
 * Phones do not run the 3D scene (founder 2026-11-12: "en code simple genre déterministe",
 * without the touch that turns the view). They play a loop of it instead: a short video, drawn
 * here frame by frame. Every position in the scene is a function of the time, so each frame is
 * the scene's own picture of that moment, and the loop shows exactly what the 3D shows.
 *
 * What it writes, for the homepage's kitchen (the pancake chefs, the vendor marks on the tank):
 * - with-pancakes-phone.mp4, without-pancakes-phone.mp4: 36 s loops (12 orders of 3 s: the order
 *   colours' own cycle), 960 wide at 30 frames a second, H.264.
 * - with-pancakes-phone.webp, without-pancakes-phone.webp: the loop's first frame, the picture a
 *   phone shows before the loop plays (and instead of it, with reduced motion).
 * - the four other phone stills (the little chefs, the tank without its marks), in the same
 *   framing, for a page that would set those options (the homepage does not).
 *
 * The phone framing: the designer's camera (azimuth 14, elevation 43), the view fixed (no drift,
 * no tilt), no badges (at a phone's size they cover each other), the whole kitchen (founder
 * 2026-11-12: "Faut pas qu'il dépasse des deux côtés", then "Whole kitchen" of two framings):
 * each frame is drawn large with room round the kitchen, then cut to the kitchen's own outline
 * (its shadow included, the same for both modes) plus a margin of 16/358 of its width on each
 * side, so that on a picture as wide as a phone's screen the kitchen spans exactly the page's
 * text column (16 px margins at any width). The script prints the picture's size: kitchen.css
 * sets the stage's aspect ratio to it.
 *
 * The loop's seam: the order colours come back every 36 s. The ingredients on the intake belts
 * come every 1.65 s, which 36 s does not hold a whole number of times: for these loops they come
 * every 1.8 s (20 in 36 s). What still differs between the loop's end and its start (each
 * ingredient's own turn on its belt, a blink, the order counter) dissolves over 0.3 s.
 *
 * Run it after a change to the scene, as scripts/kitchen-posters.mjs (which draws the wide stills).
 *
 * It needs three (a dependency of the section), ffmpeg on the PATH (with libx264), and
 * Playwright, which this repository does not depend on:
 *   npm install --no-save playwright && npx playwright install chromium
 * Chromium draws in software (SwiftShader) by default, about half a second a frame (some 20
 * minutes for everything). KITCHEN_GPU=1 draws on this machine's graphics card instead (a minute
 * or two; the frames differ from the software ones by less than one level of colour on average).
 * PLAYWRIGHT_MODULE and CHROMIUM_PATH point at another copy of Playwright and of Chromium.
 */
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KITCHEN = join(ROOT, "components/sections/landing-v3/kitchen") + sep;
const OUT = join(ROOT, "public/lp/kitchen");
const THREE = join(ROOT, "node_modules/three/build/three.module.min.js");

/** where a frame is drawn: large, the kitchen fitted with room round it (pad) */
const RENDER = { width: 1920, height: 960, zoom: 1, pad: 1.2 };
/** the picture: this wide, as tall as the kitchen's outline and its margins need */
const WIDTH = 960;
/** the margins round the kitchen's outline: on each side 16/358 of its width (the page's margin
    over its text column at 390 px), above and below 5 % of the picture's height */
const SIDE = 16 / 358;
const TOP = 0.05;
/** a pixel this far from the page's cream (summed over the three channels) is the kitchen */
const INK = 18;
/** the moments the outline is measured at, in each mode (it is the union of them) */
const PROBES = [0, 6, 12, 18, 24, 30];
const FPS = 30;
/** 12 orders of 3 s: the order colours' cycle */
const LOOP = 36;
/** the intake's ingredients: 20 in a loop (it is 1.02 / 0.62 = 1.65 s apart in the 3D) */
const INTAKE_PERIOD = LOOP / 20;
/** what still differs between the loop's end and its start dissolves over this */
const SEAM = 0.3;
/** H.264: constant quality 31 (crf): about 1 MB a loop. 33 is a third smaller, and the tiles and
    the flipping pancakes go soft at a phone's size. */
const CRF = 31;
const QUALITY = 0.82;

const fail = (message) => {
  console.error(`kitchen-phone-loops: ${message}`);
  process.exit(1);
};
if (!existsSync(THREE)) fail("three is not installed. Run: npm install");
try {
  execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { stdio: "pipe" }).toString().includes("libx264") || fail("ffmpeg has no libx264 encoder");
} catch {
  fail("ffmpeg is not on the PATH");
}
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright"));
} catch {
  fail("Playwright is not installed. Run: npm install --no-save playwright && npx playwright install chromium");
}

/** the page that draws one moment of the scene, in the phone framing */
const HARNESS = `<!doctype html>
<html><head><meta charset="utf-8" />
<style>html,body{margin:0;background:#fbf6f1;overflow:hidden}#stage{position:fixed;inset:0}</style>
<script type="importmap">{ "imports": { "three": "/vendor/three.module.min.js" } }</script>
</head><body><div id="stage"></div>
<script type="module">
import { INTAKE } from "/components/sections/landing-v3/kitchen/layout.js";
import { createPancakeKitchen, POSTER_TIMES } from "/components/sections/landing-v3/kitchen/kitchen.js";
const q = new URLSearchParams(location.search);
INTAKE.speed = INTAKE.gap / Number(q.get("intake"));
const mode = q.get("mode");
window.__kitchen = createPancakeKitchen(document.getElementById("stage"), {
  mode, cast: q.get("cast"), vendorLogos: q.get("logos") === "1", autoplay: false, interactive: false,
  badges: false, intro: false, zoom: Number(q.get("zoom")), pad: Number(q.get("pad")), maxPixelRatio: 1,
  time: POSTER_TIMES[mode],
});
window.__t0 = POSTER_TIMES[mode];
document.documentElement.dataset.ready = "1";
</script></body></html>`;

/** the two loops, then the stills that have no loop */
const LOOPS = [
  { name: "with-pancakes-phone", mode: "with", cast: "pancakes", logos: true },
  { name: "without-pancakes-phone", mode: "without", cast: "pancakes", logos: true },
];
const STILLS = [
  { name: "with-people-phone", mode: "with", cast: "people", logos: true },
  { name: "without-people-phone", mode: "without", cast: "people", logos: true },
  { name: "without-pancakes-plain-phone", mode: "without", cast: "pancakes", logos: false },
  { name: "without-people-plain-phone", mode: "without", cast: "people", logos: false },
];

const MIME = { ".js": "text/javascript" };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (path === "/harness.html") return void res.writeHead(200, { "content-type": "text/html" }).end(HARNESS);
  if (path === "/vendor/three.module.min.js") return void res.writeHead(200, { "content-type": "text/javascript" }).end(readFileSync(THREE));
  const file = normalize(join(ROOT, path));
  if (!file.startsWith(KITCHEN) || !existsSync(file) || !statSync(file).isFile()) return void res.writeHead(404).end();
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;

const gpu = process.env.KITCHEN_GPU === "1";
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: gpu ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({ viewport: { width: RENDER.width, height: RENDER.height }, deviceScaleFactor: 1 });
mkdirSync(OUT, { recursive: true });

/** opens the scene for one picture: the page, and the moment its loop starts */
async function open(still) {
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push(error.message));
  const query = `mode=${still.mode}&cast=${still.cast}&logos=${still.logos ? 1 : 0}&zoom=${RENDER.zoom}&pad=${RENDER.pad}&intake=${INTAKE_PERIOD}`;
  await page.goto(`${origin}/harness.html?${query}`);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 120_000 });
  if (problems.length) throw new Error(problems[0]);
  if (!(await page.evaluate(() => Boolean(window.__kitchen)))) throw new Error("the scene did not start (no WebGL?)");
  return { page, t0: await page.evaluate(() => window.__t0), problems };
}

/** the box of a frame's pixels that are not the page's cream: [x0, y0, x1, y1] */
async function outline(page, png) {
  return page.evaluate(
    async ([base64, ink]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const g = canvas.getContext("2d", { willReadFrequently: true });
      g.drawImage(image, 0, 0);
      const { data, width, height } = g.getImageData(0, 0, canvas.width, canvas.height);
      let x0 = width, y0 = height, x1 = -1, y1 = -1;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          if (Math.abs(data[i] - 251) + Math.abs(data[i + 1] - 246) + Math.abs(data[i + 2] - 241) <= ink) continue;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
      return [x0, y0, x1, y1];
    },
    [png.toString("base64"), INK],
  );
}

/** a PNG cut to `crop` ({ x, y, w, h }) and drawn `width` x `height`, as WebP, encoded by the
    browser (as scripts/kitchen-posters.mjs does) */
async function webp(page, png, crop, width, height) {
  const data = await page.evaluate(
    async ([base64, quality, c, w, h]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const g = canvas.getContext("2d");
      g.imageSmoothingQuality = "high";
      g.drawImage(image, c.x, c.y, c.w, c.h, 0, 0, w, h);
      return canvas.toDataURL("image/webp", quality).split(",")[1];
    },
    [png.toString("base64"), QUALITY, crop, width, height],
  );
  return Buffer.from(data, "base64");
}

const kB = (bytes) => `${Math.round(bytes / 1024)} kB`;
let errors = 0;
const frames = LOOP * FPS;
const tail = Math.round(SEAM * FPS);

// the kitchen's outline, the same for both modes: the union of its box at a few moments of each
let box = [Infinity, Infinity, -Infinity, -Infinity];
for (const loop of LOOPS) {
  const { page, t0 } = await open(loop);
  for (const at of PROBES) {
    await page.evaluate((t) => window.__kitchen.seek(t), t0 + at);
    const [x0, y0, x1, y1] = await outline(page, await page.screenshot());
    box = [Math.min(box[0], x0), Math.min(box[1], y0), Math.max(box[2], x1), Math.max(box[3], y1)];
  }
  await page.close();
}
const kitchenW = box[2] - box[0] + 1;
const kitchenH = box[3] - box[1] + 1;
const side = Math.round(kitchenW * SIDE);
const cropW = kitchenW + 2 * side;
const cropH = Math.round(kitchenH / (1 - 2 * TOP));
const crop = { x: box[0] - side, y: box[1] - Math.round((cropH - kitchenH) / 2), w: cropW, h: cropH };
const HEIGHT = Math.round((WIDTH * cropH) / cropW / 2) * 2;
if (crop.x < 0 || crop.y < 0 || crop.x + crop.w > RENDER.width || crop.y + crop.h > RENDER.height) {
  fail(`the kitchen and its margins do not fit the drawing (${JSON.stringify(crop)}): give RENDER more pad`);
}
console.log(`the picture: ${WIDTH} x ${HEIGHT} (aspect-ratio ${WIDTH} / ${HEIGHT} in kitchen.css)`);

for (const loop of LOOPS) {
  const dir = mkdtempSync(join(tmpdir(), "kitchen-loop-"));
  try {
    const { page, t0, problems } = await open(loop);
    // the loop and, after it, the moments that dissolve into its first ones
    for (let i = 0; i < frames + tail; i++) {
      await page.evaluate((t) => window.__kitchen.seek(t), t0 + i / FPS);
      await page.screenshot({ path: join(dir, `f${String(i).padStart(5, "0")}.png`) });
    }
    if (problems.length) throw new Error(problems[0]);
    const video = join(OUT, `${loop.name}.mp4`);
    // frames [0, frames) are the loop; the `tail` after them lie over its first ones, fading out,
    // so its last frame runs into its first. Colours tagged BT.709, the space a browser reads.
    const seam = `[0:v]crop=${crop.w}:${crop.h}:${crop.x}:${crop.y},scale=${WIDTH}:${HEIGHT}:flags=lanczos,split[a][b];[a]trim=end_frame=${frames},setpts=PTS-STARTPTS[loop];[b]trim=start_frame=${frames},setpts=PTS-STARTPTS,format=yuva420p,fade=t=out:st=0:d=${SEAM}:alpha=1[tail];[loop][tail]overlay=eof_action=pass,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]`;
    execFileSync("ffmpeg", [
      ...["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "f%05d.png")],
      ...["-filter_complex", seam, "-map", "[out]"],
      ...["-c:v", "libx264", "-preset", "veryslow", "-crf", String(CRF), "-tune", "animation", "-profile:v", "high", "-g", String(2 * FPS)],
      ...["-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"],
      ...["-movflags", "+faststart", "-an", video],
    ]);
    // the still: the loop's first frame, which is the frame after its last one (the tail's first)
    const still = await webp(page, readFileSync(join(dir, `f${String(frames).padStart(5, "0")}.png`)), crop, WIDTH, HEIGHT);
    writeFileSync(join(OUT, `${loop.name}.webp`), still);
    console.log(`${`${loop.name}.mp4`.padEnd(34)} ${LOOP} s, ${WIDTH} x ${HEIGHT}  ${kB(statSync(video).size)}`);
    console.log(`${`${loop.name}.webp`.padEnd(34)} ${WIDTH} x ${HEIGHT}  ${kB(still.length)}`);
    await page.close();
  } catch (error) {
    errors++;
    console.error(`${loop.name}: ${String(error.message).split("\n")[0]}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
for (const still of STILLS) {
  try {
    const { page, t0, problems } = await open(still);
    await page.evaluate((t) => window.__kitchen.seek(t), t0);
    const bytes = await webp(page, await page.screenshot(), crop, WIDTH, HEIGHT);
    if (problems.length) throw new Error(problems[0]);
    writeFileSync(join(OUT, `${still.name}.webp`), bytes);
    console.log(`${`${still.name}.webp`.padEnd(34)} ${WIDTH} x ${HEIGHT}  ${kB(bytes.length)}`);
    await page.close();
  } catch (error) {
    errors++;
    console.error(`${still.name}: ${String(error.message).split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(`kitchen-phone-loops: ${LOOPS.length * 2 + STILLS.length - errors} file(s) written to public/lp/kitchen, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
