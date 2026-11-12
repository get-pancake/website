// The Pancake kitchen: a small 3D diorama that runs by itself.
//
//   const kitchen = createPancakeKitchen(element);   // fills the element, starts playing
//   kitchen.stop(); kitchen.start(); kitchen.seek(12); kitchen.dispose();
//   kitchen.setMode("without");   // the same kitchen without Pancake, and "with" to come back
//   kitchen.setCast("people");    // little chefs in place of the pancake chefs, or "pancakes"
//
// The whole animation is a pure function of time (show.js), so `seek` can jump anywhere and a
// still frame is always a valid poster.

import * as THREE from "three";
import { C } from "./palette.js";
import { FRAME, CENTRE } from "./layout.js";
import { buildWorld } from "./world.js";
import { createShow } from "./show.js";
import { createOverlay } from "./overlay.js";
import { disposeGeometries } from "./geo.js";
import { disposeMaterials } from "./mats.js";
import { clamp } from "./util.js";

const DEG = Math.PI / 180;

const LABELS = {
  with: "A small kitchen that runs by itself: signals from your tools ride in as ingredients on three belts, three chefs mix, flip and plate, order tickets are ticked off, and stacks of pancakes leave on the last belt as new leads.",
  without:
    "The same kitchen without Pancake: a belt has given way, every ingredient waits in one slow tank, pancakes burn, the chefs run from one fire to the next, and the one plate that leaves is two weeks late.",
};

/** a moment of the loop that shows every station at work: used as the still frame */
export const POSTER_TIME = 31.52;

/** The light of the scene: a soft warm studio, built as a tiny scene and blurred. */
function makeEnvironment(renderer) {
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

export function createPancakeKitchen(container, options = {}) {
  const opts = {
    time: 0,
    autoplay: true,
    interactive: true,
    maxPixelRatio: 2,
    azimuth: 14,
    elevation: 43,
    zoom: 1,
    pad: 1.06,
    shadows: "vsm",
    cast: "pancakes",
    mode: "with",
    badges: true,
    reducedMotion: typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
    ...options,
  };
  // someone who asked for less motion gets a still of the kitchen at work, and can press play
  if (opts.reducedMotion && options.autoplay === undefined) {
    opts.autoplay = false;
    if (options.time === undefined) opts.time = POSTER_TIME;
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

  const scene = new THREE.Scene();
  const envTarget = makeEnvironment(renderer);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.56;

  const key = new THREE.DirectionalLight("#fff0dc", 1.75);
  const centre = new THREE.Vector3(CENTRE[0], CENTRE[1], CENTRE[2]);
  key.position.set(centre.x - 8.5, 17, centre.z + 9.5);
  key.target.position.set(centre.x, 0, centre.z);
  key.castShadow = true;
  const small = Math.min(container.clientWidth || 1280, 1280) * Math.min(window.devicePixelRatio || 1, opts.maxPixelRatio) < 900;
  key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -15, right: 15, top: 11, bottom: -11, near: 2, far: 50 });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 5;
  key.shadow.blurSamples = 14;
  scene.add(key, key.target);

  const world = buildWorld(scene);
  const show = createShow(world, scene, opts);
  // the badges are text of the page, laid over the canvas
  const overlay = opts.badges ? createOverlay(container, THREE) : null;
  // what the picture shows, for someone who cannot see it
  const describe = () => canvas.setAttribute("aria-label", options.label || LABELS[show.mode]);
  describe();

  // ── camera: an orthographic three-quarter view, fitted to the outline of the kitchen ──
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 220);
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
    for (const box of FRAME) {
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
    const half = (Math.max((y1 - y0) / 2, (x1 - x0) / 2 / aspect) * opts.pad) / opts.zoom;
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
    if (!running) draw(0);
  }

  // ── time ──
  let time = opts.time;
  let speed = 1;
  let running = false;
  let raf = 0;
  let last = 0;
  let visible = true;

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
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
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

  resize();
  draw(0);
  if (opts.autoplay) {
    wanted = true;
    start();
  }

  return {
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
      show.dispose();
      if (overlay) overlay.dispose();
      scene.traverse((o) => {
        if (o.isMesh && o.material && o.material.map) o.material.map.dispose();
      });
      disposeGeometries();
      disposeMaterials();
      envTarget.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}

export const PAGE_COLOR = C.page;
