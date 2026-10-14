// Runs the real LpRainbowGL effect with controlled browser primitives and a
// recording WebGL context. It verifies WHEN the renderer talks to the GPU
// (2026-10-13): ahead of need, never inside an observer callback and never a
// link read before the driver is done; with the art already here, at once as
// before. It does not verify what is drawn: the screenshot gates do.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require(path.join(process.cwd(), 'node_modules/typescript'));
const source = fs.readFileSync('components/sections/landing-v3/LpRainbowGL.tsx', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;

const COMPLETION = 0x91b1;

/** One page: any number of arts sharing the module (its page-wide state). */
function page({ phone = false, reduced = false, parallel = true, idle = true, pollsBeforeDone = 2 } = {}) {
  let now = 100, serial = 0, phase = 'mount';
  const effects = [], observers = [], rafs = new Map(), idles = new Map(), timers = new Map();
  const media = (query) => ({
    matches: query.includes('reduced') ? reduced : query.includes('max-width') ? phone : false,
    addEventListener() {}, removeEventListener() {},
  });
  class Matrix {
    constructor() { this.a = this.d = 1; this.b = this.c = this.e = this.f = 0; }
    multiply() { return new Matrix(); } scale() { return new Matrix(); } translate() { return new Matrix(); }
    rotate() { return new Matrix(); } inverse() { return new Matrix(); } transformPoint(p) { return { x: p.x, y: p.y }; }
  }
  const windowLike = {
    devicePixelRatio: 2,
    setTimeout(fn) { const id = ++serial; timers.set(id, fn); return id; },
    clearTimeout: (id) => timers.delete(id),
  };
  if (idle) {
    windowLike.requestIdleCallback = (fn) => { const id = ++serial; idles.set(id, fn); return id; };
    windowLike.cancelIdleCallback = (id) => idles.delete(id);
  }
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return { useRef: (current) => ({ current }), useEffect: (fn) => effects.push(fn) };
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
      throw new Error('Unexpected dependency: ' + name);
    },
    performance: { now: () => now }, matchMedia: media, window: windowLike,
    clearTimeout: (id) => timers.delete(id),
    getComputedStyle: () => ({ transform: 'matrix(1, 0, 0, 1, 0, 0)', fill: 'rgb(1, 2, 3)', width: '200px', height: '200px', animationDelay: '0s', getPropertyValue: () => '' }),
    DOMMatrix: Matrix, DOMPoint: class { constructor(x, y) { this.x = x; this.y = y; } }, HTMLElement: class {},
    URLSearchParams, location: { search: '' }, CSS: { supports: () => false },
    sessionStorage: { getItem: () => null, setItem() {} },
    WebGL2RenderingContext: { TRIANGLE_STRIP: 5, TRIANGLES: 4 },
    requestAnimationFrame(fn) { const id = ++serial; rafs.set(id, fn); return id; },
    cancelAnimationFrame: (id) => rafs.delete(id),
    IntersectionObserver: class { constructor(fn, options) { this.fn = fn; this.margin = options.rootMargin; observers.push(this); } observe(target) { this.target = target; } unobserve() {} disconnect() {} },
    ResizeObserver: class { observe() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    document: { hidden: false, addEventListener() {}, removeEventListener() {}, createElement: () => ({}) },
  };
  vm.runInNewContext(js, context);

  function art(variant) {
    const calls = []; // [phase, method, detail]
    const attrs = new Map();
    let polls = pollsBeforeDone;
    const state = { lost: false };
    const base = {
      getExtension(name) { calls.push([phase, 'getExtension', name]); return name === 'KHR_parallel_shader_compile' ? (parallel ? { COMPLETION_STATUS_KHR: COMPLETION } : null) : { UNMASKED_RENDERER_WEBGL: 'UNMASKED' }; },
      getParameter(name) { calls.push([phase, 'getParameter', name]); return 'Apple M4'; },
      isContextLost: () => state.lost,
      getProgramParameter(_program, name) {
        if (name === COMPLETION) { calls.push([phase, 'COMPLETION_STATUS']); return polls-- <= 0; }
        calls.push([phase, 'LINK_STATUS']);
        return true;
      },
      createShader: () => ({}), createProgram: () => ({}), createVertexArray: () => ({}), createBuffer: () => ({}), getUniformLocation: () => ({}),
    };
    const gl = new Proxy(base, {
      get(target, key) {
        if (key in target) return target[key];
        if (typeof key !== 'string') return undefined;
        if (key === key.toUpperCase()) return key; // a constant: its own name
        return (...args) => { calls.push([phase, key, args[0]]); };
      },
    });
    const pathEl = { getAttribute: (name) => (name === 'd' ? 'M0 0L100 0L100 100Z' : null) };
    const svg = { classList: { contains: () => false }, viewBox: { baseVal: { width: 100, height: 100 } }, querySelector: () => pathEl };
    const pose = { offsetLeft: 0, offsetTop: 0, offsetWidth: 200, offsetHeight: 200 };
    const spin = { classList: { contains: () => false } };
    const arc = { offsetLeft: 0, offsetTop: 0, querySelector: (selector) => (selector === 'svg' ? svg : selector.includes('pose') ? pose : spin) };
    const box = { offsetLeft: 0, offsetTop: 0, offsetWidth: 800, offsetHeight: 500, querySelectorAll: () => Array(6).fill(arc) };
    const artEl = {
      offsetWidth: 800, offsetHeight: 500, offsetParent: null,
      style: { getPropertyValue: () => '1' },
      hasAttribute: (name) => attrs.has(name), setAttribute: (name, value) => attrs.set(name, value), removeAttribute: (name) => attrs.delete(name),
      querySelector: () => ({ querySelector: () => box }), closest: () => null,
    };
    const canvas = {
      width: 300, height: 150, clientWidth: 800, clientHeight: 500, style: {}, className: '', parentElement: artEl,
      getContext() { calls.push([phase, 'getContext']); return gl; },
      addEventListener() {}, removeEventListener() {},
    };
    const before = effects.length, seen = observers.length;
    const element = context.exports.LpRainbowGL({ variant });
    element.props.ref.current = canvas;
    const cleanups = effects.slice(before).map((fn) => fn());
    const [warmIo, io] = observers.slice(seen); // created in this order by the effect
    const deliver = (observer, on) => { const was = phase; phase = 'observer'; observer.fn([{ isIntersecting: on }]); phase = was; };
    return {
      calls, attrs, canvas, state, margins: [warmIo.margin, io.margin],
      warm: (on) => deliver(warmIo, on),
      near: (on) => deliver(io, on),
      /** the first delivery after mount of an art that is on screen: both observers, one task */
      arrive() { const was = phase; phase = 'observer'; warmIo.fn([{ isIntersecting: true }]); io.fn([{ isIntersecting: true }]); phase = was; },
      count: (method, during) => calls.filter(([p, m]) => m === method && (!during || p === during)).length,
      unmount: () => cleanups.forEach((fn) => fn && fn()),
    };
  }
  return {
    art,
    idles, rafs,
    /** idle time comes (or, without requestIdleCallback, the timer task does) */
    idle() { phase = 'idle'; const jobs = [...(idle ? idles : timers).values()]; (idle ? idles : timers).clear(); jobs.forEach((fn) => fn()); phase = 'between'; },
    /** one display frame: every callback gets the same timestamp */
    frame() { now += 1000 / 60; phase = 'frame'; const jobs = [...rafs.values()]; rafs.clear(); jobs.forEach((fn) => fn(now)); phase = 'between'; },
  };
}
const GPU_WAITS = ['getContext', 'getExtension', 'getParameter', 'LINK_STATUS', 'COMPLETION_STATUS'];
const waitsDuring = (a, during) => GPU_WAITS.reduce((sum, method) => sum + a.count(method, during), 0);

