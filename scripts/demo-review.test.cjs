const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { NextResponse } = require("next/server");
const root = path.resolve(__dirname, "..");
function runtime({
  db = null,
  session = null,
  fetchImpl = async () => {
    throw Error("Unexpected external request");
  },
  env = {},
} = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const m = { exports: {} };
    cache.set(file, m);
    const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
    }).outputText;
    const req = (n) => {
      if (n === "server-only") return {};
      if (n === "next/server") return { NextResponse };
      if (n === "@/lib/supabase/admin")
        return { createSupabaseAdminClient: () => db };
      if (n === "@/lib/demo-review-auth")
        return { getDemoReviewer: () => session };
      if (n === "@/lib/attio-demo-request")
        return { writeAttioDemoRequest: async () => "sent" };
      if (n.startsWith("@/")) {
        const base = path.join(root, n.slice(2));
        return load([base, base + ".ts", base + ".mjs"].find(fs.existsSync));
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
      AbortSignal,
      setTimeout,
      clearTimeout,
      fetch: fetchImpl,
      console,
    });
    return m.exports;
  }
  return (name) => load(path.join(root, name));
}
const valid = {
  ...runtime()("lib/demo-qualification.ts").EMPTY_DEMO,
  name: "Demo Test",
  email: "demo@example.com",
  website: "https://example.com",
  role: "Head of Growth",
  size: "10–50",
  goal: "Scale our existing outbound",
  service: "Self-serve",
  budget: "$350–$700/month",
  salesTeam: "2–5",
  sequencer: "HeyReach",
  volume: "1,000–5,000",
  submissionId: "ca87f89e-e51f-4248-9900-fcf6d7e084fd",
};
function request(body, origin = "http://localhost:3018") {
  return new Request(origin + "/api/demo-request", {
    method: "POST",
    headers: {
      host: new URL(origin).host,
      origin,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
for (const [budget, selfServe] of [
  ["$99/month only", true],
  ["$100–$349/month", true],
  ["$350–$700/month", false],
  ["Not sure yet", false],
])
  test(`budget ${budget}`, () => {
    const { parseQualification, isSelfServe } = runtime()(
      "lib/demo-qualification.ts",
    );
    const r = parseQualification({ ...valid, budget });
    assert.ok(r.ok);
    assert.equal(isSelfServe(r.value), selfServe);
  });
test("accepts bare domains and normalizes website addresses", () => {
  const { parseQualification } = runtime()("lib/demo-qualification.ts");
  for (const [website, expected] of [
    ["example.com", "https://example.com"],
    ["www.example.com/about", "https://www.example.com"],
    ["  example.com  ", "https://example.com"],
    ["http://example.com", "http://example.com"],
    ["https://example.com/about", "https://example.com"],
  ]) {
    const result = parseQualification({ ...valid, website });
    assert.ok(result.ok);
    assert.equal(result.value.website, expected);
  }
});
test("rejects old flow, unknown budget, invalid service budget and unsafe website", () => {
  const { parseQualification } = runtime()("lib/demo-qualification.ts");
  for (const x of [
    { ...valid, budget: "$1" },
    { ...valid, service: "White Glove" },
    { ...valid, website: "javascript:alert(1)" },
    { ...valid, website: "https://u:p@example.com" },
    {},
  ])
    assert.equal(parseQualification(x).ok, false);
});
test("low budget never touches storage or returns a calendar", async () => {
  const load = runtime({
    db: {
      from() {
        throw Error("No database write expected");
      },
    },
  });
  const r = await load("app/api/demo-request/route.ts").POST(
    request({ ...valid, budget: "$100–$349/month" }),
  );
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, route: "self_serve" });
});
test("high budget fails closed without durable storage", async () => {
  const r = await runtime()("app/api/demo-request/route.ts").POST(
    request(valid),
  );
  assert.equal(r.status, 503);
});
test("qualified request is persisted and returns only review admission", async () => {
  let saved;
  const db = {
    from: () => ({ insert: async (r) => ((saved = r), { error: null }) }),
  };
  const r = await runtime({ db })("app/api/demo-request/route.ts").POST(
    request(valid),
  );
  assert.equal(r.status, 200);
  assert.equal(saved.answers.budget, valid.budget);
  assert.deepEqual(await r.json(), { ok: true, route: "review" });
});
test("same submission retry is idempotent; changed body is refused", async () => {
  const hash = require("node:crypto")
    .createHash("sha256")
    .update(
      JSON.stringify(
        runtime()("lib/demo-qualification.ts").parseQualification(valid).value,
      ),
    )
    .digest("hex");
  const db = {
    from: () => ({
      insert: async () => ({ error: { code: "23505" } }),
      select: () => ({
        eq: () => ({ single: async () => ({ data: { request_hash: hash } }) }),
      }),
    }),
  };
  for (const [body, status] of [
    [valid, 200],
    [{ ...valid, role: "Other" }, 503],
  ]) {
    const r = await runtime({ db })("app/api/demo-request/route.ts").POST(
      request(body),
    );
    assert.equal(r.status, status);
  }
});
test("cross-origin submissions and unauthenticated approvals are refused", async () => {
  const req = request(valid);
  req.headers.set("origin", "https://evil.example");
  assert.equal(
    (await runtime()("app/api/demo-request/route.ts").POST(req)).status,
    403,
  );
  assert.equal(
    (
      await runtime()("app/api/demo-review/[id]/route.ts").POST(
        request({ action: "approve" }),
        { params: { id: valid.submissionId } },
      )
    ).status,
    403,
  );
});
test("approval refuses to mutate without email configuration", async () => {
  const load = runtime({
    db: {
      from() {
        throw Error("Must not mutate");
      },
    },
  });
  assert.equal(
    (
      await load("lib/demo-invitation.ts").approveDemo(
        valid.submissionId,
        "francois@pancake.ai",
        "",
      )
    ).ok,
    false,
  );
});
test("concurrent approvals send once and persist email acceptance", async () => {
  let claimed = false,
    sends = 0;
  const updates = [];
  const db = {
    from: () => ({
      update(value) {
        updates.push(value);
        const query = {
          eq() {
            return query;
          },
          select() {
            return query;
          },
          async maybeSingle() {
            if (claimed) return { data: null };
            claimed = true;
            return { data: { answers: valid } };
          },
          then(resolve) {
            return Promise.resolve({ error: null }).then(resolve);
          },
        };
        return query;
      },
    }),
  };
  const load = runtime({
    db,
    env: { SENDGRID_API_KEY: "test-only" },
    fetchImpl: async () => {
      sends++;
      return new Response(null, { status: 202 });
    },
  });
  const results = await Promise.all([
    load("lib/demo-invitation.ts").approveDemo(
      valid.submissionId,
      "francois@pancake.ai",
      "",
    ),
    load("lib/demo-invitation.ts").approveDemo(
      valid.submissionId,
      "francois@pancake.ai",
      "",
    ),
  ]);
  assert.equal(sends, 1);
  assert.equal(results.filter((r) => r.ok).length, 1);
  assert.ok(updates.some((u) => u.email_state === "sent"));
  assert.ok(!JSON.stringify(updates).includes("/demo/book/"));
});
