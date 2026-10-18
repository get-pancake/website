// Run with node --test scripts/demo-policy.test.cjs. Compile the real shared
// contract and route; provider delivery is stubbed so tests never contact a CRM.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
const root = path.resolve(__dirname, '..');

function modules({ production = false, delivery = 'none' } = {}) {
  const cache = new Map();
  const calls = [];
  const env = { NODE_ENV: production ? 'production' : 'development' };
  if (delivery !== 'none') env.ATTIO_API_KEY = 'test-only';
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const source = fs.readFileSync(file, 'utf8');
    const js = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
      fileName: file.replace(/\.mjs$/, '.ts'),
    }).outputText;
    const localRequire = (name) => {
      if (name === 'server-only') return {};
      if (name === 'next/server') return { NextRequest, NextResponse };
      if (name === '@/lib/attio-demo-request') return {
        writeAttioDemoRequest: async (_token, lead) => { calls.push(lead); return delivery === 'success' ? 'sent' : 'failed'; },
      };
      if (name.startsWith('@/') || name.startsWith('.')) {
        const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
        const resolved = [base, base + '.ts', base + '.mjs'].find(p => fs.existsSync(p));
        return load(resolved);
      }
      return require(name);
    };
    vm.runInNewContext(js, {
      module, exports: module.exports, require: localRequire,
      process: { env }, URL, URLSearchParams, Request, Response, Headers,
      AbortSignal, setTimeout, clearTimeout, console: { error() {}, info() {} },
      fetch: async () => { throw new Error('Tests must never contact providers'); },
    }, { filename: file });
    return module.exports;
  }
  return { load: name => load(path.join(root, name)), calls };
}

const lead = { firstName: 'Demo', lastName: 'Tester', email: 'demo@example.com', website: 'https://example.com/', teamSize: '51+', whiteGlove: 'no', hasAccount: 'no' };
const shared = modules();
const booking = shared.load('lib/booking.ts');
const contract = shared.load('lib/demo-request.ts');
const voice = shared.load('lib/ai-sales.ts');

for (const size of ['1-2', '3-20', '21-50', '51+']) {
  for (const interest of ['yes', 'no']) {
    const expected = interest === 'yes' ? 'whiteGlove' : size === '51+' ? 'enterprise' : null;
    test(`${size}, White Glove ${interest}: ${expected ?? 'self-service'}`, () => {
      const answers = { ...lead, teamSize: size, whiteGlove: interest };
      assert.equal(booking.demoBookingDestination(size, interest)?.key ?? null, expected);
      const url = booking.demoBookingEventUrl(answers);
      assert.equal(url !== null, expected !== null);
      if (url) assert.ok(url.startsWith(booking.DEMO_BOOKING_DESTINATIONS[expected].url));
      const vars = voice.aiSalesBookingVariables(answers, { enterprise: 'Enterprise', whiteGlove: 'White Glove' });
      assert.equal(vars.form_sent, expected ? 'yes' : 'no');
      assert.equal(Boolean(vars.booking_event_type), Boolean(expected));
    });
  }
}

test('missing and unknown qualification never produces a booking destination', () => {
  for (const [size, interest] of [['51+', undefined], ['51+', 'maybe'], ['unknown', 'yes']]) {
    assert.equal(booking.demoBookingDestination(size, interest), null);
  }
  assert.equal(contract.parseDemoRequest({ ...lead, whiteGlove: undefined }).ok, false);
  assert.equal(voice.completeAnswers({ ...lead, whiteGlove: undefined }), null);
});

test('client admission rejects malformed successes, legacy destinations and honeypot responses', () => {
  for (const body of [null, {}, { ok: true }, { ok: true, delivered: [] }, { ok: true, delivered: [], destination: 'group' }, { ok: true, delivered: ['unknown'], destination: 'enterprise' }]) {
    assert.equal(contract.isDemoRequestOk(body), false);
  }
  assert.equal(contract.isDemoRequestOk({ ok: true, delivered: ['attio'], destination: 'whiteGlove' }), true);
});

async function submit(runtime, body) {
  const { POST } = runtime.load('app/api/demo-request/route.ts');
  const response = await POST(new NextRequest('https://pancake.ai/api/demo-request', {
    method: 'POST', headers: { host: 'pancake.ai', origin: 'https://pancake.ai', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));
  return { status: response.status, body: await response.json() };
}

test('server rejects small-company direct POST before CRM delivery', async () => {
  const runtime = modules({ production: true, delivery: 'success' });
  const response = await submit(runtime, { ...lead, teamSize: '21-50' });
  assert.equal(response.status, 403);
  assert.equal(response.body.error, 'ineligible');
  assert.equal(runtime.calls.length, 0);
});

test('server requires explicit White Glove answer', async () => {
  const runtime = modules({ production: true, delivery: 'success' });
  const response = await submit(runtime, { ...lead, whiteGlove: undefined });
  assert.equal(response.status, 400);
  assert.equal(runtime.calls.length, 0);
});

test('server returns the admitted destination and preserves qualification in CRM', async () => {
  const runtime = modules({ production: true, delivery: 'success' });
  const response = await submit(runtime, { ...lead, teamSize: '1-2', whiteGlove: 'yes' });
  assert.equal(response.status, 200);
  assert.equal(response.body.destination, 'whiteGlove');
  assert.equal(runtime.calls[0].whiteGlove, 'yes');
});

test('delivery failure never returns booking admission', async () => {
  const response = await submit(modules({ production: true, delivery: 'failed' }), lead);
  assert.equal(response.status, 503);
  assert.equal(contract.isDemoRequestOk(response.body), false);
});

test('honeypot success cannot open a calendar', async () => {
  const runtime = modules({ production: true, delivery: 'success' });
  const response = await submit(runtime, { ...lead, nickname: 'bot' });
  assert.equal(response.status, 200);
  assert.equal(contract.isDemoRequestOk(response.body), false);
  assert.equal(runtime.calls.length, 0);
});
