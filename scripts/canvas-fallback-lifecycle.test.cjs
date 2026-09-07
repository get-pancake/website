// Runs the real component effect with controlled browser primitives. This
// verifies lifecycle/scheduling, not visual rendering; Lighthouse covers that.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require(path.join(process.cwd(), 'node_modules/typescript'));
const source = fs.readFileSync('components/sections/landing-v3/LpArcCanvas.tsx', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;

function mount(drawCost) {
  let now = 100, serial = 0, draws = 0;
  const effects = [], mutations = [], intersections = [], resizes = [], offscreens = [];
  const rafs = new Map(), timers = new Map(), documentListeners = new Map();
  const media = new Map();
  const matchMedia = query => {
    if (!media.has(query)) media.set(query, { matches: !query.includes('reduced'), listeners: new Map(), addEventListener(name, fn) { this.listeners.set(fn, name); }, removeEventListener(name, fn) { this.listeners.delete(fn); } });
    return media.get(query);
  };
  const attrs = new Map([['data-lp-gl-off', '']]);
  const audience = {};
  const pose = { offsetLeft: 0, offsetTop: 0, offsetWidth: 200, offsetHeight: 200 };
  const spin = { classList: { contains: () => false } };
  const pathEl = { getAttribute: () => 'M0 0L100 0L100 100Z' };
  const svg = { classList: { contains: () => false }, viewBox: { baseVal: { width: 100, height: 100 } }, querySelector: () => pathEl };
  const arc = { offsetLeft: 0, offsetTop: 0, querySelector: selector => selector === 'svg' ? svg : selector.includes('pose') ? pose : spin };
  const box = { offsetLeft: 0, offsetTop: 0, querySelectorAll: () => Array(6).fill(arc) };
  const art = {
    clientWidth: 400, clientHeight: 600,
    style: { getPropertyValue: () => '1' },
    hasAttribute: name => attrs.has(name), setAttribute: (name, value) => attrs.set(name, value), removeAttribute: name => attrs.delete(name),
    querySelector: selector => selector.includes('canvas') ? {} : box,
    closest: () => audience,
  };
  const ctx = { setTransform() {}, clearRect() {}, drawImage() { now += drawCost; draws++; } };
  const canvas = { width: 0, height: 0, getContext: () => ctx, closest: () => art };
  class Matrix {
    constructor() { this.a = this.d = 1; this.b = this.c = this.e = this.f = 0; }
    scale() { return this; } multiply() { return this; } translate() { return this; } rotate() { return this; }
  }
  const observer = list => class { constructor(fn) { list.push(fn); } observe() {} disconnect() {} };
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return { useRef: current => ({ current }), useState: initial => [initial, () => {}], useEffect: fn => effects.push(fn) };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
      throw new Error('Unexpected dependency: ' + name);
    },
    performance: { now: () => now }, matchMedia,
    getComputedStyle: () => ({ transform: 'matrix(1,0,0,1,0,0)', fill: 'rgb(1,2,3)', width: '200px', height: '200px' }),
    DOMMatrix: Matrix, Path2D: class {},
    requestAnimationFrame(fn) { const id = ++serial; rafs.set(id, fn); return id; },
    cancelAnimationFrame: id => rafs.delete(id),
    clearTimeout: id => timers.delete(id),
    MutationObserver: observer(mutations), IntersectionObserver: observer(intersections), ResizeObserver: observer(resizes),
    document: {
      hidden: false,
      createElement() { const bitmap = { width: 0, height: 0, getContext: () => ({ setTransform() {}, fill() {} }) }; offscreens.push(bitmap); return bitmap; },
      addEventListener: (name, fn) => documentListeners.set(name, fn), removeEventListener: name => documentListeners.delete(name),
    },
    window: { devicePixelRatio: 2, setTimeout(fn) { const id = ++serial; timers.set(id, fn); return id; } },
  };
  vm.runInNewContext(js, context);
  const result = context.exports.LpArcCanvas();
  result.props.ref.current = canvas;
  const cleanups = effects.map(fn => fn());
  return {
    canvas, attrs, offscreens, rafs, effects, cleanups,
    get draws() { return draws; },
    tick() {
      now += 1000 / 60;
      const callbacks = [...rafs.values()]; rafs.clear();
      callbacks.forEach(fn => fn());
    },
    idle(ms) { now += ms; },
    stage(onStage) { intersections.forEach(fn => fn([{ isIntersecting: onStage }])); },
    notifyAll() {
      mutations.forEach(fn => fn([])); resizes.forEach(fn => fn([]));
      intersections.forEach(fn => fn([{ isIntersecting: true }]));
      documentListeners.forEach(fn => fn());
      media.forEach(value => value.listeners.forEach((name, fn) => fn()));
    },
  };
}

const expensive = mount(10); // six blits = 60ms of synchronous work per draw
for (let i = 0; i < 3; i++) expensive.tick();
assert.equal(expensive.draws, 18);
assert.equal(expensive.rafs.size, 0, 'expensive fallback stops after three draws');
assert.equal(expensive.attrs.has('data-lp-arc-canvas'), false, 'static SVG becomes visible');
assert.equal(expensive.canvas.width, 0, 'visible backing buffer released');
assert.ok(expensive.offscreens.every(bitmap => bitmap.width === 0 && bitmap.height === 0), 'all bitmap backing buffers released');
expensive.notifyAll();
assert.equal(expensive.rafs.size, 0, 'palette/resize/GL/stage/media/visibility notifications cannot restart it');
expensive.cleanups.forEach(fn => fn?.());
expensive.effects[1]();
assert.equal(expensive.rafs.size, 0, 'breakpoint effect restart retains the measured stop');

const severe = mount(40); // six blits = 240ms, sufficient evidence from one draw
severe.tick();
assert.equal(severe.draws, 6, 'one severe draw is not repeated');
assert.equal(severe.rafs.size, 0, 'severe fallback stops after its first draw');
assert.equal(severe.attrs.has('data-lp-arc-canvas'), false, 'severe draw keeps the static SVG visible');
assert.equal(severe.canvas.width, 0, 'severe draw releases the visible backing buffer');
assert.ok(severe.offscreens.every(bitmap => bitmap.width === 0 && bitmap.height === 0), 'severe draw releases all bitmaps');
severe.notifyAll();
assert.equal(severe.rafs.size, 0, 'observers cannot restart after a severe draw');
severe.cleanups.forEach(fn => fn?.());

const healthy = mount(0.5);
for (let i = 0; i < 60; i++) healthy.tick();
assert.ok(healthy.draws > 6 && healthy.attrs.has('data-lp-arc-canvas'), 'cheap fallback keeps animating');
healthy.stage(false);
assert.equal(healthy.rafs.size, 0, 'off-stage pauses scheduling');
assert.ok(healthy.offscreens.every(bitmap => bitmap.width === 0), 'off-stage releases bitmap allocations');
healthy.idle(60000);
healthy.stage(true);
for (let i = 0; i < 10; i++) healthy.tick();
assert.equal(healthy.rafs.size, 1, 'returning from a long pause resumes one healthy loop');
assert.ok(healthy.attrs.has('data-lp-arc-canvas'));
healthy.cleanups.forEach(fn => fn?.());
assert.equal(healthy.rafs.size, 0);
assert.equal(healthy.canvas.width, 0, 'unmount releases visible backing buffer');
assert.ok(healthy.offscreens.every(bitmap => bitmap.width === 0), 'unmount releases every bitmap allocation');
console.log('PASS: real effect degrades repeated expensive or one severe draw, restores SVG, frees buffers, rejects observer restarts, survives breakpoint restart, and resumes healthy animation after long idle.');
