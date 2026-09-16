/**
 * The ElevenLabs "AI sales" agent behind "Chat with AI sales" on /demo's
 * booking state (François, 2026-09-16: the agent exists and is published;
 * a visitor talks to it for qualification). Client-safe: no `server-only`,
 * no node imports; `openAiSales` touches `document` and runs from a click.
 *
 * Where the agent lives: the ElevenLabs workspace, agent "[WEBSITE] AI
 * sales", published 2026-09-16 as a public agent (no auth, no signed URL).
 * Decision page: decisions/2026-09-15-demo-page-and-ai-sales-agent.md in
 * the pancake-brain repo.
 *
 * Why the loader is lazy: the widget is a third-party runtime dependency
 * (the `@elevenlabs/convai-widget-embed` script served by unpkg, not an npm
 * package; flagged in the PR per AGENTS.md). It loads only after the
 * visitor asks for it, never on page load: /demo ships nothing from
 * ElevenLabs until the pill is clicked, and a visitor who never clicks never
 * contacts unpkg. The widget is voice-first (a mic permission prompt on
 * "Start the call") and draws its own fixed bubble/panel at the bottom right
 * of the viewport; nothing in it is ours to style. No analytics events fire
 * here (AGENTS.md: analytics changes need explicit scope).
 *
 * Widget contract: https://elevenlabs.io/docs/agents-platform/customization/widget
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

/** ElevenLabs' documented embed snippet, unpinned as they publish it. */
export const AI_SALES_WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

const SCRIPT_ID = "elevenlabs-convai-widget-embed";
const WIDGET_TAG = "elevenlabs-convai";
/** A cold unpkg fetch plus the module's own start-up, with margin; past
    that the pill shows the error line and the visitor can click again. */
const SCRIPT_TIMEOUT_MS = 10_000;

/** The widget's own UI strings: the widget renders them, so they live with
    the integration; the page's strings stay in
    components/sections/demo/demo-copy.ts. */
export const AI_SALES_WIDGET_TEXT = {
  action: "Talk to AI sales",
  startCall: "Start the call",
  endCall: "End the call",
  expand: "Open AI sales",
  listening: "Listening",
  speaking: "AI sales is speaking",
} as const;

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

/** The `dynamic-variables` payload: only the keys that have a value, null
    when there is nothing to pass (the attribute is then left off). */
export function aiSalesDynamicVariables(visitor: AiSalesVisitor): DynamicVariables | null {
  const first_name = trimmed(visitor.firstName, NAME_MAX);
  const company_website = trimmed(visitor.website, WEBSITE_MAX);
  if (!first_name && !company_website) return null;
  return {
    ...(first_name ? { first_name } : {}),
    ...(company_website ? { company_website } : {}),
  };
}

let scriptReady: Promise<void> | null = null;

/**
 * Inject the widget script once (one tag, by id) and resolve when the
 * custom element is defined: that, not the script's load event, is the
 * signal that the widget can mount. Rejects on a script error or after
 * SCRIPT_TIMEOUT_MS. A failure clears the memo so the next click tries
 * again: after a network error the tag is removed and re-injected (a script
 * element never re-runs); after a timeout it stays, because a slow script
 * still executes when it lands and the next attempt only has to wait.
 */
function loadWidgetScript(): Promise<void> {
  if (scriptReady) return scriptReady;
  const attempt = new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined" || typeof customElements === "undefined") {
      reject(new Error("AI sales: custom elements are not available"));
      return;
    }
    if (customElements.get(WIDGET_TAG)) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    const script = existing instanceof HTMLScriptElement ? existing : document.createElement("script");
    let settled = false;
    const timer = window.setTimeout(() => {
      fail(new Error("AI sales: the widget script timed out"));
    }, SCRIPT_TIMEOUT_MS);
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      reject(error instanceof Error ? error : new Error("AI sales: the widget script failed"));
    };
    script.addEventListener(
      "error",
      () => {
        script.remove();
        fail(new Error("AI sales: the widget script failed to load"));
      },
      { once: true },
    );
    if (!existing) {
      script.id = SCRIPT_ID;
      script.src = AI_SALES_WIDGET_SRC;
      script.async = true;
      script.type = "text/javascript";
      document.head.appendChild(script);
    }
    customElements.whenDefined(WIDGET_TAG).then(done, fail);
  });
  scriptReady = attempt;
  attempt.catch(() => {
    if (scriptReady === attempt) scriptReady = null;
  });
  return attempt;
}

/** ONE widget on the page: reuse it when it is already mounted (a second
    click, or a restart followed by another submission). */
function mountWidget(agentId: string, visitor: AiSalesVisitor): HTMLElement {
  const mounted = document.querySelector<HTMLElement>(WIDGET_TAG);
  if (mounted) {
    // Reused after "Start a new submission" and a second submission: refresh
    // the seed so the agent is never greeted with the previous visitor's
    // name. The widget reads the attribute when it starts a conversation, so
    // this only matters before the first call; dismissing the widget keeps
    // the element (it collapses to its own launcher, verified 2026-09-16).
    setVisitorAttribute(mounted, visitor);
    return mounted;
  }
  const widget = document.createElement(WIDGET_TAG);
  widget.setAttribute("agent-id", agentId);
  widget.setAttribute("variant", "expanded");
  widget.setAttribute("dismissible", "true");
  widget.setAttribute("action-text", AI_SALES_WIDGET_TEXT.action);
  widget.setAttribute("start-call-text", AI_SALES_WIDGET_TEXT.startCall);
  widget.setAttribute("end-call-text", AI_SALES_WIDGET_TEXT.endCall);
  widget.setAttribute("expand-text", AI_SALES_WIDGET_TEXT.expand);
  widget.setAttribute("listening-text", AI_SALES_WIDGET_TEXT.listening);
  widget.setAttribute("speaking-text", AI_SALES_WIDGET_TEXT.speaking);
  setVisitorAttribute(widget, visitor);
  document.body.appendChild(widget);
  return widget;
}

/** The only visitor data that reaches the third party: first name + website. */
function setVisitorAttribute(widget: HTMLElement, visitor: AiSalesVisitor): void {
  const variables = aiSalesDynamicVariables(visitor);
  if (variables) widget.setAttribute("dynamic-variables", JSON.stringify(variables));
  else widget.removeAttribute("dynamic-variables");
}

/**
 * Open the AI sales widget: load the script (once), then mount the element
 * (once). Resolves when the widget is in the DOM; the widget then fetches
 * the agent and draws itself at the bottom right. Rejects when the feature
 * is off or the script cannot be loaded; the caller shows the error line.
 */
export async function openAiSales(visitor: AiSalesVisitor = {}): Promise<void> {
  if (!AI_SALES_AGENT_ID) throw new Error("AI sales is off: no agent id");
  await loadWidgetScript();
  mountWidget(AI_SALES_AGENT_ID, visitor);
}
