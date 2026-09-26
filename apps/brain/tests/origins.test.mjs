import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { DEFAULT_ORIGINS, resolveBrainOrigins } from "../lib/origins.mjs";

const app = fileURLToPath(new URL("..", import.meta.url));

test("with no variable set, the Brain keeps today's getpancake.ai origins", () => {
  assert.deepEqual({ ...resolveBrainOrigins({}) }, {
    brainOrigin: "https://brain.getpancake.ai",
    brainHost: "brain.getpancake.ai",
    appOrigin: "https://app.getpancake.ai",
    siteOrigin: "https://getpancake.ai",
  });
  assert.equal(resolveBrainOrigins({ NEXT_PUBLIC_BRAIN_ORIGIN: " " }).brainOrigin, DEFAULT_ORIGINS.brain);
});

test("the pancake.ai values move the Brain, the app and the footer links together", () => {
  assert.deepEqual(
    {
      ...resolveBrainOrigins({
        NEXT_PUBLIC_BRAIN_ORIGIN: "https://brain.pancake.ai/",
        NEXT_PUBLIC_APP_ORIGIN: "https://app.pancake.ai",
        NEXT_PUBLIC_SITE_ORIGIN: "https://pancake.ai",
      }),
    },
    {
      brainOrigin: "https://brain.pancake.ai",
      brainHost: "brain.pancake.ai",
      appOrigin: "https://app.pancake.ai",
      siteOrigin: "https://pancake.ai",
    },
  );
});

test("a Brain and an app on different sites fail the build: signup needs their shared cookies", () => {
  assert.throws(
    () => resolveBrainOrigins({ NEXT_PUBLIC_BRAIN_ORIGIN: "https://brain.pancake.ai" }),
    /must share one registrable domain/,
  );
  assert.throws(
    () => resolveBrainOrigins({ NEXT_PUBLIC_APP_ORIGIN: "https://app.pancake.ai" }),
    /must share one registrable domain/,
  );
  // Local testing against a local app stays possible.
  assert.equal(
    resolveBrainOrigins({ NEXT_PUBLIC_BRAIN_ORIGIN: "http://localhost:3017", NEXT_PUBLIC_APP_ORIGIN: "http://localhost:3000" })
      .appOrigin,
    "http://localhost:3000",
  );
});

test("a malformed origin fails loudly with the variable's name", () => {
  for (const value of [
    "brain.pancake.ai",
    "http://brain.pancake.ai",
    "https://brain.pancake.ai/path",
    "https://brain.pancake.ai/?q=1",
    "https://user:secret@brain.pancake.ai",
    "https://brain'.pancake.ai",
  ]) {
    assert.throws(
      () => resolveBrainOrigins({ NEXT_PUBLIC_BRAIN_ORIGIN: value, NEXT_PUBLIC_APP_ORIGIN: "https://app.pancake.ai" }),
      /NEXT_PUBLIC_BRAIN_ORIGIN must be a bare https origin/,
      value,
    );
  }
});

test("the environment reaches auth, the sign-up guard and the GTM guard", () => {
  const script = `
    const auth = await import("./lib/auth.ts");
    const { googleTagManagerBootstrap } = await import("./lib/google-tracking.ts");
    const production = { origin: "https://brain.pancake.ai", deploymentEnvironment: "production" };
    console.log(JSON.stringify({
      app: auth.APP_ORIGIN, brain: auth.BRAIN_ORIGIN, message: auth.PREVIEW_AUTH_MESSAGE,
      newOrigin: auth.isAuthEnabled(production),
      oldOrigin: auth.isAuthEnabled({ ...production, origin: "https://brain.getpancake.ai" }),
      gtmGuard: googleTagManagerBootstrap("production").includes("location.origin!=='https://brain.pancake.ai'"),
    }));`;
  const result = JSON.parse(
    execFileSync(process.execPath, ["--input-type=module", "-e", script], {
      cwd: app,
      env: {
        PATH: process.env.PATH,
        NEXT_PUBLIC_BRAIN_ORIGIN: "https://brain.pancake.ai",
        NEXT_PUBLIC_APP_ORIGIN: "https://app.pancake.ai",
      },
      encoding: "utf8",
    }),
  );
  assert.deepEqual(result, {
    app: "https://app.pancake.ai",
    brain: "https://brain.pancake.ai",
    message: "Preview build. Sign-up only works on brain.pancake.ai.",
    newOrigin: true,
    oldOrigin: false,
    gtmGuard: true,
  });
});
