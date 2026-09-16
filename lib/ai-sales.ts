/**
 * The ElevenLabs "AI sales" agent behind "Talk to Pancake" on /demo's
 * booking state (François, 2026-09-16: the agent exists and is published;
 * a visitor talks to it for qualification). Client-safe: no `server-only`,
 * no node imports, nothing touches `window` or `document` at module scope;
 * `loadAiSalesSdk` runs from a click.
 *
 * Where the agent lives: the ElevenLabs workspace, agent "[WEBSITE] AI
 * sales", published 2026-09-16 as a public agent (no auth, no signed URL).
 * It is a voice agent (chat mode off). Decision page:
 * decisions/2026-09-15-demo-page-and-ai-sales-agent.md in the pancake-brain
 * repo. Since 2026-09-16 it fills the demo form by voice and opens the
 * visitor's chosen Calendly time on the page (see aiSalesDynamicVariables):
 * the visitor's name, website and answers go to ElevenLabs with the
 * session; the typed email does not.
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

import { demoBookingDestination, type DemoBookingAnswers, type DemoBookingDestinationKey } from "@/lib/booking";
import {
  NAME_MAX,
  WEBSITE_MAX,
  type DemoRequestField,
  type DemoRequestPartial,
} from "@/lib/demo-request";

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

/**
 * What the agent knows about the visitor when the call starts, and what it
 * learns during the call.
 *
 * The call opens from either form step or from the calendar (François,
 * 2026-09-16: talk to Pancake "instead" of typing, "on both steps of the
 * form"). It starts with every answer that is valid so far
 * (lib/demo-request.ts parsePartialDemoRequest); a missing one is "". The
 * agent asks for the rest, then calls the browser tool
 * AI_SALES_FORM_TOOL: the page validates the answers with the form's own
 * parser, sends the same /api/demo-request, and moves to the routed
 * calendar behind the call (DemoForm). The tool's result carries the
 * booking values below.
 *
 * Picking a time (François, 2026-09-16: "ok not to do the full booking but
 * redirect where you see fit, with as much of the work already done as
 * possible"): the agent reads open times with the ElevenLabs Calendly
 * integration ("List event type available times" only; François's personal
 * access token is stored in ElevenLabs, never in this repo; its event type
 * parameter is the Variable booking_event_type, never the model's). When
 * the visitor picks one, the agent calls the browser tool AI_SALES_SLOT_TOOL
 * and the page opens that time's Calendly booking page in the card, with
 * name, email and answers filled in (lib/booking.ts demoBookingSlot); the
 * visitor confirms it themselves once the call closes. The agent no longer
 * books through Calendly's API: tested 2026-09-16, Calendly refuses API
 * bookings while an event type requires email verification ("The
 * verification code provided is invalid or missing."), and the group demo
 * and the discovery call do.
 *
 * Every key is always sent (ElevenLabs refuses to start a conversation
 * when a variable the agent uses is missing). Keep the names in step with
 * the agent in ElevenLabs.
 */
export type AiSalesDynamicVariables = {
  first_name: string;
  last_name: string;
  /** "yes" when the form has a valid email; the address itself stays on the page */
  email_known: "yes" | "no";
  company_website: string;
  /** lib/demo-request.ts TEAM_SIZES, or "" */
  team_size: string;
  /** "Yes" / "No", or "" */
  has_pancake_account: string;
  /** the goal option's label, or "" */
  goal: string;
  /** IANA time zone, e.g. "Europe/Paris" ("UTC" when the browser has none) */
  visitor_timezone: string;
  /** the visitor's local date and time at the start of the call, with its
      UTC offset, e.g. "Wednesday, September 16, 2026 at 5:04 PM GMT+02:00":
      the anchor the agent converts Calendly's UTC slots with */
  visitor_local_time: string;
} & AiSalesBookingVariables;

/** The values the times tool reads: empty until the request is sent (a
    time is only opened after a sent request, so the team is notified). */
export type AiSalesBookingVariables = {
  /** "yes" once /api/demo-request was sent for these answers, else "no" */
  form_sent: "yes" | "no";
  /** the routed calendar's Calendly API URI (lib/booking.ts eventTypeUri) */
  booking_event_type: string;
  /** what the page calls that calendar: "group demo", "discovery call", … */
  booking_meeting_name: string;
};

/** What the page calls each calendar (components/sections/demo/demo-copy.ts BOOKING.calendar). */
export type AiSalesMeetingNames = Readonly<Record<DemoBookingDestinationKey, string>>;

/** Trimmed and capped at the form's own limits. */
function capped(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max).trim();
}

/** The browser's IANA time zone; "UTC" when it has none or cannot use it
    ("Etc/Unknown" on some systems). Browser only. */
export function visitorTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof zone !== "string" || !zone || zone === "Etc/Unknown") return "UTC";
    new Intl.DateTimeFormat("en-US", { timeZone: zone }); // throws on a zone this engine cannot use
    return zone;
  } catch {
    return "UTC";
  }
}

/** `now` in `timeZone`, spelled out with its UTC offset. Pure. */
export function localTimeLabel(now: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "longOffset",
    }).format(now);
  } catch {
    return now.toISOString();
  }
}

