/** Runs before hydration. Keep self-contained: its source is the inline browser payload. */
function bankAcquisition(config) {
  try {
    if (!config.hosts.includes(window.location.hostname)) return;
    const safePage = () => {
      const query = new URLSearchParams(window.location.search);
      return !query.has("token") && !query.has("code");
    };
    if (!safePage()) return;
    const raw = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("pancake_attribution="));
    if (!raw) return;
    const cookie = JSON.parse(decodeURIComponent(raw.slice("pancake_attribution=".length)));
    const touch = Array.isArray(cookie.t) && cookie.t[cookie.t.length - 1];
    const touchId = touch && touch.i;
    if (typeof touchId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(touchId)) return;
    const state = window.__pancakeAcquisitionBank || (window.__pancakeAcquisitionBank = { ids: [], outcomes: [] });
    if (state.ids.includes(touchId)) return;
    state.ids.push(touchId);
    if (state.ids.length > 20) state.ids.shift();
    const report = (outcome) => {
      if (!safePage()) return;
      // Queue before dispatch so a late React mount can drain the same bounded, content-free data.
      state.outcomes.push(outcome);
      if (state.outcomes.length > 20) state.outcomes.shift();
      window.dispatchEvent(new CustomEvent("pancake:acquisition-bank"));
    };
    const run = async () => {
      let outcome;
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (!safePage()) return;
        let retry = false;
        let timer;
        let timedOut = false;
        const controller = new AbortController();
        try {
          // Include body decoding in the deadline; a response can arrive with a stalled body.
          const result = await Promise.race([
            (async () => {
              const response = await fetch(config.endpoint, {
                method: "POST", mode: "cors", credentials: "include", referrerPolicy: "origin",
                headers: { "Content-Type": "application/json" }, body: JSON.stringify({ touchId }),
                signal: controller.signal, keepalive: true,
              });
              if (!response.ok) {
                const retryAfter = response.headers.get("Retry-After");
                // Respect server backoff without scheduling a long-lived background loop.
                const mayRetry = retryAfter === null || retryAfter === "0";
                return { status: "failed", reason: response.status === 429 ? "rate_limited" : response.status >= 500 ? "unavailable" : "rejected", retry: mayRetry && (response.status === 429 || response.status >= 500) };
              }
              let receipt;
              try { receipt = await response.json(); } catch { return { status: "failed", reason: "invalid_response" }; }
              if (receipt && (receipt.status === "inserted" || receipt.status === "duplicate")) return { status: receipt.status, reason: "saved" };
              if (receipt && receipt.status === "disabled") return { status: "disabled", reason: "disabled" };
              if (receipt && receipt.status === "failed") {
                const reason = receipt.reason === "invalid_cookie" || receipt.reason === "touch_mismatch" ? receipt.reason : "unavailable";
                return { status: "failed", reason, retry: reason === "unavailable" };
              }
              return { status: "failed", reason: "invalid_response" };
            })(),
            new Promise((_, reject) => {
              timer = setTimeout(() => { timedOut = true; controller.abort(); reject(new Error("acquisition timeout")); }, 4000);
            }),
          ]);
          outcome = { status: result.status, reason: result.reason, attempts: attempt };
          retry = result.retry === true;
        } catch {
          outcome = { status: "failed", reason: timedOut ? "timeout" : "transport", attempts: attempt };
          retry = true;
        } finally {
          clearTimeout(timer);
        }
        if (!retry || attempt === 3) break;
        await new Promise((resolve) => setTimeout(resolve, attempt === 1 ? 250 : 1000));
      }
      if (outcome) report(outcome);
    };
    // Optional diagnostics and any browser storage/transport problem can never stop the page.
    void run().catch(() => undefined);
  } catch { /* Cookie parsing and browser APIs are best-effort. */ }
}

export function acquisitionBankScript({ hosts, endpoint }) {
  const config = JSON.stringify({ hosts, endpoint }).replace(/</g, "\\u003c");
  return `(${bankAcquisition.toString()})(${config});`;
}

const statuses = new Set(["inserted", "duplicate", "disabled", "failed"]);
const reasons = new Set(["saved", "disabled", "invalid_cookie", "touch_mismatch", "unavailable", "transport", "timeout", "rate_limited", "invalid_response", "rejected"]);

/** Rebuild a closed diagnostic shape; never forward arbitrary event detail or IDs. */
export function cleanBankOutcome(value) {
  if (!value || typeof value !== "object" || !statuses.has(value.status) || !reasons.has(value.reason) || !Number.isInteger(value.attempts) || value.attempts < 1 || value.attempts > 3) return null;
  return { status: value.status, reason: value.reason, attempts: value.attempts };
}
