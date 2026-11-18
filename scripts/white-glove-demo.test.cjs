// Run with node --test scripts/white-glove-demo.test.cjs. Compiles the real
// /white-glove demo contract, Attio writer and API route; Attio and Supabase
// are fakes, so no test ever contacts a provider.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");

function runtime({ env = {}, db = null, stubs = {}, fetchImpl } = {}) {
  const cache = new Map();
  const fetchFn =
    fetchImpl ??
    (async () => {
      throw new Error("Tests must never contact providers");
    });
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
      fileName: file.replace(/\.mjs$/, ".ts"),
    }).outputText;
    const req = (n) => {
      if (n === "server-only") return {};
      if (n === "next/server") return { NextResponse };
      if (n === "@/lib/supabase/admin") return { createSupabaseAdminClient: () => db };
      if (stubs[n]) return stubs[n];
      if (n.startsWith("@/") || n.startsWith(".")) {
        const base = n.startsWith("@/") ? path.join(root, n.slice(2)) : path.resolve(path.dirname(file), n);
        return load([base, base + ".ts", base + ".mjs", base + ".tsx"].find((p) => fs.existsSync(p)));
      }
      return require(n);
    };
    vm.runInNewContext(js, {
      module: m,
      exports: m.exports,
      require: req,
      process: { env: { NODE_ENV: "development", ...env } },
      URL,
      URLSearchParams,
      Headers,
      Request,
      Response,
      Buffer,
      AbortController,
      AbortSignal,
      setTimeout,
      clearTimeout,
      fetch: fetchFn,
      console: { error() {}, info() {}, log() {} },
    });
    return m.exports;
  }
  return (name) => load(path.join(root, name));
}

const ID = "ca87f89e-e51f-4248-9900-fcf6d7e084fd";
const fit = { email: "Jane@Acme.io", size: "11–50", country: "United States", gtmTeam: "yes", budget: "yes", submissionId: ID };
const plain = (value) => JSON.parse(JSON.stringify(value));