/** The booking values for a complete request. Pure. */
export function aiSalesBookingVariables(answers: DemoBookingAnswers, meetingNames: AiSalesMeetingNames): AiSalesBookingVariables {
  const destination = demoBookingDestination(answers.teamSize);
  return {
    form_sent: "yes",
    booking_event_type: destination.eventTypeUri,
    booking_meeting_name: meetingNames[destination.key],
  };
}

const NO_BOOKING: AiSalesBookingVariables = {
  form_sent: "no",
  booking_event_type: "",
  booking_meeting_name: "",
};

/** The session's `dynamicVariables`: the answers known so far ("" for the
    others) and, when the request was already sent (`sent`: the call opened
    from the calendar), the booking values. Pure (the time zone, the clock
    and the page's calendar names are passed in). */
export function aiSalesDynamicVariables(
  known: DemoRequestPartial,
  { sent, timeZone, now, meetingNames }: { sent: boolean; timeZone: string; now: Date; meetingNames: AiSalesMeetingNames },
): AiSalesDynamicVariables {
  const complete = sent ? completeAnswers(known) : null;
  const zone = timeZone || "UTC";
  return {
    first_name: capped(known.firstName, NAME_MAX),
    last_name: capped(known.lastName, NAME_MAX),
    email_known: known.email ? "yes" : "no",
    company_website: capped(known.website, WEBSITE_MAX),
    team_size: known.teamSize ?? "",
    has_pancake_account: known.hasAccount === "yes" ? "Yes" : known.hasAccount === "no" ? "No" : "",
    goal: known.goal ?? "",
    visitor_timezone: zone,
    visitor_local_time: localTimeLabel(now, zone),
    ...(complete ? aiSalesBookingVariables(complete, meetingNames) : NO_BOOKING),
  };
}

/** The booking answers when every required one is known; null otherwise. */
export function completeAnswers(known: DemoRequestPartial): DemoBookingAnswers | null {
  const { firstName, lastName, email, website, teamSize, hasAccount, goal } = known;
  if (!firstName || !lastName || !email || !website || !teamSize || !hasAccount) return null;
  return { firstName, lastName, email, website, teamSize, hasAccount, ...(goal ? { goal } : {}) };
}

/**
 * The browser tool the agent calls with the answers it collected (declared
 * as a Client tool on the agent, "wait for response" on). Parameters, all
 * strings: first_name, last_name, email, company_website, team_size (one of
 * lib/demo-request.ts TEAM_SIZES), has_pancake_account ("yes" / "no"),
 * goal (one of GOALS, or empty). The page answers with
 * AiSalesFormToolResult, JSON-encoded.
 */
export const AI_SALES_FORM_TOOL = "submit_demo_request";

export type AiSalesFormToolParams = Partial<
  Record<"first_name" | "last_name" | "email" | "company_website" | "team_size" | "has_pancake_account" | "goal", unknown>
>;

/** The tool's answer. On success it repeats the cleaned answers and the
    booking values: the agent's tool assignments copy them into the
    dynamic variables the prompt and the times tool read (ElevenLabs
    "Dynamic Variable Assignments", value paths like
    `response.booking_event_type`). The email is not repeated. */
export type AiSalesFormToolResult =
  | ({
      ok: true;
      message: string;
      first_name: string;
      last_name: string;
      email_known: "yes";
      company_website: string;
      team_size: string;
      has_pancake_account: string;
      goal: string;
    } & AiSalesBookingVariables)
  | { ok: false; field: string; message: string };

/** The tool's parameters as the form's own field names, for parseDemoRequest. */
export function formToolInput(params: AiSalesFormToolParams): Record<string, unknown> {
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  return {
    firstName: text(params.first_name),
    lastName: text(params.last_name),
    email: text(params.email),
    website: text(params.company_website),
    teamSize: text(params.team_size).trim(),
    hasAccount: text(params.has_pancake_account).trim().toLowerCase(),
    goal: text(params.goal).trim(),
  };
}

/** The form's field names back to the tool's parameter names, for errors. */
export const FORM_TOOL_PARAM: Readonly<Record<DemoRequestField, string>> = {
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  website: "company_website",
  teamSize: "team_size",
  hasAccount: "has_pancake_account",
  goal: "goal",
  submissionId: "email",
};

/**
 * The browser tool the agent calls once the visitor has picked and confirmed
 * an open time (declared as a Client tool on the agent, "wait for
 * response" on). One string parameter, start_time: the slot's start_time
 * exactly as "List event type available times" returned it. The page opens
 * that time's booking page on the routed calendar (DemoForm, DemoBooking)
 * and answers with AiSalesSlotToolResult, JSON-encoded; the call then
 * closes by itself once the agent has said so (AiSalesCall).
 */
export const AI_SALES_SLOT_TOOL = "open_booking_time";

export type AiSalesSlotToolParams = Partial<Record<"start_time", unknown>>;

export type AiSalesSlotToolResult =
  /** local_start: the time as the visitor's clock reads it, for the agent to repeat */
  | { ok: true; message: string; local_start: string }
  | { ok: false; message: string };

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
  dynamicVariables?: AiSalesDynamicVariables;
  /** Fires just before startSession resolves. */
  onConnect?: (props: { conversationId: string }) => void;
  onDisconnect?: (details: AiSalesDisconnect) => void;
  onModeChange?: (props: { mode: AiSalesMode }) => void;
  /** Browser tools the agent can call; the returned string goes back to it. */
  clientTools?: Record<string, (parameters: Record<string, unknown> | undefined) => Promise<string>>;
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
