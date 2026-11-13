// The Pancake kitchen: a small 3D diorama that runs by itself.
//
//   const kitchen = createPancakeKitchen(element);   // fills the element, starts playing
//   kitchen.stop(); kitchen.start(); kitchen.seek(12); kitchen.dispose();
//   kitchen.setMode("without");   // the same kitchen without Pancake, and "with" to come back
//   kitchen.setCast("people");    // little chefs in place of the pancake chefs, or "pancakes"
//
//   const kitchen = await bootPancakeKitchen(element, options, signal);   // the same, set up a
//   // part at a time between the page's frames (the homepage: see bootPancakeKitchen)
//
// The options are listed in kitchen.d.ts.
//
// The whole animation is a pure function of time (show.js), so `seek` can jump anywhere and a
// still frame is always a valid poster.

import * as THREE from "three";
import { C } from "./palette.js";
import { FRAME, CENTRE } from "./layout.js";
import { WORDS } from "./words.js";
import { buildWorld } from "./world.js";
import { createShow } from "./show.js";
import { createOverlay } from "./overlay.js";
import { disposeGeometries } from "./geo.js";
import { disposeMaterials } from "./mats.js";
import { clamp } from "./util.js";

const DEG = Math.PI / 180;

/**
 * A moment of each loop that shows every station at work. The still pictures of the landing
 * page are drawn at these times, and the live scene starts there (`time`, with `intro: false`),
 * so that it takes over from the picture without a jump.
 */
export const POSTER_TIMES = { with: 31.52, without: 41.6 };

/** a phone's window on the kitchen, for the `view` option: see layout.js */
export { PHONE_VIEW } from "./layout.js";

/**
 * A loop that cannot keep up gives the picture back (`onSlow`): under SLOW_FPS frames a second
 * for SLOW_WINDOWS windows of SLOW_WINDOW_MS in a row. A still picture is better than a slide
 * show that heats the device (a slow phone, a browser that draws WebGL in software). The same
 * line as the page's other WebGL (LpRainbowGL's governor): 12 a second, two windows of 2 s.
 * A phone in low-power mode draws 30 a second and passes.
 */
const SLOW_FPS = 12;
const SLOW_WINDOW_MS = 2000;
const SLOW_WINDOWS = 2;

/** The light of the scene: a soft warm studio, built as a tiny scene (here) and blurred (below). */
function makeStudio() {
  const env = new THREE.Scene();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(60, 32, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(1.08, 1.04, 1.0) },
        mid: { value: new THREE.Color(0.9, 0.84, 0.82) },
        bot: { value: new THREE.Color(0.8, 0.66, 0.66) },
      },
      vertexShader: "varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader:
        "varying vec3 vDir; uniform vec3 top; uniform vec3 mid; uniform vec3 bot;" +
        "void main(){ float h = normalize(vDir).y;" +
        "vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.55)) : mix(mid, bot, pow(-h, 0.6));" +
        "gl_FragColor = vec4(c, 1.0); }",
    }),
  );
  env.add(dome);
  const softbox = (color, power, pos, w, h) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }),
    );
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  softbox("#fff3e2", 6.5, [-24, 30, 20], 26, 26); // the key, upper left
  softbox("#ffdfea", 2.4, [28, 12, -16], 22, 14); // a pink rim from behind
  softbox("#ffffff", 1.5, [12, 26, 28], 18, 12); // a front fill
  return env;
}

/** the studio blurred into the scene's environment map, then freed */
function blurStudio(renderer, env) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  env.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  return target;
}

/**
 * Runs `fn` as if the renderer drew into a render target: three compiles a program per set of
 * parameters, and drawn offscreen (the studio's blur, the shadow map) a material has no tone
 * mapping and a linear output. Compiled this way, they are the programs those draws look for.
 */
function offscreen(renderer, fn) {
  const target = new THREE.WebGLRenderTarget(1, 1);
  renderer.setRenderTarget(target);
  const result = fn();
  renderer.setRenderTarget(null);
  target.dispose();
  return result;
}

