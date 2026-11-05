// Run with node --test scripts/white-glove-demo.test.cjs. Compiles the real
// /white-glove demo contract, booking pass, Attio writer and API routes;
// Attio and Supabase are fakes, so no test ever contacts a provider.
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
const fit = { email: "Jane@Acme.io", size: "11–50", country: "United States", gtmTeam: "yes", submissionId: ID };
const plain = (value) => JSON.parse(JSON.stringify(value));

function request(pathname, body, origin = "http://localhost:3027") {
  return new Request(origin + pathname, {
    method: "POST",
    headers: { host: new URL(origin).host, origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── the contract ──

test("routes: solo/duo to self-serve, borderline to François's review, clear fits to the calendar", () => {
  const { parseWgRequest, wgRoute } = runtime()("lib/white-glove-demo.ts");
  const cases = [
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
    "Booked from pancake.ai/white-glove. Company size: 11–50. Country: United States. GTM team in place: Yes.",
  );
  assert.equal(isTeamEmail("tristan@pancake.ai"), true);
  assert.equal(isTeamEmail("x@eng.getpancake.ai"), true);
  assert.equal(isTeamEmail("jane@notpancake.ai"), false);
});

// ── the booking pass ──

test("booking pass: round trip, tampering, wrong secret, expiry", () => {
  const load = runtime();
  const { signWgBooking, verifyWgBooking, WG_BOOKING_MAX_AGE_MS } = load("lib/white-glove-booking-token.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  const now = Date.UTC(2026, 10, 5, 18);
  const pass = signWgBooking("secret", a, now);
  assert.deepEqual(plain(verifyWgBooking("secret", pass, now + 60_000)), plain(a));
  assert.equal(verifyWgBooking("other", pass, now), null);
  const [payload, mac] = pass.split(".");
  const forged = Buffer.from(JSON.stringify({ e: a.email, s: "201+", c: a.country, g: "yes", t: now })).toString("base64url");
  assert.equal(verifyWgBooking("secret", `${forged}.${mac}`, now), null);
  assert.equal(verifyWgBooking("secret", `${payload}.${mac}x`, now), null);
  assert.equal(verifyWgBooking("secret", pass, now + WG_BOOKING_MAX_AGE_MS + 1), null);
  assert.equal(verifyWgBooking("secret", signWgBooking("secret", a, now + 5 * 60_000), now), null);
  for (const junk of [undefined, 42, "", "a.b.c", "x".repeat(2000)]) assert.equal(verifyWgBooking("secret", junk, now), null);
});

// ── Attio ──

function fakeAttio({ person = null, deals = [], statuses, failDeal = false, refuseOwner = false, hideStages = false } = {}) {
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
    if (p === "/v2/objects/deals/records/query") return json({ data: deals });
    if (p === "/v2/objects/deals/attributes/stage/statuses") {
      if (hideStages) return json({ error: "forbidden" }, 403);
      // the workspace's Sales Pipeline, as seen 2026-11-05
      return json({ data: statuses ?? [{ title: "Discovery booked" }, { title: "Demo booked" }, { title: "Escalation required" }] });
    }
    if (method === "POST" && p === "/v2/objects/deals/records") {
      if (failDeal || (refuseOwner && body.data.values.owner)) return json({ error: "bad" }, 400);
      return json({ data: { id: { record_id: "deal-1" } } });
    }
    if (method === "POST" && p === "/v2/notes") return json({ data: { id: { note_id: "note-1" } } });
    return json({ error: "unexpected" }, 404);
  };
  return { calls, fetchImpl };
}
const NOW = new Date(Date.UTC(2026, 10, 5, 18));
const BOOKING = {
  bookedAt: NOW.toISOString(),
  eventUri: "https://api.calendly.com/scheduled_events/EVT1",
  inviteeUri: "https://api.calendly.com/scheduled_events/EVT1/invitees/INV1",
};

test("a booking opens one deal linked to the company and the person, in Demo booked, owned by François", async () => {
  const attio = fakeAttio();
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { createAttioWhiteGloveDeal, WG_DEAL_STAGE, WG_DEAL_OWNER } = load("lib/attio-white-glove.ts");
  assert.equal(WG_DEAL_STAGE, "Demo booked");
  assert.equal(WG_DEAL_OWNER, "francois@getbasalt.ai");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  assert.equal(await createAttioWhiteGloveDeal("token", a, BOOKING, { owner: WG_DEAL_OWNER, now: NOW }), "created");
  const company = attio.calls.find((c) => c.path.startsWith("/v2/objects/companies/records"));
  assert.equal(company.body.data.values.domains[0].domain, "acme.io");
  const deal = attio.calls.find((c) => c.method === "POST" && c.path === "/v2/objects/deals/records");
  const values = deal.body.data.values;
  assert.equal(values.name, "acme.io · White Glove demo");
  assert.equal(values.stage, "Demo booked");
  assert.equal(values.owner, "francois@getbasalt.ai");
  assert.equal(values.associated_company[0].target_record_id, "company-1");
  assert.equal(values.associated_people[0].target_record_id, "person-new");
  const note = attio.calls.find((c) => c.path === "/v2/notes");
  assert.equal(note.body.data.parent_object, "deals");
  assert.equal(note.body.data.parent_record_id, "deal-1");
  assert.match(note.body.data.content, /Calendly event: https:\/\/api\.calendly\.com\/scheduled_events\/EVT1/);
  assert.match(note.body.data.content, /Country: United States/);
});

test("a second booking from the same domain within 30 days adds a note, not a deal", async () => {
  const attio = fakeAttio({
    deals: [{ id: { record_id: "deal-old" }, created_at: new Date(NOW.getTime() - 3 * 86400000).toISOString() }],
  });
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { createAttioWhiteGloveDeal } = load("lib/attio-white-glove.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  assert.equal(await createAttioWhiteGloveDeal("token", a, BOOKING, { now: NOW }), "exists");
  assert.equal(attio.calls.some((c) => c.method === "POST" && c.path === "/v2/objects/deals/records"), false);
  assert.equal(attio.calls.find((c) => c.path === "/v2/notes").body.data.parent_record_id, "deal-old");
});

test("without permission to read the stages, the configured title is written as is", async () => {
  const attio = fakeAttio({ hideStages: true });
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { createAttioWhiteGloveDeal } = load("lib/attio-white-glove.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  assert.equal(await createAttioWhiteGloveDeal("token", a, BOOKING, { now: NOW }), "created");
  const deal = attio.calls.find((c) => c.method === "POST" && c.path === "/v2/objects/deals/records");
  assert.equal(deal.body.data.values.stage, "Demo booked");
});

test("an old deal for the domain does not block a new one; an unknown stage falls back to the first", async () => {
  const attio = fakeAttio({
    deals: [{ id: { record_id: "deal-old" }, created_at: new Date(NOW.getTime() - 90 * 86400000).toISOString() }],
    statuses: [{ title: "Archived", is_archived: true }, { title: "Discovery" }, { title: "Won" }],
  });
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { createAttioWhiteGloveDeal, pickDealStage } = load("lib/attio-white-glove.ts");
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  assert.equal(await createAttioWhiteGloveDeal("token", a, BOOKING, { now: NOW }), "created");
  const deal = attio.calls.find((c) => c.method === "POST" && c.path === "/v2/objects/deals/records");
  assert.equal(deal.body.data.values.stage, "Discovery");
  assert.equal(pickDealStage([{ title: "meeting BOOKED " }], "Meeting booked"), "meeting BOOKED ");
  assert.equal(pickDealStage("nope", "Meeting booked"), null);
});

test("the owner rides along; an owner Attio refuses is dropped, not the deal", async () => {
  const load = runtime({ fetchImpl: fakeAttio().fetchImpl });
  const a = load("lib/white-glove-demo.ts").parseWgRequest(fit).value;
  const ok = fakeAttio();
  const withOwner = runtime({ fetchImpl: ok.fetchImpl })("lib/attio-white-glove.ts");
  assert.equal(await withOwner.createAttioWhiteGloveDeal("token", a, BOOKING, { owner: "owner@pancake.ai", now: NOW }), "created");
  const sent = ok.calls.filter((c) => c.method === "POST" && c.path === "/v2/objects/deals/records");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].body.data.values.owner, "owner@pancake.ai");
  const refused = fakeAttio({ refuseOwner: true });
  const strict = runtime({ fetchImpl: refused.fetchImpl })("lib/attio-white-glove.ts");
  assert.equal(await strict.createAttioWhiteGloveDeal("token", a, BOOKING, { owner: "nobody@pancake.ai", now: NOW }), "created");
  const tries = refused.calls.filter((c) => c.method === "POST" && c.path === "/v2/objects/deals/records");
  assert.equal(tries.length, 2);
  assert.equal(tries[1].body.data.values.owner, undefined);
  assert.equal(tries[1].body.data.values.name, "acme.io · White Glove demo");
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

test("team addresses never reach Attio; a failed deal create reports failed", async () => {
  const attio = fakeAttio({ failDeal: true });
  const load = runtime({ fetchImpl: attio.fetchImpl });
  const { createAttioWhiteGloveDeal, writeAttioWhiteGloveRequest } = load("lib/attio-white-glove.ts");
  const { parseWgRequest } = load("lib/white-glove-demo.ts");
  const team = parseWgRequest({ ...fit, email: "tristan@pancake.ai" }).value;
  assert.equal(await createAttioWhiteGloveDeal("token", team, BOOKING, { now: NOW }), "skipped");
  assert.equal(await writeAttioWhiteGloveRequest("token", team, "book", NOW.toISOString()), "skipped");
  assert.equal(attio.calls.length, 0);
  const a = parseWgRequest(fit).value;
  assert.equal(await createAttioWhiteGloveDeal("token", a, BOOKING, { now: NOW }), "failed");
});

// ── the routes ──

function routeRuntime({ env = { ATTIO_API_KEY: "test-only" }, db = null } = {}) {
  const writes = [];
  const deals = [];
  const load = runtime({
    env,
    db,
    stubs: {
      "@/lib/attio-white-glove": {
        WG_DEAL_STAGE: "Demo booked",
        WG_DEAL_OWNER: "francois@getbasalt.ai",
        writeAttioWhiteGloveRequest: async (_token, a, route) => {
          writes.push({ email: a.email, route });
          return "sent";
        },
        createAttioWhiteGloveDeal: async (_token, a, booking, options) => {
          deals.push({ email: a.email, booking, stage: options.stage, owner: options.owner });
          return "created";
        },
      },
    },
  });
  return { load, writes, deals };
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
  const gmail = await POST(request("/api/white-glove/demo", { ...fit, email: "jane@gmail.com" }));
  assert.equal(gmail.status, 400);
  const body = await gmail.json();
  assert.equal(body.field, "email");
  assert.equal(body.reason, "personal_email");
  assert.equal(writes.length, 0);
});

test("demo route: a clear fit gets a booking pass the booked route accepts", async () => {
  const { load, writes, deals } = routeRuntime();
  const demo = await load("app/api/white-glove/demo/route.ts").POST(request("/api/white-glove/demo", fit));
  assert.equal(demo.status, 200);
  const body = await demo.json();
  assert.equal(body.route, "book");
  assert.equal(typeof body.booking, "string");
  assert.deepEqual(plain(writes), [{ email: "jane@acme.io", route: "book" }]);
  const booked = await load("app/api/white-glove/booked/route.ts").POST(
    request("/api/white-glove/booked", {
      booking: body.booking,
      event: BOOKING.eventUri,
      invitee: "https://evil.example/invitees/1",
    }),
  );
  assert.equal(booked.status, 200);
  assert.equal((await booked.json()).deal, "created");
  assert.equal(deals.length, 1);
  assert.equal(deals[0].email, "jane@acme.io");
  assert.equal(deals[0].stage, "Demo booked");
  assert.equal(deals[0].owner, "francois@getbasalt.ai");
  assert.equal(deals[0].booking.eventUri, BOOKING.eventUri);
  assert.equal(deals[0].booking.inviteeUri, undefined);
  // a middle character of the signature: the last one also carries base64 padding bits
  const [payload, mac] = body.booking.split(".");
  const tampered = `${payload}.${mac.slice(0, 10)}${mac[10] === "A" ? "B" : "A"}${mac.slice(11)}`;
  const forged = await load("app/api/white-glove/booked/route.ts").POST(
    request("/api/white-glove/booked", { booking: tampered }),
  );
  assert.equal(forged.status, 400);
  assert.equal(deals.length, 1);
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
  assert.equal(row.answers.name, "");
  assert.deepEqual(plain(writes), [{ email: "jane@acme.io", route: "review" }]);
  assert.deepEqual(plain(db.updates), [{ crm_state: "sent" }]);
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

test("booked route: without an Attio token nothing is opened", async () => {
  const { load, deals } = routeRuntime({ env: {} });
  const r = await load("app/api/white-glove/booked/route.ts").POST(request("/api/white-glove/booked", { booking: "x.y" }));
  assert.equal(r.status, 200);
  assert.equal((await r.json()).deal, "skipped");
  assert.equal(deals.length, 0);
});

test("the calendar URL carries the email and the answers line, never a name", () => {
  const { whiteGloveBookingEmbedUrl, calendlyScheduledUris } = runtime()("lib/booking.ts");
  const url = new URL(whiteGloveBookingEmbedUrl("jane@acme.io", "Company size: 11–50.", { compact: true }));
  assert.equal(url.origin + url.pathname, "https://calendly.com/getpancake/pancake-whiteglove");
  assert.equal(url.searchParams.get("email"), "jane@acme.io");
  assert.equal(url.searchParams.get("a1"), "Company size: 11–50.");
  assert.equal(url.searchParams.get("hide_event_type_details"), "1");
  assert.equal(url.searchParams.has("name"), false);
  assert.deepEqual(
    plain(
      calendlyScheduledUris({
        event: "calendly.event_scheduled",
        payload: { event: { uri: BOOKING.eventUri }, invitee: { uri: "javascript:alert(1)" } },
      }),
    ),
    { event: BOOKING.eventUri },
  );
});
