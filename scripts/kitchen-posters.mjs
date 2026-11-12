#!/usr/bin/env node
/**
 * Kitchen posters: redraws the wide still pictures of the kitchen section (public/lp/kitchen)
 * from the scene itself.
 *
 *   node scripts/kitchen-posters.mjs            # every still
 *   node scripts/kitchen-posters.mjs without    # only the stills whose name holds "without"
 *
 * Run it after a change to the scene, to its words (kitchen/words.js) or to its logos. A still
 * is the picture of one moment (POSTER_TIMES in kitchen.js), with its badges, and LpKitchen.tsx
 * starts the live scene at that same moment so that it takes over without a jump: a still that
 * is out of date shows as a jump when the scene starts.
 *
 * How: it serves the scene's folder on this machine, opens the scene's review page
 * (components/sections/landing-v3/kitchen/preview) in a headless Chromium with ?poster=1, takes
 * a capture on a transparent background, and encodes it as WebP in that browser. Chromium draws
 * in software (SwiftShader), so the stills are the same on every machine. The badges are set in
 * the reading face of the landing page (app/fonts/geist), as on the page.
 *
 * It draws the wide stills only. The phone ones (*-phone.webp) are the first frames of the phone
 * loops, in their own framing: scripts/kitchen-phone-loops.mjs draws them (2026-11-12).
 *
 * It needs three (a dependency of the section) and Playwright, which this repository does not
 * depend on: npm install --no-save playwright && npx playwright install chromium
 */
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = "components/sections/landing-v3/kitchen/preview/index.html";
const OUT = join(ROOT, "public/lp/kitchen");
const THREE = join(ROOT, "node_modules/three/build/three.module.min.js");
/** what the local server may serve: the scene, its stills and the reading face of the landing
 *  page (the badges are set in it), nothing else of the repository */
const SERVED = ["components/sections/landing-v3/kitchen", "public/lp/kitchen", "app/fonts/geist"].map((p) => join(ROOT, p) + sep);
const FONT = '600 14px "Landing Sans"';
const QUALITY = 0.82;
/** [name suffix, viewport, device pixels per CSS pixel]: 1944 x 1094 with the badges. (Until
 *  2026-11-12 also 1170 x 657 for phones: those are now the phone loops' first frames,
 *  scripts/kitchen-phone-loops.mjs.) */
const SIZES = [["", { width: 1296, height: 729 }, 1.5]];

const fail = (message) => {
  console.error(`kitchen-posters: ${message}`);
  process.exit(1);
};
if (!existsSync(THREE)) fail("three is not installed. Run: npm install");
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  fail("Playwright is not installed. Run: npm install --no-save playwright && npx playwright install chromium");
}

/** one still per mode and cast, one more without the vendor marks on the tank */
const stills = [];
for (const mode of ["with", "without"]) {
  for (const cast of ["pancakes", "people"]) {
    for (const plain of mode === "without" ? [false, true] : [false]) {
      for (const [suffix, viewport, scale] of SIZES) {
        stills.push({ name: `${mode}-${cast}${plain ? "-plain" : ""}${suffix}`, mode, cast, plain, viewport, scale });
      }
    }
  }
}
const only = process.argv[2];
const wanted = only ? stills.filter((s) => s.name.includes(only)) : stills;
if (!wanted.length) fail(`no still is named like "${only}". The names: ${stills.map((s) => s.name).join(", ")}`);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const file = normalize(join(ROOT, decodeURIComponent(new URL(req.url, "http://localhost").pathname)));
  if (!SERVED.some((dir) => file.startsWith(dir)) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" }).end(readFileSync(file));
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let errors = 0;
try {
  for (const still of wanted) {
    const context = await browser.newContext({ viewport: still.viewport, deviceScaleFactor: still.scale });
    // the review page asks a CDN for three: give it the copy this repository installed
    await context.route(/\/three@[^/]+\/build\/three\.module\.min\.js$/, (route) =>
      route.fulfill({ body: readFileSync(THREE), contentType: "text/javascript" }),
    );
    const page = await context.newPage();
    const problems = [];
    page.on("pageerror", (error) => problems.push(error.message));
    const query = `bare=1&poster=1&mode=${still.mode}&cast=${still.cast}${still.plain ? "&logos=0" : ""}&dpr=${still.scale}`;
    await page.goto(`${origin}/${PAGE}?${query}`);
    try {
      await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 120_000 });
      if (!(await page.evaluate(() => Boolean(window.__kitchen)))) throw new Error("the scene did not start (no WebGL?)");
      // the badges must be set in the landing's own face before the capture
      const faces = await page.evaluate((font) => document.fonts.load(font).then((loaded) => loaded.length), FONT);
      if (!faces) throw new Error("the reading face of the landing page did not load (app/fonts/geist)");
      await page.waitForTimeout(300);
      const png = await page.screenshot({ omitBackground: true });
      const webp = await page.evaluate(
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
      if (problems.length) throw new Error(problems[0]);
      const bytes = Buffer.from(webp, "base64");
      writeFileSync(join(OUT, `${still.name}.webp`), bytes);
      console.log(`${`${still.name}.webp`.padEnd(34)} ${still.viewport.width * still.scale} x ${Math.round(still.viewport.height * still.scale)}  ${Math.round(bytes.length / 1024)} kB`);
    } catch (error) {
      errors++;
      console.error(`${still.name}: ${error.message.split("\n")[0]}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`kitchen-posters: ${wanted.length - errors} still(s) written to public/lp/kitchen, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
