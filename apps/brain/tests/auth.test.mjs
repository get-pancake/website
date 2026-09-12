import assert from "node:assert/strict";
import test from "node:test";
import {
  APP_ORIGIN,
  AuthError,
  PREVIEW_AUTH_MESSAGE,
  createAuthClient,
  isAuthEnabled,
} from "../lib/auth.ts";

const production = { origin: "https://brain.getpancake.ai", deploymentEnvironment: "production" };

function recordingClient(responses, environment = production) {
  const requests = [];
  return {
    requests,
    client: createAuthClient(environment, async (url, options) => {
      requests.push({ url, ...options });
      const next = responses.shift();
      if (next instanceof Error) throw next;
      if (!next) throw new Error("Unexpected request");
      return next;
    }),
  };
}

test("auth requires the exact production Brain origin or an explicit exact test origin", () => {
  assert.equal(isAuthEnabled(production), true);
  for (const origin of ["https://brain.getpancake.ai.evil.example", "https://getpancake.ai", "http://brain.getpancake.ai", "https://brain.getpancake.ai/path", "https://user@brain.getpancake.ai", "https://brain.getpancake.ai?x=1", "not-a-url"]) {
    assert.equal(isAuthEnabled({ ...production, origin }), false, origin);
  }
  assert.equal(isAuthEnabled({ ...production, deploymentEnvironment: "preview" }), false);
  assert.equal(isAuthEnabled({ ...production, deploymentEnvironment: undefined }), false);
  assert.equal(isAuthEnabled({ origin: "http://localhost:3017", deploymentEnvironment: "development" }), false);
  assert.equal(isAuthEnabled({ origin: "http://localhost:3017", allowedOrigins: "https://preview.example, http://localhost:3017" }), true);
  assert.equal(isAuthEnabled({ origin: "https://unexpected.vercel.app", allowedOrigins: "https://expected.vercel.app" }), false);
});

test("all four auth operations refuse previews before any production request", async () => {
  const { client, requests } = recordingClient([], { ...production, deploymentEnvironment: "preview" });
  for (const operation of [() => client.captchaSiteKey(), () => client.requestMagicLink("test@example.com"), () => client.googleNonce(), () => client.googleLogin("signed-google-credential")]) {
    await assert.rejects(operation, (error) => error instanceof AuthError && error.message === PREVIEW_AUTH_MESSAGE);
  }
  assert.equal(requests.length, 0);
});

test("magic-link accepts 204 without JSON and sends shared cookies with only auth fields", async () => {
  const { client, requests } = recordingClient([Response.json({ siteKey: null }), new Response(null, { status: 204 })]);
  assert.equal(await client.captchaSiteKey(), null);
  assert.equal(await client.requestMagicLink(" founder@example.com "), undefined);
  assert.equal(requests[0].url, `${APP_ORIGIN}/auth/captcha`);
  assert.equal(requests[0].method, "GET");
  assert.equal(requests[1].url, `${APP_ORIGIN}/auth/magic-link/request`);
  assert.equal(requests[1].method, "POST");
  assert.deepEqual(JSON.parse(requests[1].body), { email: "founder@example.com" });
  for (const request of requests) {
    assert.equal(request.credentials, "include");
    assert.equal(request.cache, "no-store");
    assert.ok(request.signal instanceof AbortSignal);
  }
});

test("configured captcha token reaches the existing magic-link endpoint", async () => {
  const { client, requests } = recordingClient([Response.json({ siteKey: "public-site-key" }), new Response(null, { status: 204 })]);
  assert.equal(await client.captchaSiteKey(), "public-site-key");
  await client.requestMagicLink("founder@example.com", "one-use-captcha-token");
  assert.deepEqual(JSON.parse(requests[1].body), { email: "founder@example.com", captchaToken: "one-use-captcha-token" });
});

test("Google uses the nonce and existing GoogleIdToken login contract with credentials", async () => {
  const { client, requests } = recordingClient([Response.json({ nonce: "fresh-nonce" }), new Response(null, { status: 204 }), Response.json({ nonce: "retry-nonce" })]);
  assert.equal(await client.googleNonce(), "fresh-nonce");
  await client.googleLogin("signed-google-credential");
  assert.equal(await client.googleNonce(), "retry-nonce");
  assert.deepEqual(requests.map(({ url }) => url), [`${APP_ORIGIN}/auth/google/one-tap/start`, `${APP_ORIGIN}/auth/login`, `${APP_ORIGIN}/auth/google/one-tap/start`]);
  assert.deepEqual(JSON.parse(requests[1].body), { _tag: "GoogleIdToken", credential: "signed-google-credential" });
  assert.ok(requests.every((request) => request.method === "POST" && request.credentials === "include"));
});

test("missing captcha/nonce payloads cannot silently skip the security checks", async () => {
  for (const body of [{}, { siteKey: "" }, { siteKey: 42 }]) {
    const { client } = recordingClient([Response.json(body)]);
    await assert.rejects(() => client.captchaSiteKey(), AuthError);
  }
  const { client, requests } = recordingClient([Response.json({ nonce: "" })]);
  await assert.rejects(() => client.googleNonce(), AuthError);
  await assert.rejects(() => client.googleLogin("  "), AuthError);
  assert.equal(requests.length, 1);
});

test("rejections and transport failures stay failures, and retries issue fresh requests", async () => {
  for (const [status, phrase] of [[429, "Too many attempts"], [403, "security check"], [401, "Google sign-in"], [503, "couldn’t complete"]]) {
    const { client } = recordingClient([new Response(null, { status })]);
    await assert.rejects(() => client.requestMagicLink("test@example.com"), (error) => error.status === status && error.message.includes(phrase));
  }
  const { client, requests } = recordingClient([new TypeError("network error with private details"), new Response(null, { status: 204 })]);
  await assert.rejects(() => client.requestMagicLink("test@example.com"), (error) => error instanceof AuthError && !error.message.includes("private details"));
  await client.requestMagicLink("test@example.com");
  assert.equal(requests.length, 2);
});

