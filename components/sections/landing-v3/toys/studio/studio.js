// The toy studio: draws the small 3D sets of the landing page's seven pictures as flat layers.
//
// The pictures of the 1-2-3 and of "What your agent can do with Pancake" are made of soft toy
// objects, in the look of the kitchen (../../kitchen: the same shapes, finishes, palette and
// light). They are not live 3D: each object is drawn once, here, on a transparent ground, and the
// page moves the drawings (LpToySteps.tsx, LpToyStories.tsx). With a camera that has no
// perspective, sliding an object in space is exactly sliding its drawing on the screen.
//
// A scene (scene-*.js) builds its objects once, then names what to draw:
//   layer(name, objects)   those objects alone, with the shadow they cast on the ground
//   cut(name, objects)     the part of a layer where those objects are in front: laid over a
//                          moving drawing, it hides the part that passes behind them
//   anchor(name, point)    a point of the set, to stand a badge at or to move a drawing to
//   path(name, points)     a line of the set (a cable, a track), as points of the screen
//   line(name, points)     the same, from points given one by one
// scripts/toy-art.mjs opens this page, asks for every scene and writes the pictures
// (public/lp/toys) and where each one goes (lp-toy-art.ts).

import * as THREE from "three";
import { floorPlane } from "../../kitchen/geo.js";
import { SCENES } from "./scenes.js";

const DEG = Math.PI / 180;
/** the scene is drawn this many times larger than it is saved, then scaled down: clean edges */
const SUPER = 2;

/** The light of the kitchen (kitchen.js makeEnvironment, copied): a soft warm studio. */
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
  softbox("#fff3e2", 6.5, [-24, 30, 20], 26, 26);
  softbox("#ffdfea", 2.4, [28, 12, -16], 22, 14);
  softbox("#ffffff", 1.5, [12, 26, 28], 18, 12);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  return target;
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
const environment = makeEnvironment(renderer);

const r2 = (n) => Math.round(n * 100) / 100;

