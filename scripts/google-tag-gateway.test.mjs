import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  GOOGLE_TAG_GATEWAY_PATH,
  GOOGLE_TAG_MANAGER_FALLBACK_URL,
  googleTagGatewayHost,
  googleTagGatewayRequestHeaders,
  googleTagGatewayUpstream,
  tagManagerSourceJs,
} from "../lib/analytics/google-tag-gateway.mjs";

const GTM_ID = "GTM-P3Z79WKD";

test("the path follows Google's rules: unused shape, not the root, short, no /gtm", () => {
  assert.match(GOOGLE_TAG_GATEWAY_PATH, /^\/[a-z0-9]+$/);
  assert.ok(GOOGLE_TAG_GATEWAY_PATH.length <= 100);
  assert.ok(!GOOGLE_TAG_GATEWAY_PATH.includes("/gtm"));
});

test("middleware.ts matches exactly the gateway path and what is under it", () => {
  const source = fs.readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
  const matcher = source.match(/matcher:\s*\[([^\]]*)\]/);
  assert.ok(matcher, "middleware.ts has a matcher");
  const entries = [...matcher[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(entries, [GOOGLE_TAG_GATEWAY_PATH, `${GOOGLE_TAG_GATEWAY_PATH}/:path*`]);
});

test("the container's endpoint is its lowercase id under fps.goog", () => {
  assert.equal(googleTagGatewayHost(GTM_ID), "gtm-p3z79wkd.fps.goog");
  assert.equal(googleTagGatewayHost("G-6KWBYRZSDX"), "g-6kwbyrzsdx.fps.goog");
  assert.throws(() => googleTagGatewayHost("evil.example.com/x"));
  assert.throws(() => googleTagGatewayHost(""));
});

test("the bare path gets its trailing slash back; deeper paths and queries pass unchanged", () => {
  assert.equal(
    googleTagGatewayUpstream(GTM_ID, "/pk7x", "?id=GTM-P3Z79WKD"),
    "https://gtm-p3z79wkd.fps.goog/pk7x/?id=GTM-P3Z79WKD",
  );
  assert.equal(googleTagGatewayUpstream(GTM_ID, "/pk7x", ""), "https://gtm-p3z79wkd.fps.goog/pk7x/");
  assert.equal(googleTagGatewayUpstream(GTM_ID, "/pk7x/healthy", ""), "https://gtm-p3z79wkd.fps.goog/pk7x/healthy");
  assert.equal(
    googleTagGatewayUpstream(GTM_ID, "/pk7x/g/collect", "?v=2&tid=G-6KWBYRZSDX"),
    "https://gtm-p3z79wkd.fps.goog/pk7x/g/collect?v=2&tid=G-6KWBYRZSDX",
  );
});

test("any other path is not forwarded", () => {
  for (const path of ["/", "/pk7xyz", "/pricing", "/learn/pk7x", "/pk"]) {
    assert.equal(googleTagGatewayUpstream(GTM_ID, path, "?id=x"), null, path);
  }
});

/** Headers as Vercel hands them to the middleware for a visitor in São Paulo. */
const vercelRequest = () =>
  new Headers({
    host: "pancake.ai",
    cookie: "_ga=GA1.1.123.456; pancake_attribution=%7B%7D",
    "user-agent": "Mozilla/5.0",
    "accept-language": "pt-BR",
    referer: "https://pancake.ai/pricing",
    "x-forwarded-for": "203.0.113.7",
    "x-real-ip": "203.0.113.7",
    "x-forwarded-host": "pancake.ai",
    "x-vercel-ip-country": "BR",
    "x-vercel-ip-country-region": "SP",
    "x-vercel-ip-city": "S%C3%A3o%20Paulo",
    "x-vercel-ip-latitude": "-23.5475",
    "x-vercel-ip-longitude": "-46.6361",
    "x-vercel-id": "gru1::abc",
    "x-vercel-oidc-token": "secret-token",
    "x-middleware-subrequest": "middleware",
  });

test("the forward carries the visitor's cookies, browser and location in Google's header names", () => {
  const headers = googleTagGatewayRequestHeaders(GTM_ID, vercelRequest());
  assert.equal(headers.get("host"), "gtm-p3z79wkd.fps.goog");
  assert.equal(headers.get("cookie"), "_ga=GA1.1.123.456; pancake_attribution=%7B%7D");
  assert.equal(headers.get("user-agent"), "Mozilla/5.0");
  assert.equal(headers.get("accept-language"), "pt-BR");
  assert.equal(headers.get("referer"), "https://pancake.ai/pricing");
  assert.equal(headers.get("x-forwarded-for"), "203.0.113.7");
  assert.equal(headers.get("x-forwarded-country"), "BR");
  assert.equal(headers.get("x-forwarded-region"), "SP");
  assert.equal(headers.get("x-forwarded-geolocation"), "latlong=-23.5475,-46.6361;city=Sao Paulo");
});

test("Vercel's internal headers never reach Google", () => {
  const headers = googleTagGatewayRequestHeaders(GTM_ID, vercelRequest());
  for (const [name] of headers) {
    assert.ok(!name.startsWith("x-vercel-"), name);
    assert.ok(!name.startsWith("x-middleware-"), name);
  }
});

test("missing or malformed location headers are left out, never guessed", () => {
  const none = googleTagGatewayRequestHeaders(GTM_ID, new Headers({ host: "pancake.ai" }));
  assert.equal(none.get("x-forwarded-country"), null);
  assert.equal(none.get("x-forwarded-region"), null);
  assert.equal(none.get("x-forwarded-geolocation"), null);
  assert.equal(none.get("x-forwarded-for"), null);

  const bad = googleTagGatewayRequestHeaders(
    GTM_ID,
    new Headers({
      "x-vercel-ip-country": "Brazil",
      "x-vercel-ip-country-region": "SP",
      "x-vercel-ip-latitude": "south",
      "x-vercel-ip-longitude": "-46.6",
    }),
  );
  assert.equal(bad.get("x-forwarded-country"), null);
  assert.equal(bad.get("x-forwarded-region"), null, "no region without a country");
  assert.equal(bad.get("x-forwarded-geolocation"), null);

  const countryOnly = googleTagGatewayRequestHeaders(GTM_ID, new Headers({ "x-vercel-ip-country": "fr" }));
  assert.equal(countryOnly.get("x-forwarded-country"), "FR");
  assert.equal(countryOnly.get("x-forwarded-region"), null);
});

test("a city that is not plain text is cleaned or dropped, never sent raw", () => {
  const withCity = (city) =>
    googleTagGatewayRequestHeaders(
      GTM_ID,
      new Headers({ "x-vercel-ip-latitude": "52.37", "x-vercel-ip-longitude": "4.89", "x-vercel-ip-city": city }),
    ).get("x-forwarded-geolocation");
  assert.equal(withCity("Z%C3%BCrich"), "latlong=52.37,4.89;city=Zurich");
  assert.equal(withCity("%E6%9D%B1%E4%BA%AC"), "latlong=52.37,4.89");
  assert.equal(withCity("Bad%ZZcity;x=1"), "latlong=52.37,4.89;city=BadZZcityx1");
});

/** Runs the bootstrap the way app/layout.tsx and /pancake-tags.js do, in a browser stand-in. */
function bootstrap(id = GTM_ID) {
  const inserted = [];
  const document = {
    createElement: (tag) => ({ tag }),
    getElementsByTagName: () => [{ parentNode: { insertBefore: (node) => inserted.push(node) } }],
  };
  const window = {};
  new Function(
    "window",
    "document",
    `(function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;${tagManagerSourceJs()}f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`,
  )(window, document);
  return inserted;
}

test("the container loads from the gateway path on our own domain", () => {
  const inserted = bootstrap();
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].src, "/pk7x?id=GTM-P3Z79WKD");
  assert.equal(inserted[0].async, true);
});

test("if the gateway path fails, the container loads from Google's own address once", () => {
  const inserted = bootstrap();
  inserted[0].onerror();
  assert.equal(inserted.length, 2);
  assert.equal(inserted[1].src, `${GOOGLE_TAG_MANAGER_FALLBACK_URL}GTM-P3Z79WKD`);
  assert.equal(inserted[1].src, "https://www.googletagmanager.com/gtm.js?id=GTM-P3Z79WKD");
  assert.equal(inserted[1].async, true);
  assert.equal(inserted[1].onerror, undefined, "no second fallback");
});
