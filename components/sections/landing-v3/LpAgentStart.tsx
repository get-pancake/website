"use client";

import { useEffect, useRef, useState } from "react";
import { SiClaude, SiOpenai } from "react-icons/si";
import { CursorMark, HermesMark, OpenClawMark } from "./LpAgentMarks";

// Copy the complete instruction for the agent, including its command.
const instruction = "Run `curl -fsSL https://getpancake.ai/install.md`, then follow the instructions";

export function LpAgentStart() {
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

  return <div className="lp-agent-start" role="group" aria-label="Set up Pancake">
    <div className="lp-agent-friends">
      <span>friends with</span>
      <ul aria-label="Agent logos">
        <li title="Claude Code"><SiClaude role="img" aria-label="Claude Code" focusable="false" /></li>
        <li title="Codex"><SiOpenai role="img" aria-label="Codex" focusable="false" /></li>
        <li title="Cursor"><CursorMark /></li>
        <li title="Hermes"><HermesMark /></li>
        <li title="OpenClaw"><OpenClawMark /></li>
      </ul>
    </div>
    <div className="lp-agent-terminal" data-copy-state={status}>
      <code ref={code} className="lp-agent-terminal__code">{instruction}</code>
      <button
        type="button"
        className="lp-agent-terminal__copy"
        aria-label={status === "copied" ? "Instruction copied" : "Copy instruction"}
        onClick={copy}
      >
        {status === "copied" ? <svg key="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
          : <svg key="copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 4H6a2 2 0 0 0-2 2v9" /></svg>}
      </button>
    </div>
    <p className={status === "error" ? "lp-agent-start__error" : "lp-sr-only"} role="status" aria-live="polite">
      {status === "error" ? "Select the instruction and copy it." : status === "copied" ? "Instruction copied." : ""}
    </p>
  </div>;
}
