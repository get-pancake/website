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
 *   colours' own cycle), 960 x 600 at 30 frames a second, H.264.
 * - with-pancakes-phone.webp, without-pancakes-phone.webp: the loop's first frame, the picture a
 *   phone shows before the loop plays (and instead of it, with reduced motion).
 * - the four other phone stills (the little chefs, the tank without its marks), in the same
 *   framing, for a page that would set those options (the homepage does not).
 *
 * The phone framing: the designer's camera (azimuth 14, elevation 43), the view fixed (no drift,
 * no tilt), no badges (at a phone's size they cover each other), zoomed 1.3 on a 16:10 picture
 * as wide as the screen: the kitchen's two ends run off its edges.
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

/** the picture: 960 x 600 (16:10) */
const WIDTH = 960;
const HEIGHT = 600;
/** the camera's zoom on that picture: the kitchen's two ends run off its sides */
const ZOOM = 1.3;
const FPS = 30;
/** 12 orders of 3 s: the order colours' cycle */
const LOOP = 36;
/** the intake's ingredients: 20 in a loop (it is 1.02 / 0.62 = 1.65 s apart in the 3D) */
const INTAKE_PERIOD = LOOP / 20;
/** what still differs between the loop's end and its start dissolves over this */
const SEAM = 0.3;
/** H.264: constant quality 31 (crf): 1.5 MB a loop. 33 is 1 MB, and the tiles and the flipping
    pancakes go soft at a phone's size. */
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
  badges: false, intro: false, zoom: Number(q.get("zoom")), maxPixelRatio: 1, time: POSTER_TIMES[mode],
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
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
mkdirSync(OUT, { recursive: true });

/** opens the scene for one picture: the page, and the moment its loop starts */
async function open(still) {
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push(error.message));
  const query = `mode=${still.mode}&cast=${still.cast}&logos=${still.logos ? 1 : 0}&zoom=${ZOOM}&intake=${INTAKE_PERIOD}`;
  await page.goto(`${origin}/harness.html?${query}`);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 120_000 });
  if (problems.length) throw new Error(problems[0]);
  if (!(await page.evaluate(() => Boolean(window.__kitchen)))) throw new Error("the scene did not start (no WebGL?)");
  return { page, t0: await page.evaluate(() => window.__t0), problems };
}

/** a PNG as WebP, encoded by the browser (as scripts/kitchen-posters.mjs does) */
async function webp(page, png) {
  const data = await page.evaluate(
    async ([base64, quality]) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      return canvas.toDataURL("image/webp", quality).split(",")[1];
    },
    [png.toString("base64"), QUALITY],
  );
  return Buffer.from(data, "base64");
}

const kB = (bytes) => `${Math.round(bytes / 1024)} kB`;
let errors = 0;
const frames = LOOP * FPS;
const tail = Math.round(SEAM * FPS);
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
    const seam = `[0:v]split[a][b];[a]trim=end_frame=${frames},setpts=PTS-STARTPTS[loop];[b]trim=start_frame=${frames},setpts=PTS-STARTPTS,format=yuva420p,fade=t=out:st=0:d=${SEAM}:alpha=1[tail];[loop][tail]overlay=eof_action=pass,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[out]`;
    execFileSync("ffmpeg", [
      ...["-hide_banner", "-loglevel", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "f%05d.png")],
      ...["-filter_complex", seam, "-map", "[out]"],
      ...["-c:v", "libx264", "-preset", "veryslow", "-crf", String(CRF), "-tune", "animation", "-profile:v", "high", "-g", String(2 * FPS)],
      ...["-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"],
      ...["-movflags", "+faststart", "-an", video],
    ]);
    // the still: the loop's first frame, which is the frame after its last one (the tail's first)
    const still = await webp(page, readFileSync(join(dir, `f${String(frames).padStart(5, "0")}.png`)));
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
    const bytes = await webp(page, await page.screenshot());
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
