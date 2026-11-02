"use client";

import { useEffect, useRef, useState } from "react";

import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * The agent install instruction + its copy button — Figma V2 4939:3751 (hero box) and 4964:4099 /
 * 4964:4100 (the code-wall card's head row). Owner: agents-view package. In
 * scripts/homepage-lint.mjs FILES.
 *
 * The instruction names the outcome and the URL, not a tool: an agent with a shell will curl it,
 * one with a fetch tool will fetch it, and a chat assistant will open it. A `curl` one-liner made
 * shell-less assistants stop at "I can't run commands" (2026-09-10). The app's Workspace › AI
 * access page (pancake-cmo, PAN-862) pins this exact sentence — change both together, including
 * the install.md host when NEXT_PUBLIC_SITE_ORIGIN moves the site (pancake-cmo
 * MCP_INSTALL_DOC_URL).
 */
const instruction = `Set up Pancake by reading ${SITE_ORIGIN}/install.md and following its instructions.`;
// The visible text offers three break opportunities — after the scheme, after the host's slash and
// before the file name — so the 36-column hero box wraps exactly as V2 draws it ("…reading
// https://" / "pancake.ai/install.md and following" / "its instructions.") and a narrow phone never
// splits "install.m" + "d" (2026-10-07). Visible text and the copied string are identical.
const scheme = /^[a-z][a-z0-9+.-]*:\/\//i.exec(SITE_ORIGIN)?.[0] ?? "";
const host = SITE_ORIGIN.slice(scheme.length);

export type AgentPromptVariant = "hero" | "card";

export function LpAgentPrompt({ variant }: { variant: AgentPromptVariant }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>();
  const code = useRef<HTMLElement>(null);

  useEffect(() => () => clearTimeout(reset.current), []);

  const copy = async () => {
    clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(instruction);
      setStatus("copied");
      reset.current = setTimeout(() => setStatus("idle"), 2400);
    } catch {
      // Keep a useful manual path when clipboard permission is unavailable.
      if (code.current) {
        const range = document.createRange();
        range.selectNodeContents(code.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setStatus("error");
    }
  };

  return <div className={`lp-agent-prompt lp-agent-prompt--${variant}`} data-copy-state={status}>
    <div className="lp-agent-prompt__text">
      <code ref={code} className="lp-agent-prompt__code">
        Set up Pancake by reading {scheme}<wbr />{host}/<wbr />install.md and following its instructions.
      </code>
      <p className={status === "error" ? "lp-agent-prompt__error" : "lp-sr-only"} role="status" aria-live="polite">
        {status === "error" ? "Select the instruction and copy it." : status === "copied" ? "Instruction copied." : ""}
      </p>
    </div>
    <button
      type="button"
      className="lp-agent-prompt__copy"
      aria-label={status === "copied" ? "Instruction copied" : "Copy instruction"}
      onClick={copy}
    >
      {status === "copied"
        ? <svg key="check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.333 8 2.667 2.667L12.667 4" /></svg>
        // Figma 4939:3756: the 16 px copy glyph, stroke 1.333, round caps and joins
        : <svg key="copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M13.332 5.333H6.665c-.736 0-1.333.597-1.333 1.334v6.666c0 .737.597 1.334 1.333 1.334h6.667c.736 0 1.333-.597 1.333-1.334V6.667c0-.737-.597-1.334-1.333-1.334Z" /><path d="M2.665 10.667c-.733 0-1.333-.6-1.333-1.334V2.667c0-.734.6-1.334 1.333-1.334h6.667c.733 0 1.333.6 1.333 1.334" /></svg>}
    </button>
  </div>;
}