// ── desktop, ahead of need: idle time, a polled link, then one frame ahead ──
{
  const p = page();
  const a = p.art('pricing');
  assert.deepEqual(a.margins, ['100% 0%', '25% 0%'], 'warm margin, then the desktop loop margin');
  assert.equal(a.calls.length, 0, 'mounting creates no context');
  a.warm(true);
  assert.equal(a.calls.length, 0, 'the observer callback does not touch the GPU');
  p.idle();
  assert.equal(a.count('getContext', 'idle'), 1, 'the context is opened in idle time');
  assert.equal(a.calls.filter(([, m, d]) => m === 'getExtension' && d === 'KHR_parallel_shader_compile').length, 1, 'parallel link asked for');
  assert.ok(a.count('linkProgram') === 1 && a.count('flush') === 1, 'linked and sent');
  assert.equal(a.count('LINK_STATUS'), 0, 'the link is not read back when it is sent');
  p.frame(); p.frame();
  assert.equal(a.count('COMPLETION_STATUS'), 2, 'polled once a frame');
  assert.equal(a.count('LINK_STATUS'), 0, 'never read before the driver is done');
  assert.equal(a.count('drawArrays'), 0);
  p.frame();
  assert.equal(a.count('LINK_STATUS'), 1, 'read once the driver says done');
  p.frame();
  assert.ok(a.count('drawArrays') > 0 && a.attrs.has('data-lp-gl'), 'one frame drawn ahead: the canvas is the render');
  assert.equal(a.canvas.width, 1600, 'buffer at the art size × pixel ratio');
  const drawn = a.count('drawArrays');
  p.frame(); p.frame();
  assert.equal(a.count('drawArrays'), drawn, 'a single frame ahead, no loop');
  a.near(true);
  assert.equal(waitsDuring(a, 'observer'), 0, 'coming near waits for nothing');
  p.frame();
  assert.ok(a.count('drawArrays') > drawn, 'the loop runs from its own margin');
  assert.equal(a.count('getContext'), 1);
  a.unmount();
  assert.equal(p.rafs.size, 0, 'unmount leaves no frame behind');
}

