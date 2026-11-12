#!/usr/bin/env node
/**
 * Toy art: redraws the pictures of the 1-2-3 and of "What your agent can do with Pancake"
 * (public/lp/toys) from their 3D sets, and writes where each one goes on its stage
 * (components/sections/landing-v3/lp-toy-art.ts).
 *
 *   node scripts/toy-art.mjs            # every set
 *   node scripts/toy-art.mjs radar      # only the sets whose name holds "radar"
 *
 * Run it after a change to a set (components/sections/landing-v3/toys/studio/scene-*.js). The
 * page moves these drawings to the places lp-toy-art.ts names, so the two are always written
 * together: never edit lp-toy-art.ts by hand.
 *
 * How: it serves the studio's folder on this machine, opens the studio page in a headless
 * Chromium and asks it for each set (window.__studio.draw). The studio draws every layer on a
 * transparent ground, crops it to what is drawn and encodes it as WebP. Chromium draws in
 * software (SwiftShader), so the pictures are the same on every machine.
 *
 * It needs three (a dependency of the kitchen section) and Playwright, which this repository
 * does not depend on: npm install --no-save playwright && npx playwright install chromium
 */
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = "components/sections/landing-v3/toys/studio/index.html";
const OUT = join(ROOT, "public/lp/toys");
const ART = join(ROOT, "components/sections/landing-v3/lp-toy-art.ts");
const THREE = join(ROOT, "node_modules/three/build/three.module.min.js");
/** what the local server may serve: the studio and the kitchen's shapes it draws with */
const SERVED = ["components/sections/landing-v3/toys", "components/sections/landing-v3/kitchen"].map((p) => join(ROOT, p) + sep);
/** device px per stage px: the pictures are saved at twice the stage's size */
const SCALE = 2;

const fail = (message) => {
  console.error(`toy-art: ${message}`);
  process.exit(1);
};
if (!existsSync(THREE)) fail("three is not installed. Run: npm install");
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  fail("Playwright is not installed. Run: npm install --no-save playwright && npx playwright install chromium");
}

const MIME = { ".html": "text/html", ".js": "text/javascript" };
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

/* lp-toy-art.ts holds one constant a set (ART_SOURCES, ART_RADAR…), each strict JSON, so that a
   page only carries the sets it shows, and this script can read them back: a run for one set
   keeps the others as they are. */
const constant = (name) => `ART_${name.toUpperCase()}`;
const SET = /^export const ART_([A-Z]+) = (\{[\s\S]*?\n\}) as const;$/gm;
const art = {};
if (existsSync(ART)) {
  for (const [, name, json] of readFileSync(ART, "utf8").matchAll(SET)) art[name.toLowerCase()] = JSON.parse(json);
}

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let errors = 0;
let written = 0;
try {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
  // the studio asks a CDN for three: give it the copy this repository installed
  await context.route(/\/three@[^/]+\/build\/three\.module\.min\.js$/, (route) =>
    route.fulfill({ body: readFileSync(THREE), contentType: "text/javascript" }),
  );
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  await page.goto(`${origin}/${PAGE}`);
  await page.waitForFunction(() => document.documentElement.dataset.ready === "1", null, { timeout: 120_000 }).catch(() => {
    fail(`the studio did not start${problems.length ? `: ${problems[0]}` : " (no WebGL?)"}`);
  });
  const names = await page.evaluate(() => window.__studio.scenes);
  const only = process.argv[2];
  const wanted = only ? names.filter((name) => name.includes(only)) : names;
  if (!wanted.length) fail(`no set is named like "${only}". The names: ${names.join(", ")}`);
  // a set the studio no longer has leaves the file with it
  for (const name of Object.keys(art)) if (!names.includes(name)) delete art[name];

  for (const name of wanted) {
    try {
      const drawn = await page.evaluate(([id, scale]) => window.__studio.draw(id, scale), [name, SCALE]);
      const dir = join(OUT, name);
      // a layer the set no longer names must not stay behind
      if (existsSync(dir)) for (const file of readdirSync(dir)) if (file.endsWith(".webp")) rmSync(join(dir, file));
      mkdirSync(dir, { recursive: true });
      const layers = {};
      let bytes = 0;
      for (const layer of drawn.layers) {
        const data = Buffer.from(layer.data, "base64");
        writeFileSync(join(dir, `${layer.name}.webp`), data);
        bytes += data.length;
        layers[layer.name] = { src: `/lp/toys/${name}/${layer.name}.webp`, x: layer.x, y: layer.y, w: layer.w, h: layer.h };
      }
      art[name] = { size: drawn.size, px: drawn.px, ground: drawn.ground, up: drawn.up, layers, anchors: drawn.anchors, paths: drawn.paths };
      written += drawn.layers.length;
      console.log(`${name.padEnd(10)} ${String(drawn.layers.length).padStart(3)} pictures  ${Math.round(bytes / 1024)} kB`);
    } catch (error) {
      errors++;
      console.error(`${name}: ${error.message.split("\n")[0]}`);
    }
  }
  if (problems.length) console.error(`the studio reported: ${problems[0]}`);
} finally {
  await browser.close();
  server.close();
}

/** one layer, anchor or path a line */
const one = (value) => JSON.stringify(value);
const group = (map) => `{\n${Object.entries(map).map(([key, value]) => `  ${one(key)}: ${one(value)}`).join(",\n")}\n }`;
const names = Object.keys(art).sort();
const sets = names
  .map(
    (name) =>
      `export const ${constant(name)} = {\n "size": ${one(art[name].size)},\n "px": ${one(art[name].px)},\n "ground": ${one(art[name].ground)},\n "up": ${one(art[name].up)},\n` +
      ` "layers": ${group(art[name].layers)},\n "anchors": ${group(art[name].anchors)},\n "paths": ${group(art[name].paths)}\n} as const;`,
  )
  .join("\n\n");
writeFileSync(
  ART,
  `/**
 * Where each picture of the toy sets goes on its stage, in stage px: the layers (public/lp/toys),
 * the points a badge stands at or a drawing moves to (anchors), the lines a drawing follows
 * (paths), and the ground as a CSS matrix (what lies flat on it). One constant a set, so that a
 * take only carries its own set.
 * WRITTEN BY scripts/toy-art.mjs FROM THE 3D SETS (toys/studio/scene-*.js). Never edit it by
 * hand: change the set and run the script, which redraws the pictures with it.
 */
${sets}

/** every set, by the name of its folder in public/lp/toys (the stages' own lookups: LpToyKit.tsx) */
export const TOY_ART = { ${names.map((name) => `${name}: ${constant(name)}`).join(", ")} } as const;
`,
);
console.log(`toy-art: ${written} picture(s) written to public/lp/toys, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
