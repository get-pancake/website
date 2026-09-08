// Exercise the real viewport effect against mobile browser resize sequences.
// Browser QA separately checks document geometry and the sticky header.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require(path.join(process.cwd(), 'node_modules/typescript'));

const source = fs.readFileSync('components/sections/landing-v3/LpViewportVar.tsx', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;

function mount({ width, height, coarse = false }) {
  let now = 0;
  let serial = 0;
  const effects = [];
  const timers = new Map();
  const rafs = new Map();
  const listeners = new Map();
  const properties = new Map();
  const writes = [];
  const style = {
    getPropertyValue: name => properties.get(name) || '',
    setProperty(name, value) { properties.set(name, value); writes.push({ name, value }); },
    removeProperty: name => properties.delete(name),
  };
  const addEventListener = (name, fn) => {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(fn);
  };
  const removeEventListener = (name, fn) => {
    listeners.get(name)?.delete(fn);
    if (listeners.get(name)?.size === 0) listeners.delete(name);
  };
  const matchMedia = query => ({
    get matches() {
      return query.split(',').some(part => {
        const maxWidth = part.match(/max-width:\s*(\d+)px/);
        const minWidth = part.match(/min-width:\s*(\d+)px/);
        const pointer = part.match(/\(pointer:\s*(coarse|fine)\)/);
        if (!maxWidth && !minWidth && !pointer) throw new Error('Unexpected media query: ' + query);
        return (!maxWidth || width <= Number(maxWidth[1])) &&
          (!minWidth || width >= Number(minWidth[1])) &&
          (!pointer || coarse === (pointer[1] === 'coarse'));
      });
    },
    addEventListener() {},
    removeEventListener() {},
  });
  const setTimeout = (fn, delay = 0) => {
    const id = ++serial;
    timers.set(id, { fn, at: now + delay });
    return id;
  };
  const clearTimeout = id => timers.delete(id);
  const root = { style, get clientWidth() { return width; } };
  const window = {
    get innerWidth() { return width; },
    get innerHeight() { return height; },
    scrollY: 1600,
    matchMedia,
    addEventListener,
    removeEventListener,
    setTimeout,
    clearTimeout,
  };
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return { useEffect: fn => effects.push(fn) };
      throw new Error('Unexpected dependency: ' + name);
    },
    window,
    document: { documentElement: root, querySelector: () => null },
    matchMedia,
    setTimeout,
    clearTimeout,
    requestAnimationFrame(fn) { const id = ++serial; rafs.set(id, fn); return id; },
    cancelAnimationFrame: id => rafs.delete(id),
  };
  vm.runInNewContext(js, context);
  context.exports.LpViewportVar();
  const cleanups = effects.map(effect => effect());

  function dispatch(name) {
    [...(listeners.get(name) || [])].forEach(fn => fn({ type: name }));
  }
  return {
    properties, writes, timers, listeners,
    value: () => properties.get('--lp-svh'),
    resize(next, event = 'resize') {
      width = next.width ?? width;
      height = next.height ?? height;
      dispatch(event);
    },
    advance(ms) {
      const until = now + ms;
      while (true) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        const [id, timer] = next;
        timers.delete(id);
        now = timer.at;
        timer.fn();
      }
      now = until;
    },
    unmount() { cleanups.forEach(cleanup => cleanup?.()); },
  };
}

for (const coarse of [false, true]) {
  const phone = mount({ width: 390, height: 760, coarse });
  assert.equal(phone.value(), '760px', 'initial mobile geometry is preserved');
  for (const height of [844, 760, 430, 760, 844]) {
    phone.resize({ height });
    phone.advance(2000);
    assert.equal(phone.value(), '760px', 'toolbar and keyboard height changes cannot move the hero after scrolling stops');
  }
  assert.equal(phone.writes.length, 1, 'height-only mobile resizes perform no CSS writes');

  phone.resize({ width: 430, height: 900 });
  phone.advance(100);
  phone.resize({ height: 932 });
  phone.advance(2000);
  assert.equal(phone.value(), '932px', 'a width change measures the final settled viewport');
  phone.resize({ height: 850 });
  phone.advance(2000);
  assert.equal(phone.value(), '932px', 'the new width establishes a fresh stable mobile height');

  phone.resize({ height: 880 }, 'orientationchange');
  phone.advance(2000);
  assert.equal(phone.value(), '880px', 'explicit orientation changes remeasure even when width is unchanged');
  phone.unmount();
}

for (const width of [844, 1024]) {
  const touch = mount({ width, height: 700, coarse: true });
  touch.resize({ height: 810 });
  touch.advance(2000);
  assert.equal(touch.value(), '700px', 'landscape phones and tablets also ignore toolbar-only resize');
  touch.resize({ width: width + 100, height: 850 });
  touch.advance(2000);
  assert.equal(touch.value(), '850px', 'touch-device layout width changes still adapt');
  touch.unmount();
}

const desktop = mount({ width: 1440, height: 900 });
desktop.resize({ height: 800 });
desktop.advance(100);
assert.equal(desktop.value(), '900px', 'desktop keeps the old geometry during an active resize');
desktop.resize({ height: 760 });
desktop.advance(100);
assert.equal(desktop.value(), '900px', 'successive desktop resize events reset the settling period');
desktop.advance(1000);
assert.equal(desktop.value(), '760px', 'settled desktop height changes remain responsive');

desktop.resize({ height: 820 });
assert.ok(desktop.timers.size > 0, 'cleanup scenario has a pending resize');
desktop.unmount();
assert.equal(desktop.timers.size, 0, 'unmount cancels pending measurements');
assert.equal(desktop.listeners.size, 0, 'unmount removes resize, orientation and scroll listeners');
assert.equal(desktop.value(), undefined, 'unmount removes the viewport override');
desktop.advance(2000);
desktop.resize({ height: 880 });
desktop.advance(2000);
assert.equal(desktop.value(), undefined, 'late timers and resize events cannot restore the override after unmount');

console.log('PASS: real viewport effect keeps mobile toolbar/keyboard resizes stable, adapts width/orientation and desktop resizing, and cleans up pending work.');
