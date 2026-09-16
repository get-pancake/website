/**
 * The ElevenLabs "AI sales" agent behind "Talk to AI sales" on /demo's
 * booking state (François, 2026-09-16: the agent exists and is published;
 * a visitor talks to it for qualification). Client-safe: no `server-only`,
 * no node imports, nothing touches `window` or `document` at module scope;
 * `loadAiSalesSdk` runs from a click.
 *
 * Where the agent lives: the ElevenLabs workspace, agent "[WEBSITE] AI
 * sales", published 2026-09-16 as a public agent (no auth, no signed URL).
 * It is a voice agent (chat mode off). Decision page:
 * decisions/2026-09-15-demo-page-and-ai-sales-agent.md in the pancake-brain
 * repo.
 *
 * How the call runs (François, 2026-09-16: "I want it to feel like you're
 * talking to the website, not a chatbar"): no ElevenLabs widget. The site
 * draws its own full-screen call (components/sections/demo/AiSalesCall.tsx)
 * and drives the conversation through ElevenLabs' browser SDK,
 * `@elevenlabs/client`, pinned to AI_SALES_SDK_VERSION.
 *
 * THIRD-PARTY RUNTIME DEPENDENCY (flagged in the PR per AGENTS.md: not an
 * npm package, nothing in package.json): the SDK is jsDelivr's ES module
 * build of `@elevenlabs/client@1.25.0` (built from the package's browser
 * entry, dist/platform/web/index.js). That module imports `livekit-client`
 * from the same jsDelivr host (the voice call is WebRTC through LiveKit).
 * The version is pinned in the URL, so a new ElevenLabs release never
 * reaches visitors without a code change; bump it on purpose and re-test a
 * call. No SRI: jsDelivr's +esm files are generated, and jsDelivr advises
 * against SRI on them. A failed LiveKit fetch cannot be retried without a
 * page reload (see failedImports). Nothing loads before the visitor
 * clicks: a visitor who never clicks never contacts jsDelivr, LiveKit or
 * ElevenLabs. No analytics events fire here (AGENTS.md: analytics changes
 * need explicit scope).
 *
 * SDK contract: https://elevenlabs.io/docs/eleven-agents/libraries/java-script
 */

import { NAME_MAX, WEBSITE_MAX } from "@/lib/demo-request";

/** The published agent's public id (not a secret: it is in the page's
    JavaScript either way). NEXT_PUBLIC_ELEVENLABS_AI_SALES_AGENT_ID, inlined
    at build time, swaps it; an empty value turns the feature off. */
const DEFAULT_AGENT_ID = "agent_3201m2mgwww3fp5s40r1fkgrvfw9";

/** null = the feature is off: the pill renders inert and nothing loads. */
export const AI_SALES_AGENT_ID: string | null =
  (process.env.NEXT_PUBLIC_ELEVENLABS_AI_SALES_AGENT_ID ?? DEFAULT_AGENT_ID).trim() || null;

export const AI_SALES_ENABLED = AI_SALES_AGENT_ID !== null;

/** Pinned on purpose (see the header): change it only with a tested call. */
export const AI_SALES_SDK_VERSION = "1.25.0";
export const AI_SALES_SDK_URL = `https://cdn.jsdelivr.net/npm/@elevenlabs/client@${AI_SALES_SDK_VERSION}/+esm`;

/** A cold jsDelivr fetch of the SDK plus LiveKit (two modules), with margin;
    past that the call shows the failure state and "Try again" waits on the
    same, still running, import. */
const SDK_TIMEOUT_MS = 10_000;

/** What the agent may know about the visitor: the first name and the
    normalised company website of the successful demo request, so the agent
    can greet and qualify. Nothing else (no email, no answers). The agent's
    prompt requires no variable, so both are optional. */
export type AiSalesVisitor = { firstName?: string; website?: string };

type DynamicVariables = { first_name?: string; company_website?: string };

/** Trimmed and capped at the form's own limits; undefined when empty. */
function trimmed(value: string | undefined, max: number): string | undefined {
  const clean = value?.trim().slice(0, max).trim();
  return clean ? clean : undefined;
}

/** The session's `dynamicVariables`: only the keys that have a value, null
    when there is nothing to pass (the option is then left off). */
export function aiSalesDynamicVariables(visitor: AiSalesVisitor): DynamicVariables | null {
  const first_name = trimmed(visitor.firstName, NAME_MAX);
  const company_website = trimmed(visitor.website, WEBSITE_MAX);
  if (!first_name && !company_website) return null;
  return {
    ...(first_name ? { first_name } : {}),
    ...(company_website ? { company_website } : {}),
  };
}

