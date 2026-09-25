import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  DEFAULT_ORIGINS,
  isProductionSiteHost,
  PANCAKE_DOMAINS,
  resolveSiteConfig,
  isStaffGoogleIdentity,
  staffEmailDomains,
} from "../lib/site-config.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

test("with no variable set, every origin is today's getpancake.ai host", () => {
  const config = resolveSiteConfig({});
  assert.deepEqual(
    {
      site: config.siteOrigin,
      app: config.appOrigin,
      analyticsIngest: config.analyticsIngestOrigin,
      posthog: config.posthogOrigin,
      leadJourney: config.leadJourneyOrigin,
      squads: config.squadsOrigin,
    },
    {
      site: "https://getpancake.ai",
      app: "https://app.getpancake.ai",
      analyticsIngest: "https://beta-api.getpancake.ai",
      posthog: "https://e.getpancake.ai",
      leadJourney: "https://t.getpancake.ai",
      squads: "https://squads.getpancake.ai",
    },
  );
  assert.equal(config.siteHost, "getpancake.ai");
  assert.equal(resolveSiteConfig({ NEXT_PUBLIC_SITE_ORIGIN: "  " }).siteOrigin, DEFAULT_ORIGINS.site);
});

test("the cutover values move the site, app and ingest; provider hosts wait for their own variables", () => {
  const config = resolveSiteConfig({
    NEXT_PUBLIC_SITE_ORIGIN: "https://pancake.ai/",
    NEXT_PUBLIC_APP_ORIGIN: " https://app.pancake.ai ",
    NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN: "https://beta-api.pancake.ai",
  });
  assert.equal(config.siteOrigin, "https://pancake.ai");
  assert.equal(config.siteHost, "pancake.ai");
  assert.equal(config.appOrigin, "https://app.pancake.ai");
  assert.equal(config.analyticsIngestOrigin, "https://beta-api.pancake.ai");
  assert.equal(config.posthogOrigin, "https://e.getpancake.ai");
  assert.equal(config.leadJourneyOrigin, "https://t.getpancake.ai");
});

test("a malformed origin fails loudly with the variable's name", () => {
  for (const value of [
    "pancake.ai",
    "http://pancake.ai",
    "https://pancake.ai/path",
    "https://pancake.ai/?q=1",
    "https://pancake.ai/#top",
    "https://user:secret@pancake.ai",
    "https://pan'cake.ai",
    "not a url",
  ]) {
    assert.throws(
      () => resolveSiteConfig({ NEXT_PUBLIC_APP_ORIGIN: value }),
      /NEXT_PUBLIC_APP_ORIGIN must be a bare https origin/,
      value,
    );
  }
  // Plain http only on loopback, for local development.
  assert.equal(resolveSiteConfig({ NEXT_PUBLIC_APP_ORIGIN: "http://localhost:5173" }).appOrigin, "http://localhost:5173");
});

test("request guards accept both domains, apex and www, and nothing else", () => {
  for (const host of ["getpancake.ai", "www.getpancake.ai", "pancake.ai", "www.pancake.ai", "PANCAKE.AI", " www.Pancake.ai "]) {
    assert.equal(isProductionSiteHost(host), true, host);
  }
  for (const host of [
    "app.pancake.ai",
    "app.getpancake.ai",
    "brain.pancake.ai",
    "pancake.ai.example.com",
    "notpancake.ai",
    "getpancake.ai.",
    "pancake-git-main-getpancake.vercel.app",
    "localhost",
    "",
  ]) {
    assert.equal(isProductionSiteHost(host), false, host);
  }
});

test("the canonical host is always a production host", () => {
  const hosts = (env) => [...resolveSiteConfig(env).productionHosts].sort();
  const families = ["getpancake.ai", "pancake.ai", "www.getpancake.ai", "www.pancake.ai"];
  assert.deepEqual(hosts({}), families);
  assert.deepEqual(hosts({ NEXT_PUBLIC_SITE_ORIGIN: "https://pancake.ai" }), families);
  assert.deepEqual(hosts({ NEXT_PUBLIC_SITE_ORIGIN: "https://staging.example.com" }), [...families, "staging.example.com"].sort());
});

test("staff emails on both company domains are allowed unless an explicit list overrides them", () => {
  assert.deepEqual([...PANCAKE_DOMAINS], ["getpancake.ai", "pancake.ai"]);
  assert.deepEqual([...staffEmailDomains(undefined)], ["getpancake.ai", "pancake.ai"]);
  assert.deepEqual([...staffEmailDomains(" Example.com, pancake.ai ,")], ["example.com", "pancake.ai"]);
  // A variable that is set but empty keeps failing closed, as before.
  assert.deepEqual([...staffEmailDomains("")], []);
});