/** Builds one scene and returns what scripts/toy-art.mjs writes. `scale`: device px per stage px. */
async function draw(id, scale = 2, tryCamera = {}) {
  const def = SCENES[id];
  if (!def) throw new Error(`no scene named ${id}`);
  const [W, H] = def.size;
  // seen from the front and from above: a row of the set is a level row of the picture
  const cam = { azimuth: 0, elevation: 46, look: [0, 0, 0], span: 12, ...def.camera, ...tryCamera };
  renderer.setPixelRatio(1);
  renderer.setSize(W * scale * SUPER, H * scale * SUPER, false);

  const scene = new THREE.Scene();
  scene.environment = environment.texture;
  scene.environmentIntensity = def.envIntensity ?? 0.56;

  // the camera: no perspective, `span` units of the set across the stage's width
  const halfW = cam.span / 2;
  const halfH = (cam.span * H) / W / 2;
  const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 200);
  const look = new THREE.Vector3(...cam.look);
  const az = cam.azimuth * DEG;
  const el = cam.elevation * DEG;
  camera.position.set(look.x + Math.sin(az) * Math.cos(el) * 60, look.y + Math.sin(el) * 60, look.z + Math.cos(az) * Math.cos(el) * 60);
  camera.lookAt(look);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  // the kitchen's key light, from the upper left, in front
  const reach = def.reach ?? cam.span * 0.8;
  const key = new THREE.DirectionalLight("#fff0dc", def.keyIntensity ?? 1.75);
  // (it turns with the camera, so that every set is lit as the kitchen is seen: az 14)
  const turn = az - 14 * DEG;
  key.position.set(look.x - 8.5 * Math.cos(turn) + 9.5 * Math.sin(turn), 17, look.z + 8.5 * Math.sin(turn) + 9.5 * Math.cos(turn));
  key.target.position.set(look.x, 0, look.z);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, near: 2, far: 60 });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = def.shadowRadius ?? 9;
  key.shadow.blurSamples = 24;
  scene.add(key, key.target);

  // the ground: nothing but the shadows that fall on it
  const ground = new THREE.Mesh(floorPlane(120, 120), new THREE.ShadowMaterial({ color: "#3a0a36", opacity: def.shadow ?? 0.2 }));
  ground.receiveShadow = true;
  scene.add(ground);

  const layers = [];
  const cuts = [];
  const anchors = {};
  const paths = {};
  const everything = new Set();
  const flat = (list) => list.flat(Infinity).filter(Boolean);
  const project = (p) => {
    const v = new THREE.Vector3(p[0], p[1], p[2]).project(camera);
    return [r2(((v.x + 1) / 2) * W), r2(((1 - v.y) / 2) * H)];
  };
  const api = {
    THREE,
    /** adds objects to the set (they are drawn only in the layers that name them) */
    add(...objects) {
      for (const o of flat(objects)) {
        scene.add(o);
        everything.add(o);
      }
      return objects.length === 1 ? objects[0] : objects;
    },
    /** `floor`: the height of the ground the shadows fall on. `shadow: false`: no ground. */
    layer(name, objects, options = {}) {
      layers.push({ name, objects: flat([objects]), floor: options.floor ?? 0, shadow: options.shadow !== false });
    },
    cut(name, objects, options = {}) {
      cuts.push({ name, objects: flat([objects]), of: options.of ?? "plate" });
    },
    anchor(name, point) {
      anchors[name] = project(point);
    },
    path(name, points, samples = 24) {
      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, "catmullrom", 0.5);
      paths[name] = curve.getSpacedPoints(samples).map((v) => project([v.x, v.y, v.z]));
    },
    /** a line given point by point (already as fine as it should be) */
    line(name, points) {
      paths[name] = points.map((p) => project(p));
    },
    project,
  };
  def.build(api);
  for (const o of everything) o.updateMatrixWorld(true);

  const show = (objects) => {
    for (const o of everything) o.visible = false;
    for (const o of objects) o.visible = true;
  };
  /** what the renderer drew, scaled down to the saved size, as a 2D canvas */
  const grab = () => {
    const cv = document.createElement("canvas");
    cv.width = W * scale;
    cv.height = H * scale;
    const g = cv.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(renderer.domElement, 0, 0, cv.width, cv.height);
    return cv;
  };
  /** the box of what is drawn (alpha over a faint tail), in saved px, or null when empty */
  const bounds = (cv) => {
    const { width, height } = cv;
    const data = cv.getContext("2d").getImageData(0, 0, width, height).data;
    let x0 = width;
    let y0 = height;
    let x1 = -1;
    let y1 = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 3) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;
    // whole stage px, with a pixel of margin
    const s = scale;
    const bx0 = Math.max(0, Math.floor(x0 / s) - 1) * s;
    const by0 = Math.max(0, Math.floor(y0 / s) - 1) * s;
    const bx1 = Math.min(width, (Math.ceil((x1 + 1) / s) + 1) * s);
    const by1 = Math.min(height, (Math.ceil((y1 + 1) / s) + 1) * s);
    return { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 };
  };
  const crop = (cv, box) => {
    const out = document.createElement("canvas");
    out.width = box.w;
    out.height = box.h;
    out.getContext("2d").drawImage(cv, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
    return out;
  };
  const quality = def.quality ?? 0.88;
  const pack = (name, cv) => {
    const box = bounds(cv);
    if (!box) throw new Error(`${id}: the layer "${name}" is empty`);
    return {
      name,
      x: box.x / scale,
      y: box.y / scale,
      w: box.w / scale,
      h: box.h / scale,
      data: crop(cv, box).toDataURL("image/webp", quality).split(",")[1],
    };
  };

  const out = [];
  const drawn = new Map();
  layers.sort((a, b) => Number(b.name === "plate") - Number(a.name === "plate"));
  for (const layer of layers) {
    show(layer.objects);
    ground.visible = layer.shadow;
    ground.position.y = layer.floor;
    renderer.render(scene, camera);
    const cv = grab();
    drawn.set(layer.name, { cv, objects: layer.objects });
    out.push(pack(layer.name, cv));
  }

  // cuts: the layer's own pixels, kept only where the named objects are in front
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const hold = new THREE.MeshBasicMaterial({ colorWrite: false });
  for (const cut of cuts) {
    const from = drawn.get(cut.of);
    if (!from) throw new Error(`${id}: the cut "${cut.name}" names no layer`);
    show(from.objects);
    ground.visible = false;
    const keep = new Set();
    for (const o of cut.objects) o.traverse((m) => keep.add(m));
    const swapped = [];
    for (const o of from.objects) {
      o.traverse((m) => {
        if (!m.isMesh) return;
        swapped.push([m, m.material]);
        m.material = keep.has(m) ? white : hold;
      });
    }
    renderer.shadowMap.enabled = false;
    renderer.render(scene, camera);
    renderer.shadowMap.enabled = true;
    for (const [m, material] of swapped) m.material = material;
    const mask = grab();
    const cv = document.createElement("canvas");
    cv.width = mask.width;
    cv.height = mask.height;
    const g = cv.getContext("2d");
    g.drawImage(from.cv, 0, 0);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(mask, 0, 0);
    out.push(pack(cut.name, cv));
  }

  // where the ground is on the screen: a CSS matrix for what lies flat on it, at height 0
  const o = project([0, 0, 0]);
  const x = project([1, 0, 0]);
  const z = project([0, 0, 1]);
  const y = project([0, 1, 0]);
  const result = {
    id,
    size: [W, H],
    px: r2(W / cam.span),
    ground: [r2(x[0] - o[0]), r2(x[1] - o[1]), r2(z[0] - o[0]), r2(z[1] - o[1]), o[0], o[1]],
    up: [r2(y[0] - o[0]), r2(y[1] - o[1])],
    layers: out,
    anchors,
    paths,
  };

  return result;
}

window.__studio = { scenes: Object.keys(SCENES), draw };
document.documentElement.dataset.ready = "1";