/**
 * Compiles the programs of `part` (as it will be drawn in `into`) and settles once they are all
 * linked, polling as three's compileAsync does. That one throws, and never settles, once a
 * material it waits on is freed (the studio's are as soon as it is blurred; a phone frees the
 * scene as the visitor leaves): a freed one counts as ready here. It stops waiting after 8 s.
 */
function compileInBackground(renderer, part, camera, into) {
  const materials = renderer.compile(part, camera, into);
  const deadline = performance.now() + 8000;
  return new Promise((resolve) => {
    const check = () => {
      for (const m of materials) {
        const program = renderer.properties.get(m).currentProgram;
        if (!program || program.isReady()) materials.delete(m);
      }
      if (materials.size === 0 || performance.now() > deadline) resolve();
      else setTimeout(check, 10);
    };
    check();
  });
}

/**
 * The shadow pass's programs, compiled in the background with the scene's (`warm`). three draws
 * the shadow map with one depth material, set for each object it draws (its side, its map, its
 * alpha test), and compiles a program for each kind in the first frame: 80 ms of that frame,
 * waiting on the links (profiled 2026-11-13). The same material, set the same way on a stand-in
 * for each kind and compiled offscreen, leaves those programs ready: three keeps one program per
 * set of parameters, whichever material asked for it. A VSM shadow map draws the objects that
 * receive a shadow too, and the hidden ones need theirs once they show. Returns the stand-ins'
 * materials, to free with the scene: a program is freed with the last material that uses it.
 */
function warmShadows(renderer, scene, camera, compiling) {
  const kinds = new Map();
  scene.traverse((o) => {
    if (!o.isMesh || !(o.castShadow || o.receiveShadow) || o.isSkinnedMesh || o.isBatchedMesh) return;
    const m = o.material;
    if (!m || Array.isArray(m)) return;
    const g = o.geometry;
    const side = m.shadowSide !== null ? m.shadowSide : m.side;
    const kind = [
      side,
      m.map ? m.map.channel : -1,
      m.alphaMap ? m.alphaMap.channel : -1,
      m.alphaTest > 0,
      o.isInstancedMesh ? `instanced ${o.instanceColor !== null} ${o.morphTexture !== null}` : "",
      ["uv1", "uv2", "uv3"].filter((name) => g.attributes[name]).join(),
      Object.keys(g.morphAttributes).join(),
    ].join("|");
    if (kinds.has(kind)) return;
    // as three's shadow pass sets its depth material for this object (WebGLShadowMap, VSM)
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.side = side;
    depth.map = m.map;
    depth.alphaMap = m.alphaMap;
    depth.alphaTest = m.alphaTest;
    const stand = o.isInstancedMesh ? new THREE.InstancedMesh(g, depth, 1) : new THREE.Mesh(g, depth);
    if (o.isInstancedMesh) {
      stand.instanceColor = o.instanceColor;
      stand.morphTexture = o.morphTexture;
    }
    kinds.set(kind, stand);
  });
  const stands = new THREE.Group();
  for (const stand of kinds.values()) stands.add(stand);
  compiling.push(offscreen(renderer, () => compileInBackground(renderer, stands, camera, scene)));
  return [...kinds.values()].map((stand) => stand.material);
}