function request(pathname, body, origin = "http://localhost:3027") {
  return new Request(origin + pathname, {
    method: "POST",
    headers: { host: new URL(origin).host, origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── the contract ──

test("routes: solo/duo and no budget to self-serve, borderline to François's review, clear fits to the calendar", () => {
  const { parseWgRequest, wgRoute } = runtime()("lib/white-glove-demo.ts");
  const cases = [
    // the budget gates the calendar, as /demo gates White Glove (2026-11-08)
    [{ size: "201+", country: "United States", gtmTeam: "yes", budget: "no" }, "self_serve"],
    [{ size: "11–50", country: "India", gtmTeam: "yes", budget: "no" }, "self_serve"],
    [{ size: "51–200", country: "France", gtmTeam: "yes", budget: "approval" }, "review"],
    [{ size: "3–10", country: "United States", gtmTeam: "yes", budget: "approval" }, "review"],
    [{ size: "1–2", country: "United States", gtmTeam: "yes" }, "self_serve"],
    [{ size: "1–2", country: "India", gtmTeam: "no" }, "self_serve"],
    [{ size: "11–50", country: "India", gtmTeam: "yes" }, "review"],
    [{ size: "201+", country: "Brazil", gtmTeam: "yes" }, "review"],
    [{ size: "3–10", country: "United States", gtmTeam: "no" }, "review"],
    [{ size: "3–10", country: "United States", gtmTeam: "yes" }, "book"],
    [{ size: "11–50", country: "United States", gtmTeam: "no" }, "book"],
    [{ size: "51–200", country: "France", gtmTeam: "no" }, "book"],
    [{ size: "201+", country: "Singapore", gtmTeam: "yes" }, "book"],
  ];
  for (const [answers, expected] of cases) {
    const parsed = parseWgRequest({ ...fit, ...answers });
    assert.ok(parsed.ok, JSON.stringify(answers));
    assert.equal(wgRoute(parsed.value), expected, JSON.stringify(answers));
  }
});

test("validation: work email only, known options, a v4 submission id", () => {
  const { parseWgRequest } = runtime()("lib/white-glove-demo.ts");
  const ok = parseWgRequest(fit);
  assert.ok(ok.ok);
  assert.equal(ok.value.email, "jane@acme.io");
  assert.equal(ok.submissionId, ID);
  const personal = parseWgRequest({ ...fit, email: "jane@gmail.com" });
  assert.equal(personal.ok, false);
  assert.equal(personal.field, "email");
  assert.equal(personal.reason, "personal_email");
  for (const [patch, field] of [
    [{ email: "not-an-email" }, "email"],
    [{ size: "1-2" }, "size"],
    [{ country: "Atlantis" }, "country"],
    [{ gtmTeam: "maybe" }, "gtmTeam"],
    [{ budget: "maybe" }, "budget"],
    [{ budget: undefined }, "budget"],
    [{ submissionId: "nope" }, "submissionId"],
  ]) {
    const parsed = parseWgRequest({ ...fit, ...patch });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.field, field);
  }
  assert.equal(parseWgRequest(null).ok, false);
  assert.equal(parseWgRequest([]).ok, false);
});

test("every instant-booking market is a country of the form's list", () => {
  const { WG_INSTANT_MARKETS } = runtime()("lib/white-glove-demo.ts");
  const { COUNTRIES, COMMON_COUNTRIES } = runtime()("lib/countries.ts");
  for (const country of [...WG_INSTANT_MARKETS, ...COMMON_COUNTRIES]) assert.ok(COUNTRIES.includes(country), country);
  assert.equal(new Set(COUNTRIES).size, COUNTRIES.length);
});

test("the answers line and team addresses", () => {
  const { wgContextLine, isTeamEmail, parseWgRequest } = runtime()("lib/white-glove-demo.ts");
  const a = parseWgRequest(fit).value;
  assert.equal(
    wgContextLine(a),
    "Booked from pancake.ai/white-glove. Company size: 11–50. Country: United States. GTM team in place: Yes. $3,000 a month works: Yes.",
  );
  assert.equal(
    wgContextLine({ ...a, budget: "approval" }, "https://brain.pancake.ai/white-glove"),
    "Booked from brain.pancake.ai/white-glove. Company size: 11–50. Country: United States. GTM team in place: Yes. $3,000 a month works: Needs internal approval.",
  );
  assert.equal(isTeamEmail("tristan@pancake.ai"), true);
  assert.equal(isTeamEmail("x@eng.getpancake.ai"), true);
  assert.equal(isTeamEmail("jane@notpancake.ai"), false);
});

test("the review reason lists every reason that applies", () => {
  const { wgReviewReason, parseWgRequest } = runtime()("lib/white-glove-demo.ts");
  const a = parseWgRequest(fit).value;
  assert.equal(wgReviewReason({ ...a, size: "3–10", gtmTeam: "no" }), "Company of 3–10 with no GTM team yet");
  assert.equal(
    wgReviewReason({ ...a, budget: "approval", country: "India" }),
    "Needs internal approval for $3,000 a month; Country outside the instant-booking markets (India)",
  );
});

test("the country field's search: common countries first, short names, accents", () => {
  const { DEFAULT_COUNTRY_LIST, searchCountries, resolveCountry } = runtime()("lib/country-search.ts");
  const { COUNTRIES } = runtime()("lib/countries.ts");
  assert.deepEqual(plain(DEFAULT_COUNTRY_LIST.slice(0, 5)), ["United States", "Canada", "United Kingdom", "France", "Germany"]);
  assert.equal(DEFAULT_COUNTRY_LIST.length, COUNTRIES.length);
  assert.equal(new Set(DEFAULT_COUNTRY_LIST).size, COUNTRIES.length);
  assert.equal(searchCountries("fra")[0], "France");
  assert.equal(searchCountries("uk")[0], "United Kingdom");
  assert.equal(searchCountries("usa")[0], "United States");
  assert.equal(searchCountries("kingdom")[0], "United Kingdom");
  assert.equal(searchCountries("cote")[0], "Côte d’Ivoire");
  assert.deepEqual(plain(searchCountries("germ")), ["Germany"]);
  assert.equal(searchCountries("zzz").length, 0);
  assert.equal(resolveCountry("united states"), "United States");
  assert.equal(resolveCountry("turkey"), "Türkiye");
  assert.equal(resolveCountry("fra"), null);
  // every alias names a real country of the form's list
  for (const q of ["us", "uk", "uae", "holland", "korea", "czech republic", "ivory coast"]) {
    assert.ok(COUNTRIES.includes(resolveCountry(q)), q);
  }
});

// ── Attio ──

function fakeAttio({ person = null } = {}) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    const body = init.body ? JSON.parse(init.body) : undefined;
    const method = init.method || "GET";
    calls.push({ method, path: u.pathname + u.search, body });
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
    const p = u.pathname;
    if (method === "PUT" && p === "/v2/objects/companies/records") return json({ data: { id: { record_id: "company-1" } } });
    if (p === "/v2/objects/people/records/query") return json({ data: person ? [person] : [] });
    if (method === "PUT" && p === "/v2/objects/people/records") return json({ data: { id: { record_id: "person-new" } } });
    if (method === "PATCH" && p.startsWith("/v2/objects/people/records/")) return json({ data: {} });
    if (method === "POST" && p === "/v2/notes") return json({ data: { id: { note_id: "note-1" } } });
    return json({ error: "unexpected" }, 404);
  };
  return { calls, fetchImpl };
}
const NOW = new Date(Date.UTC(2026, 10, 5, 18));

test("a qualified request lands on the company and the person, with a note naming the page; never a deal", async () => {
  const attio = fakeAttio();
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { writeAttioWhiteGloveRequest } = load("lib/attio-white-glove.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  const page = "https://brain.pancake.ai/white-glove";
  assert.equal(await writeAttioWhiteGloveRequest("token", a, "book", NOW.toISOString(), page), "sent");
  const company = attio.calls.find((c) => c.path.startsWith("/v2/objects/companies/records"));
  assert.equal(company.body.data.values.domains[0].domain, "acme.io");
  const person = attio.calls.find((c) => c.method === "PUT" && c.path.startsWith("/v2/objects/people/records"));
  assert.equal(person.body.data.values.email_addresses[0].email_address, "jane@acme.io");
  assert.equal(person.body.data.values.company[0].target_record_id, "company-1");
  const note = attio.calls.find((c) => c.path === "/v2/notes").body.data;
  assert.equal(note.parent_object, "people");
  assert.equal(note.parent_record_id, "person-new");
  assert.equal(note.title, "White Glove demo request");
  assert.match(note.content, /Qualified: the White Glove calendar opened on the page/);
  assert.match(note.content, /Country: United States/);
  assert.match(note.content, /Page: https:\/\/brain\.pancake\.ai\/white-glove/);
  // Deals come from the CRM's own Calendly integration, on every booking.
  assert.equal(attio.calls.some((c) => c.path.includes("/deals")), false);
});

test("an existing person keeps their record; only an empty company is filled", async () => {
  const attio = fakeAttio({ person: { id: { record_id: "person-1" }, values: { company: [] } } });
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { writeAttioWhiteGloveRequest } = load("lib/attio-white-glove.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest({ ...fit, country: "India" }).value;
  assert.equal(await writeAttioWhiteGloveRequest("token", a, "review", NOW.toISOString()), "sent");
  const patch = attio.calls.find((c) => c.method === "PATCH");
  assert.equal(patch.path, "/v2/objects/people/records/person-1");
  assert.equal(patch.body.data.values.company[0].target_record_id, "company-1");
  assert.equal(attio.calls.some((c) => c.method === "PUT" && c.path.startsWith("/v2/objects/people/records")), false);
  const note = attio.calls.find((c) => c.path === "/v2/notes").body.data;
  assert.equal(note.parent_record_id, "person-1");
  assert.match(note.content, /Pending François's review/);
  assert.match(note.content, /Country outside the instant-booking markets \(India\)/);
});

test("team addresses never reach Attio; an Attio outage reports failed", async () => {
  const attio = fakeAttio();
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { writeAttioWhiteGloveRequest } = load("lib/attio-white-glove.ts");
  const { parseWgRequest } = load("lib/white-glove-demo.ts");
  const team = parseWgRequest({ ...fit, email: "tristan@pancake.ai" }).value;
  assert.equal(await writeAttioWhiteGloveRequest("token", team, "book", NOW.toISOString()), "skipped");
  assert.equal(attio.calls.length, 0);
  const down = runtime({ fetchImpl: async () => new Response("{}", { status: 500 }) })("lib/attio-white-glove.ts");
  assert.equal(await down.writeAttioWhiteGloveRequest("token", parseWgRequest(fit).value, "book", NOW.toISOString()), "failed");
});

// ── the routes ──

function routeRuntime({ env = { ATTIO_API_KEY: "test-only" }, db = null } = {}) {
  const writes = [];
  const load = runtime({
    env,
    db,
    stubs: {
      "@/lib/attio-white-glove": {
        writeAttioWhiteGloveRequest: async (_token, a, route, _at, pageUrl) => {
          writes.push({ email: a.email, route, pageUrl });
          return "sent";
        },
      },
    },
  });
  return { load, writes };
}

function fakeDb() {
  const inserts = [];
  const updates = [];
  return {
    inserts,
    updates,
    from(table) {
      assert.equal(table, "demo_requests");
      return {
        insert: async (row) => {
          inserts.push(row);
          return { error: null };
        },
        update: (row) => ({
          eq: async () => {
            updates.push(row);
            return { error: null };
          },
        }),
      };
    },
  };
}

test("demo route: self-serve writes nothing; personal email is refused with its reason", async () => {
  const db = { from: () => assert.fail("no queue write expected") };
  const { load, writes } = routeRuntime({ db });
  const { POST } = load("app/api/white-glove/demo/route.ts");
  const solo = await POST(request("/api/white-glove/demo", { ...fit, size: "1–2" }));
  assert.equal(solo.status, 200);
  assert.deepEqual(plain(await solo.json()), { ok: true, route: "self_serve" });
  const noBudget = await POST(request("/api/white-glove/demo", { ...fit, size: "201+", budget: "no" }));
  assert.deepEqual(plain(await noBudget.json()), { ok: true, route: "self_serve" });
  const missing = await POST(request("/api/white-glove/demo", { ...fit, budget: undefined }));
  assert.equal(missing.status, 400);
  assert.equal((await missing.json()).field, "budget");
  const gmail = await POST(request("/api/white-glove/demo", { ...fit, email: "jane@gmail.com" }));
  assert.equal(gmail.status, 400);
  const body = await gmail.json();
  assert.equal(body.field, "email");
  assert.equal(body.reason, "personal_email");
  assert.equal(writes.length, 0);
});

test("demo route: a clear fit writes the request and opens the calendar, with no deal step", async () => {
  const { load, writes } = routeRuntime();
  const demo = await load("app/api/white-glove/demo/route.ts").POST(request("/api/white-glove/demo", fit));
  assert.equal(demo.status, 200);
  assert.deepEqual(plain(await demo.json()), { ok: true, route: "book" });
  assert.deepEqual(plain(writes), [{ email: "jane@acme.io", route: "book", pageUrl: "https://pancake.ai/white-glove" }]);
  assert.equal(fs.existsSync(path.join(root, "app/api/white-glove/booked")), false);
});

test("demo route: borderline answers go to François's queue, with the reason, then Attio", async () => {
  const db = fakeDb();
  const { load, writes } = routeRuntime({ db });
  const r = await load("app/api/white-glove/demo/route.ts").POST(
    request("/api/white-glove/demo", { ...fit, size: "3–10", gtmTeam: "no" }),
  );
  assert.equal(r.status, 200);
  assert.deepEqual(plain(await r.json()), { ok: true, route: "review" });
  assert.equal(db.inserts.length, 1);
  const row = db.inserts[0];
  assert.equal(row.id, ID);
  assert.equal(row.answers.service, "White Glove");
  assert.equal(row.answers.website, "https://acme.io");
  assert.equal(row.answers.country, "United States");
  assert.equal(row.answers.reviewReason, "Company of 3–10 with no GTM team yet");
  assert.equal(row.answers.budget, "Yes — this investment works for us");
  assert.equal(row.answers.name, "");
  assert.deepEqual(plain(writes), [{ email: "jane@acme.io", route: "review", pageUrl: "https://pancake.ai/white-glove" }]);
  assert.deepEqual(plain(db.updates), [{ crm_state: "sent" }]);
});

test("demo route: a budget that needs approval waits for François, in /demo's words", async () => {
  const db = fakeDb();
  const { load, writes } = routeRuntime({ db });
  const r = await load("app/api/white-glove/demo/route.ts").POST(
    request("/api/white-glove/demo", { ...fit, size: "201+", budget: "approval" }),
  );
  assert.deepEqual(plain(await r.json()), { ok: true, route: "review" });
  assert.equal(db.inserts[0].answers.budget, "I need internal approval");
  assert.equal(db.inserts[0].answers.reviewReason, "Needs internal approval for $3,000 a month");
  assert.equal(writes[0].route, "review");
});

test("demo route: fails closed without the queue; team tests and the honeypot write nothing", async () => {
  const { load } = routeRuntime({ db: null });
  const { POST } = load("app/api/white-glove/demo/route.ts");
  const down = await POST(request("/api/white-glove/demo", { ...fit, country: "India" }));
  assert.equal(down.status, 503);
  const team = await POST(request("/api/white-glove/demo", { ...fit, country: "India", email: "tristan@pancake.ai" }));
  assert.equal((await team.json()).route, "review");
  const bot = await POST(request("/api/white-glove/demo", { ...fit, nickname: "x" }));
  assert.equal((await bot.json()).route, "review");
  const foreign = await POST(request("/api/white-glove/demo", fit, "https://evil.example"));
  assert.equal(foreign.status, 403);
});

test("demo route: without an Attio token a clear fit still gets the calendar", async () => {
  const { load, writes } = routeRuntime({ env: {} });
  const r = await load("app/api/white-glove/demo/route.ts").POST(request("/api/white-glove/demo", fit));
  assert.deepEqual(plain(await r.json()), { ok: true, route: "book" });
  assert.equal(writes.length, 0);
});

test("the calendar URL carries the email and the answers line, never a name", () => {
  const { whiteGloveBookingEmbedUrl } = runtime()("lib/booking.ts");
  const url = new URL(whiteGloveBookingEmbedUrl("jane@acme.io", "Company size: 11–50.", { compact: true }));
  assert.equal(url.origin + url.pathname, "https://calendly.com/getpancake/pancake-whiteglove");
  assert.equal(url.searchParams.get("email"), "jane@acme.io");
  assert.equal(url.searchParams.get("a1"), "Company size: 11–50.");
  assert.equal(url.searchParams.get("hide_event_type_details"), "1");
  assert.equal(url.searchParams.has("name"), false);
});

// ── brain.pancake.ai, cross-origin ──

function crossRequest(pathname, body, origin, method = "POST") {
  return new Request("https://pancake.ai" + pathname, {
    method,
    headers: { host: "pancake.ai", origin, "content-type": "text/plain;charset=UTF-8" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

test("brain.pancake.ai and its previews can post the form; anyone else can't", async () => {
  const { load, writes } = routeRuntime();
  const { POST } = load("app/api/white-glove/demo/route.ts");
  const brain = await POST(crossRequest("/api/white-glove/demo", fit, "https://brain.pancake.ai"));
  assert.equal(brain.status, 200);
  assert.equal(brain.headers.get("access-control-allow-origin"), "https://brain.pancake.ai");
  assert.equal((await brain.json()).route, "book");
  assert.equal(writes[0].pageUrl, "https://brain.pancake.ai/white-glove");
  const preview = await POST(crossRequest("/api/white-glove/demo", { ...fit, size: "1–2" }, "https://pancake-brain-k3x9a1-getpancake.vercel.app"));
  assert.equal(preview.status, 200);
  for (const origin of ["https://evil.example", "https://pancake-brain-x-getpancake.vercel.app.evil.com", "https://brain.pancake.ai.evil.com", "http://brain.pancake.ai"]) {
    const refused = await POST(crossRequest("/api/white-glove/demo", fit, origin));
    assert.equal(refused.status, 403, origin);
    assert.equal(refused.headers.get("access-control-allow-origin"), null, origin);
  }
});

test("preflight: allowed for the Brain page only", async () => {
  const { load } = routeRuntime();
  const { OPTIONS } = load("app/api/white-glove/demo/route.ts");
  const ok = await OPTIONS(crossRequest("/x", null, "https://brain.pancake.ai", "OPTIONS"));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://brain.pancake.ai");
  assert.match(ok.headers.get("access-control-allow-methods"), /POST/);
  const no = await OPTIONS(crossRequest("/x", null, "https://evil.example", "OPTIONS"));
  assert.equal(no.status, 403);
});