/* ── the slice of @elevenlabs/client 1.25.0 the call uses ──
   Written here instead of importing the package's types: the SDK is not an
   npm dependency. Mirrors dist/types.d.ts, dist/BaseConversation.d.ts,
   dist/VoiceConversation.d.ts and dist/utils/BaseConnection.d.ts. */

export type AiSalesMode = "speaking" | "listening";

/** DisconnectionDetails, narrowed to what the call reads. */
export type AiSalesDisconnect =
  | { reason: "error"; message: string }
  | { reason: "agent" }
  | { reason: "user" };

export type AiSalesSessionOptions = {
  agentId: string;
  /** Voice goes over WebRTC (LiveKit); the SDK's own default for a voice
      session with an agent id, written out so the transport is on record. */
  connectionType: "webrtc";
  dynamicVariables?: DynamicVariables;
  /** Fires just before startSession resolves. */
  onConnect?: (props: { conversationId: string }) => void;
  onDisconnect?: (details: AiSalesDisconnect) => void;
  onModeChange?: (props: { mode: AiSalesMode }) => void;
};

/** A VoiceConversation, as far as the call is concerned. */
export interface AiSalesSession {
  endSession(): Promise<void>;
  setMicMuted(isMuted: boolean): void;
  /** 0..1: the mean of the voice-range frequency bins (speech sits low in it). */
  getInputVolume(): number;
  getOutputVolume(): number;
}

/** The SDK's `Conversation` namespace. startSession asks for the microphone
    (getUserMedia rejects with a NotAllowedError when the visitor or the
    browser refuses), connects, and rejects on any setup failure. It cannot
    be cancelled once called, so AiSalesCall asks for the microphone first. */
export interface AiSalesSdk {
  startSession(options: AiSalesSessionOptions): Promise<AiSalesSession>;
}

function sdkFrom(module: unknown): AiSalesSdk | null {
  if (typeof module !== "object" || module === null || !("Conversation" in module)) return null;
  const conversation = (module as { Conversation: unknown }).Conversation;
  if (typeof conversation !== "object" || conversation === null) return null;
  return typeof (conversation as { startSession?: unknown }).startSession === "function"
    ? (conversation as AiSalesSdk)
    : null;
}

let sdkReady: Promise<AiSalesSdk> | null = null;
/** Bumped after a failed import (not after a timeout): Chromium keeps a
    failed module fetch in the document's module map, so the same URL would
    fail again without touching the network. jsDelivr ignores the query.
    The query only helps when the SDK module itself failed. The SDK imports
    LiveKit from a fixed absolute path (`/npm/livekit-client@2.22.3/+esm`
    when checked on 2026-09-16, a separate module of about 584 KB) that no
    query can change: when that nested fetch is the one that failed (a
    flaky mobile network), every Try again fails at once until the page is
    reloaded. Flagged in the PR. */
let failedImports = 0;

/**
 * Load the SDK once and return its `Conversation` namespace. Memoised: the
 * second call, and every call while the first is in flight, share one
 * import. Rejects when the import fails, the module is not the expected
 * shape, or after SDK_TIMEOUT_MS; a rejection clears the memo so the next
 * click tries again. That retry recovers from a failed or slow SDK fetch,
 * not from a failed LiveKit fetch (see failedImports). A timed-out import
 * keeps running (an import cannot be cancelled), and the retry, on the same
 * URL, joins it.
 */
export function loadAiSalesSdk(): Promise<AiSalesSdk> {
  if (sdkReady) return sdkReady;
  const url = failedImports === 0 ? AI_SALES_SDK_URL : `${AI_SALES_SDK_URL}?retry=${failedImports}`;
  const attempt = new Promise<AiSalesSdk>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI sales: the SDK timed out")), SDK_TIMEOUT_MS);
    // webpackIgnore: the browser fetches the URL itself at runtime; webpack
    // must neither bundle nor rewrite it.
    import(/* webpackIgnore: true */ url).then(
      (module: unknown) => {
        clearTimeout(timer);
        const sdk = sdkFrom(module);
        if (sdk) resolve(sdk);
        else reject(new Error("AI sales: the SDK module has no Conversation.startSession"));
      },
      (error: unknown) => {
        clearTimeout(timer);
        failedImports += 1;
        reject(error instanceof Error ? error : new Error("AI sales: the SDK failed to load"));
      },
    );
  });
  sdkReady = attempt;
  attempt.catch(() => {
    if (sdkReady === attempt) sdkReady = null;
  });
  return attempt;
}