test("the environment reaches the module and next.config.mjs redirects", () => {
  const script = `
    const config = await import("./lib/site-config.mjs");
    const next = (await import("./next.config.mjs")).default;
    const redirects = await next.redirects();
    const toApp = redirects.filter((r) => ["/signup", "/login", "/signin", "/sign-in"].includes(r.source));
    console.log(JSON.stringify({
      site: config.SITE_ORIGIN, host: config.SITE_HOST, app: config.APP_ORIGIN,
      ingest: config.ANALYTICS_INGEST_ORIGIN, posthog: config.POSTHOG_ORIGIN,
      destinations: [...new Set(toApp.map((r) => r.destination))], count: toApp.length,
    }));`;
  const run = (env) =>
    JSON.parse(
      execFileSync(process.execPath, ["--input-type=module", "-e", script], {
        cwd: root,
        env: { PATH: process.env.PATH, ...env },
        encoding: "utf8",
      }),
    );

  assert.deepEqual(run({}), {
    site: "https://getpancake.ai",
    host: "getpancake.ai",
    app: "https://app.getpancake.ai",
    ingest: "https://beta-api.getpancake.ai",
    posthog: "https://e.getpancake.ai",
    destinations: ["https://app.getpancake.ai"],
    count: 4,
  });
  assert.deepEqual(
    run({
      NEXT_PUBLIC_SITE_ORIGIN: "https://pancake.ai",
      NEXT_PUBLIC_APP_ORIGIN: "https://app.pancake.ai",
      NEXT_PUBLIC_ANALYTICS_INGEST_ORIGIN: "https://beta-api.pancake.ai",
    }),
    {
      site: "https://pancake.ai",
      host: "pancake.ai",
      app: "https://app.pancake.ai",
      ingest: "https://beta-api.pancake.ai",
      posthog: "https://e.getpancake.ai",
      destinations: ["https://app.pancake.ai"],
      count: 4,
    },
  );
});

test("no active source hard-codes a getpancake.ai URL outside lib/site-config.mjs", () => {
  // A quoted absolute URL on getpancake.ai or one of its subdomains. Comments, email
  // addresses and social handles (x.com/getpancake_ai) do not match.
  const hardCoded = /["'`]https?:\/\/([a-z0-9-]+\.)*getpancake\.ai(?![a-z0-9-])/i;
  const skip = new Set(["lib/site-config.mjs"]);
  const skipDirs = new Set(["app/_influencers"]); // archived page, not routed (next.config.mjs redirects it)
  const offenders = [];

  const walk = (dir) => {
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!skipDirs.has(path)) walk(path);
      } else if (/\.(tsx?|mjs|js)$/.test(entry.name) && !/\.test\./.test(entry.name) && !skip.has(path)) {
        readFileSync(join(root, path), "utf8")
          .split("\n")
          .forEach((line, index) => {
            if (hardCoded.test(line)) offenders.push(`${relative(".", path)}:${index + 1}: ${line.trim()}`);
          });
      }
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(dir);
  walk("scripts");
  if (hardCoded.test(readFileSync(join(root, "next.config.mjs"), "utf8"))) offenders.push("next.config.mjs");

  assert.deepEqual(offenders, [], "use the origins from lib/site-config.mjs instead");
});

test("staff sign-in needs a Workspace-managed account on a staff domain (PAN-1318)", () => {
  const domains = staffEmailDomains(undefined);
  const staff = (email, hd, email_verified = true) =>
    isStaffGoogleIdentity({ email, hd, email_verified }, domains);
  assert.equal(staff("ada@getpancake.ai", "getpancake.ai"), true);
  assert.equal(staff("ada@pancake.ai", "pancake.ai"), true);
  // A secondary-domain account in the getpancake.ai organization.
  assert.equal(staff("ada@pancake.ai", "getpancake.ai"), true);
  // An unmanaged Google account on the domain has no hd claim: refused.
  assert.equal(staff("previous-owner@pancake.ai", undefined), false);
  assert.equal(staff("ada@pancake.ai", "pancake.ai", false), false);
  assert.equal(staff("ada@evilpancake.ai", "evilpancake.ai"), false);
  assert.equal(staff("ada@example.com", "pancake.ai"), false);
  assert.equal(staff("ada@pancake.ai", "example.com"), false);
  assert.equal(isStaffGoogleIdentity({ email: "ada@pancake.ai", hd: "pancake.ai", email_verified: true }, []), false);
});