// ── the art is already here (the hero at load, a page opened on it): as before ──
{
  const p = page();
  const a = p.art('hero');
  a.arrive();
  assert.equal(a.count('getContext', 'observer'), 1, 'opened at once');
  assert.equal(a.count('LINK_STATUS', 'observer'), 1, 'link waited for at once');
  assert.equal(a.calls.some(([, m, d]) => m === 'getExtension' && d === 'KHR_parallel_shader_compile'), false, 'no parallel link to wait on');
  p.idle();
  assert.equal(a.count('getContext'), 1, 'the idle opening was cancelled');
  p.frame();
  assert.ok(a.count('drawArrays') > 0 && a.attrs.has('data-lp-gl'), 'first frame on the next display frame');
  a.unmount();
}

// ── the art arrives while its link is under way: the wait it always had ──
{
  const p = page({ pollsBeforeDone: 50 });
  const a = p.art('pricing');
  a.warm(true); p.idle(); p.frame();
  assert.equal(a.count('LINK_STATUS'), 0);
  a.near(true);
  assert.equal(a.count('LINK_STATUS', 'observer'), 1, 'link read (blocking) as the art arrives');
  assert.equal(a.count('getContext'), 1, 'the context opened ahead is the one used');
  const polls = a.count('COMPLETION_STATUS');
  p.frame();
  assert.equal(a.count('COMPLETION_STATUS'), polls, 'polling stopped');
  assert.ok(a.count('drawArrays') > 0, 'and the loop draws');
  a.unmount();
}

// ── gone again before idle time came: nothing is opened ──
{
  const p = page();
  const a = p.art('pricing');
  a.warm(true); a.warm(false); p.idle(); p.frame();
  assert.equal(a.calls.length, 0, 'no context for an art that left');
  a.unmount();
}

// ── phones: the context ahead, the buffer and the loop at their own margin ──
{
  const p = page({ phone: true, pollsBeforeDone: 0 });
  const a = p.art('pricing');
  assert.deepEqual(a.margins, ['100% 0%', '75% 0%']);
  a.warm(true); p.idle(); p.frame(); p.frame(); p.frame();
  assert.ok(a.count('getContext', 'idle') === 1 && a.count('LINK_STATUS') === 1, 'context ready ahead');
  assert.equal(a.count('drawArrays'), 0, 'no frame ahead on phones');
  assert.equal(a.canvas.width, 300, 'no buffer before the loop margin');
  a.near(true);
  assert.equal(waitsDuring(a, 'observer'), 0, 'the 75 % callback waits for nothing');
  p.frame();
  assert.ok(a.count('drawArrays') > 0 && a.canvas.width === 1600);
  a.unmount();
}

// ── two arts ready in the same frame: one build ahead per display frame ──
{
  const p = page({ pollsBeforeDone: 0 });
  const a = p.art('hero'), b = p.art('pricing');
  a.warm(true); b.warm(true); p.idle(); p.frame();
  assert.ok(a.count('LINK_STATUS') === 1 && b.count('LINK_STATUS') === 1, 'both linked in the same frame');
  p.frame();
  assert.equal([a, b].filter((x) => x.count('drawArrays') > 0).length, 1, 'one of them builds and draws');
  p.frame();
  assert.ok(a.count('drawArrays') > 0 && b.count('drawArrays') > 0, 'the other on the next frame');
  a.unmount(); b.unmount();
}

// ── an engine without the parallel link: the wait is paid in idle time ──
{
  const p = page({ parallel: false });
  const a = p.art('pricing');
  a.warm(true); p.idle();
  assert.equal(a.count('LINK_STATUS', 'idle'), 1, 'link read in the idle task');
  assert.equal(a.count('COMPLETION_STATUS'), 0);
  p.frame();
  assert.ok(a.count('drawArrays') > 0 && a.attrs.has('data-lp-gl'));
  a.unmount();
}

// ── no requestIdleCallback (Safari): a timer task of its own, same contract ──
{
  const p = page({ idle: false, pollsBeforeDone: 0 });
  const a = p.art('pricing');
  a.warm(true);
  assert.equal(a.calls.length, 0);
  p.idle();
  assert.equal(a.count('getContext', 'idle'), 1);
  p.frame(); p.frame();
  assert.ok(a.count('drawArrays') > 0);
  a.unmount();
}

// ── reduced motion: no context at all, the artboard shows ──
{
  const p = page({ reduced: true });
  const a = p.art('pricing');
  a.arrive(); p.idle(); p.frame();
  assert.equal(a.count('getContext'), 0);
  assert.ok(a.attrs.has('data-lp-gl-off'));
  a.unmount();
}

// ── a context lost before its link was read is left to the loss handler ──
{
  const p = page({ pollsBeforeDone: 0 });
  const a = p.art('pricing'), other = p.art('hero');
  other.arrive(); p.frame();
  a.warm(true); p.idle();
  a.state.lost = true;
  p.frame(); a.near(true); p.frame();
  assert.equal(a.count('LINK_STATUS'), 0, 'nothing is read from a lost context');
  assert.equal(other.attrs.has('data-lp-gl-off'), false, 'and the other arts are not switched off for it');
  a.unmount(); other.unmount();
}

console.log('PASS: ahead of need the context opens in idle time, the link is polled and read only when done, one build per frame; an art already here opens at once; phones, Safari, engines without the parallel link, reduced motion and a lost context covered.');
