"use client";

import { useEffect, useRef, useState } from "react";
import { INSTALL_COMMAND } from "./ag-copy";

/**
 * The install terminal — `$ curl -fsSL https://getpancake.ai/install.md` with
 * a copy button (hero + final CTA). Same clipboard contract as the homepage's
 * LpAgentStart: clipboard first, a text selection as the manual fallback, a
 * polite status line for screen readers. Styling: `.ag-term` (foundation.css)
 * — Fono for the command only (the reading face stays Geist), pink prompt,
 * yellow command, the draft's 28px outlined copy glyph inside a 44px hit box.
 */
export function AgTerminal({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>();
  const code = useRef<HTMLElement>(null);

  useEffect(() => () => clearTimeout(reset.current), []);

  const copy = async () => {
    clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND.full);
      setStatus("copied");
      reset.current = setTimeout(() => setStatus("idle"), 1500);
    } catch {
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

  return (
    <div className={className ? `ag-term ${className}` : "ag-term"} data-copy-state={status} role="group" aria-label="Install command">
      <span className="ag-term__prompt" aria-hidden="true">{INSTALL_COMMAND.prompt}</span>
      <code ref={code} className="ag-term__code">
        <span className="ag-term__cmd">{INSTALL_COMMAND.cmd}</span>{" "}
        <span className="ag-term__url">{INSTALL_COMMAND.url}</span>
      </code>
      <button
        type="button"
        className="ag-term__copy"
        aria-label={status === "copied" ? "Command copied" : "Copy command"}
        onClick={copy}
      >
        <span className="ag-term__copy-box" aria-hidden="true">
          {status === "copied" ? (
            <svg key="check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3 3 7-7" /></svg>
          ) : (
            <svg key="copy" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" /></svg>
          )}
        </span>
      </button>
      <span className="lp-sr-only" role="status" aria-live="polite">
        {status === "copied" ? "Command copied." : status === "error" ? "Select the command and copy it." : ""}
      </span>
    </div>
  );
}