export function createPancakeKitchen(container, options = {}) {
  const steps = setUp(container, options);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

const aborted = () => new DOMException("The kitchen's set-up was stopped", "AbortError");
/** settles once the browser has drawn its next frame: a task after it, so that frame is not held */
const afterFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

/**
 * The same kitchen, set up a part at a time with a frame of the page between two parts, its
 * shaders compiled in the background (`warm`, in setUp): the page's own animations keep running
 * while it boots. Set up at once, it held the page's main thread for 0.7 s (profiled 2026-11-13 on
 * a fast laptop): on the homepage, the 1-2-3 above it froze as the visitor scrolled into the
 * kitchen. Resolves with the kitchen once its first frame is drawn. If `signal` aborts first, the
 * set-up stops, frees what it made, and the promise rejects.
 */
export async function bootPancakeKitchen(container, options = {}, signal) {
  if (signal && signal.aborted) throw aborted();
  const steps = setUp(container, { ...options, warm: true });
  try {
    for (;;) {
      const step = steps.next();
      if (step.done) return step.value;
      // a part may hand over a promise to wait for (its shaders), then the next frame
      if (step.value && typeof step.value.then === "function") await step.value;
      await afterFrame();
      if (signal && signal.aborted) throw aborted();
    }
  } finally {
    // stopped half way: the set-up frees what it made (a finished one is left as it is)
    steps.return(undefined);
  }
}

/**
 * The set-up of a kitchen, a generator: each `yield` is a pause between two parts of it, where
 * bootPancakeKitchen lets the browser draw a frame. createPancakeKitchen runs it at once.
 */
function* setUp(container, options) {
  const opts = {
    time: 0,
    autoplay: true,
    interactive: true,
    maxPixelRatio: 2,
    azimuth: 14,
    elevation: 43,
    zoom: 1,
    pad: 1.04,
    shadows: "vsm",
    cast: "pancakes",
    mode: "with",
    badges: true,
    vendorLogos: true,
    reducedMotion: typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
    ...options,
  };
  // someone who asked for less motion gets a still of the kitchen at work, and can press play
  if (opts.reducedMotion && options.autoplay === undefined) {
    opts.autoplay = false;
    if (options.time === undefined) opts.time = POSTER_TIMES[opts.mode === "without" ? "without" : "with"];
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = opts.shadows !== "none";
  renderer.shadowMap.type = opts.shadows === "pcf" ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
  const canvas = renderer.domElement;
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;";
  canvas.setAttribute("role", "img");
  container.appendChild(canvas);

  // what the set-up has made so far: freed by `dispose`, or if the set-up stops half way
  const scene = new THREE.Scene();
  let envTarget = null;
  let show = null;
  let overlay = null;
  let standIns = [];
  let finished = false;
  function free() {
    if (show) show.dispose();
    if (overlay) overlay.dispose();
    for (const m of standIns) m.dispose();
    scene.traverse((o) => {
      if (o.isMesh && o.material && o.material.map) o.material.map.dispose();
    });
    disposeGeometries();
    disposeMaterials();
    if (envTarget) envTarget.dispose();
    renderer.dispose();
    canvas.remove();
  }
  try {
    // ── the first frame ──
    // With `opts.warm` (bootPancakeKitchen, the homepage), the shaders of each part compile in
    // the background as soon as it is built (KHR_parallel_shader_compile), and the scene draws
    // once they are all linked. Drawn at once, every program of the scene was compiled and linked
    // in one block on the page's main thread (0.35 s of the 0.7 s, profiled 2026-11-13). Without
    // it (the posters, the preview), the first frame is drawn at once.
    let warming = !!opts.warm;
    const compiling = [];
    if (warming) {
      // the shader logs three reads at a program's first use: a wait on the GPU process per
      // program (three's advice for production). The kitchen's shaders are three's own and the
      // studio's.
      renderer.debug.checkShaderErrors = false;
      // the scene's first frames are drawn in parts, hidden (below): the still shows meanwhile
      canvas.style.visibility = "hidden";
    }
    // ── camera: an orthographic three-quarter view, fitted to the outline of the kitchen ──
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 220);

    // the studio's own programs first, as it will draw them into a render target (offscreen)
    const studio = makeStudio();
    yield warming ? offscreen(renderer, () => compileInBackground(renderer, studio, camera, studio)) : "renderer";

    envTarget = blurStudio(renderer, studio);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.56;

    const key = new THREE.DirectionalLight("#fff0dc", 1.75);
    const centre = new THREE.Vector3(CENTRE[0], CENTRE[1], CENTRE[2]);
    key.position.set(centre.x - 8.5, 17, centre.z + 9.5);
    key.target.position.set(centre.x, 0, centre.z);
    key.castShadow = true;
    // a small picture (a phone) takes a quarter of the shadow map: the blur of a soft shadow is
    // most of a frame's work there. By the picture's width on the page, not by its pixels, so that
    // a phone's still (scripts/kitchen-posters.mjs, 390 wide) and its live scene cast one shadow.
    const small = (container.clientWidth || 1280) < 600;
    key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -15, right: 15, top: 11, bottom: -11, near: 2, far: 50 });
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.035;
    key.shadow.radius = 5;
    key.shadow.blurSamples = 14;
    scene.add(key, key.target);
    yield "environment";

    const compile = (part) => {
      if (warming) compiling.push(compileInBackground(renderer, part, camera, scene));
    };
    const world = yield* buildWorld(scene);
    compile(world.root);
    yield "compile: world";
    show = yield* createShow(world, scene, opts);
    compile(show.root);
    yield "compile: show";
    if (warming) standIns = warmShadows(renderer, scene, camera, compiling);
    yield "compile: shadows";

    // the badges are text of the page, laid over the canvas
    overlay = opts.badges ? createOverlay(container, THREE) : null;
    // what the picture shows, for someone who cannot see it
    const describe = () => canvas.setAttribute("aria-label", WORDS[show.mode].alt);
    describe();

    const target = opts.target ? new THREE.Vector3(...opts.target) : centre.clone();
    const dir = new THREE.Vector3();
    const corner = new THREE.Vector3();
    let width = 1;
    let height = 1;
    const look = { az: 0, el: 0, tAz: 0, tEl: 0 };

    function place(az, el) {
      dir.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
      camera.position.copy(target).addScaledVector(dir, 90);
      camera.lookAt(target);
      camera.updateMatrixWorld();
    }

    function fit() {
      place(opts.azimuth * DEG, opts.elevation * DEG);
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      // a window given in the camera's own units (a phone's, PHONE_VIEW) is the picture, margins
      // included: it takes the place of the outline of FRAME and of `pad`
      if (opts.view) [x0, x1, y0, y1] = opts.view;
      for (const box of opts.view ? [] : FRAME) {
        for (let i = 0; i < 8; i++) {
          corner
            .set(i & 1 ? box.max[0] : box.min[0], i & 2 ? box.max[1] : box.min[1], i & 4 ? box.max[2] : box.min[2])
            .applyMatrix4(camera.matrixWorldInverse);
          x0 = Math.min(x0, corner.x);
          x1 = Math.max(x1, corner.x);
          y0 = Math.min(y0, corner.y);
          y1 = Math.max(y1, corner.y);
        }
      }
      const aspect = width / height;
      const pad = opts.view ? 1 : opts.pad;
      const half = (Math.max((y1 - y0) / 2, (x1 - x0) / 2 / aspect) * pad) / opts.zoom;
      const cx = opts.target ? 0 : (x0 + x1) / 2;
      const cy = opts.target ? 0 : (y0 + y1) / 2;
      camera.left = cx - half * aspect;
      camera.right = cx + half * aspect;
      camera.top = cy + half;
      camera.bottom = cy - half;
      camera.updateProjectionMatrix();
    }

    function resize() {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      if (w === width && h === height) return;
      width = w;
      height = h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxPixelRatio));
      renderer.setSize(w, h, false);
      fit();
      if (!running && !warming) draw(0);
    }


    // ── time ──
    let time = opts.time;
    let speed = 1;
    let running = false;
    let raf = 0;
    let last = 0;
    let visible = true;
    // the loop's own pace, a window at a time (SLOW_FPS above)
    let windowStart = 0;
    let windowFrames = 0;
    let slowWindows = 0;
    let toldSlow = false;

    function draw(dt) {
      if (opts.interactive) {
        const k = 1 - Math.exp(-dt * 5);
        look.az += (look.tAz - look.az) * k;
        look.el += (look.tEl - look.el) * k;
      }
      const drift = opts.interactive ? Math.sin(time * 0.21) * 0.5 : 0;
      // a jolt of the picture when something gives way: last frame's, a frame late
      place((opts.azimuth + look.az + drift + show.jolt * 0.35) * DEG, (opts.elevation + look.el - show.jolt * 0.25) * DEG);
      show.update(time, dt, camera);
      renderer.render(scene, camera);
      if (overlay) overlay.draw(show.badges, camera, width, height);
    }

    function frame(now) {
      if (!running) return;
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      time += dt * speed;
      draw(dt);
      if (opts.onSlow && !toldSlow) {
        windowFrames++;
        const span = now - windowStart;
        if (span >= SLOW_WINDOW_MS) {
          slowWindows = (windowFrames * 1000) / span < SLOW_FPS ? slowWindows + 1 : 0;
          windowStart = now;
          windowFrames = 0;
          if (slowWindows >= SLOW_WINDOWS) {
            toldSlow = true;
            opts.onSlow();
            return;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      // (a window is time spent drawing: one cut by a pause is dropped)
      windowStart = last;
      windowFrames = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // (the drawing buffer, a part of its own: a large one takes a few tens of ms to allocate)
    resize();
    yield "size";

    // The first frame (`warm`), in parts on the hidden canvas once every program is linked: the
    // stations, then what moves. The first draw of a thing uploads its geometry and sets its
    // programs up (80 ms in one frame, profiled 2026-11-13); the frame then shown only draws.
    if (warming) {
      yield Promise.all(compiling);
      show.root.visible = false;
      renderer.render(scene, camera);
      show.root.visible = true;
      yield "first frame: the stations";
      world.root.visible = false;
      show.update(time, 0, camera);
      renderer.render(scene, camera);
      world.root.visible = true;
      yield "first frame: what moves";
      warming = false;
    }

    // ── the pointer tilts the view a little ──
    function onMove(e) {
      const r = container.getBoundingClientRect();
      const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      const ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
      look.tAz = -nx * 2.4;
      look.tEl = ny * 1.3;
      show.pointer(nx, ny);
    }
    function onLeave() {
      look.tAz = 0;
      look.tEl = 0;
      show.pointer(0, 0);
    }
    // a tap on a chef makes it jump
    function onDown(e) {
      const r = container.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = 1 - ((e.clientY - r.top) / r.height) * 2;
      const name = show.pick(x, y, camera, width / height);
      if (name) show.poke(name, time);
    }
    if (opts.interactive) {
      container.addEventListener("pointermove", onMove);
      container.addEventListener("pointerleave", onLeave);
      container.addEventListener("pointerdown", onDown);
    }

    // ── only run while on screen and in a visible tab ──
    let wanted = false;
    const io =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = entry.isIntersecting && !document.hidden;
              if (visible && wanted) start();
              else stop();
            },
            { rootMargin: "120px" },
          )
        : null;
    if (io) io.observe(container);
    function onVisibility() {
      visible = !document.hidden;
      if (visible && wanted) start();
      else stop();
    }
    document.addEventListener("visibilitychange", onVisibility);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(container);
    else window.addEventListener("resize", resize);

    draw(0);
    // (warm: the canvas was hidden over the still while its first frames were drawn in parts)
    canvas.style.visibility = "";
    if (opts.autoplay) {
      wanted = true;
      start();
    }

    const api = {
      canvas,
      get time() {
        return time;
      },
      start() {
        wanted = true;
        start();
      },
      stop() {
        wanted = false;
        stop();
      },
      /** jump to a moment of the loop and draw it */
      seek(t) {
        time = t;
        show.reset();
        draw(0);
      },
      setSpeed(s) {
        speed = s;
      },
      /** play the opening again */
      replay() {
        show.replay();
        if (!running) draw(0);
      },
      /** "with" or "without" Pancake; `instant` skips the change-over (the default when paused) */
      setMode(name, instant = !running) {
        show.setMode(name, time);
        describe();
        if (instant) show.reset();
        if (!running) draw(0);
      },
      get mode() {
        return show.mode;
      },
      /** "pancakes" or "people": who works in the kitchen; `instant` as for setMode */
      setCast(name, instant = !running) {
        show.setCast(name);
        if (instant) show.reset();
        if (!running) draw(0);
      },
      /** while paused: move the time on by `dt` seconds and draw, for a frame-by-frame capture */
      step(dt) {
        time += dt * speed;
        draw(dt);
      },
      get cast() {
        return show.cast;
      },
      draw() {
        draw(0);
      },
      get playing() {
        return wanted;
      },
      /** draw calls and triangles of the last frame, to keep an eye on the cost */
      stats() {
        return { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles };
      },
      dispose() {
        stop();
        wanted = false;
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        else window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerleave", onLeave);
        container.removeEventListener("pointerdown", onDown);
        free();
      },
    };
    finished = true;
    return api;
  } finally {
    if (!finished) free();
  }
}

export const PAGE_COLOR = C.page;
