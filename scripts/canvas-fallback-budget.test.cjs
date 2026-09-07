const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const ts = require(path.join(process.cwd(), 'node_modules/typescript'));
const source = fs.readFileSync('components/sections/landing-v3/LpArcCanvas.tsx', 'utf8');
const helpers = source.slice(source.indexOf('const MIN_FRAME_MS'), source.indexOf('interface Ring'));
const context = {};
vm.runInNewContext(ts.transpileModule(helpers + '\nglobalThis.testHelpers = { freshBudget, exceedsBudget, MIN_FRAME_MS };', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
const { freshBudget, exceedsBudget, MIN_FRAME_MS } = context.testHelpers;
function simulate(interval, drawMs, count, budget = freshBudget(), start = 100) {
  for (let i = 0; i < count; i++) {
    if (exceedsBudget(budget, start + i * interval, typeof drawMs === 'function' ? drawMs(i) : drawMs)) return i + 1;
  }
  return null;
}
assert.equal(simulate(1000 / 30, 3, 300), null, 'healthy 30fps remains animated');
assert.equal(simulate(1000 / 15, 10, 150), null, 'healthy 15fps stays above the degradation floor');
assert.equal(simulate(60, 55, 10), 3, 'three consecutive long draw tasks disable fallback');
assert.equal(simulate(300, 250, 10), 1, 'one severe draw disables fallback immediately');
assert.equal(simulate(250, 200, 10), 1, 'the severe draw ceiling is inclusive');
assert.equal(simulate(1000 / 30, i => i === 8 ? 100 : 3, 300), null, 'one long draw is tolerated');
assert.equal(simulate(1000 / 30, i => i % 4 < 2 ? 60 : 3, 300), null, 'non-consecutive long draw tasks do not accumulate');
assert.equal(simulate(100, 5, 100), 41, 'two sustained 10fps windows detect deferred rendering pressure');
const oneSlowWindow = freshBudget();
assert.equal(simulate(100, 5, 21, oneSlowWindow), null);
assert.equal(simulate(1000 / 30, 3, 180, oneSlowWindow, 2200), null, 'recovered cadence clears the first slow strike');
assert.equal(simulate(1000 / 30, 3, 180, freshBudget(), 60000), null, 'pause/resume timing reset excludes time spent idle');
for (const refreshRate of [60, 90, 120]) {
  let lastDraw = 0, draws = 0;
  for (let i = 1; i <= refreshRate * 10; i++) {
    const now = i * 1000 / refreshRate;
    if (lastDraw && now - lastDraw < MIN_FRAME_MS) continue;
    lastDraw = now;
    draws++;
  }
  assert.equal(draws, 300, '30fps draw cap on ' + refreshRate + 'Hz display');
}
console.log('PASS: healthy cadence, transient load, repeated long draws, single severe draw, sustained slow cadence, recovery, pause/resume, and 30fps cap at 60/90/120Hz.');
