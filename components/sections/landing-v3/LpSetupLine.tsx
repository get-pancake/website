import type { ReactNode } from "react";

import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";
import { CONNECT_PATHS } from "@/components/sections/guide-claude/connect-copy";
import { GUIDE_PATH, STEP_CONNECT } from "@/components/sections/guide-claude/guide-copy";
import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";

/**
 * The one-line setup on the light homepage (the infra-first landing, 2026-10-21): the guide's
 * install.md line, the line Cargo and Landbase put in front of their infrastructure ("Paste in
 * Claude Code or Codex"). An agent that reads it adds Pancake's MCP server and opens the browser
 * sign-in: no API key (OAuth 2.1, teardown §3.1). The hero's For agents view keeps the
 * designer's own box (LpAgentPrompt, styled for that view); this one is drawn for cream.
 *
 *   LpSetupLine — the line, its copy button, and the setup guides (Built for agents).
 *   LpSetupPill — one copy button and a caption, for the final CTA card.
 *
 * The copy buttons push no analytics event (track={false}): a new event is out of scope.
 */

/** the guide's own line: the text the /claude and /codex pages copy */
export const SETUP_LINE = STEP_CONNECT.claudeCode.line;

const GUIDES: readonly { name: string; href: string; mark: ReactNode }[] = [
  { name: "Claude", href: GUIDE_PATH, mark: <ClaudeMark /> },
  // the OpenAI glyph for both: ChatGPT's own, and the mark the site uses for Codex
  { name: "ChatGPT", href: CONNECT_PATHS.chatgpt, mark: <CodexMark /> },
  { name: "Codex", href: CONNECT_PATHS.codex, mark: <CodexMark /> },
];

export function LpSetupLine({ id }: { id: string }) {
  const lineId = `${id}-line`;
  return (
    <div className="lp-setup">
      <p className="lp-setup__label">Set it up in one line</p>
      <div className="lp-setup__prompt">
        <span className="lp-setup__caret" aria-hidden="true">
          &gt;
        </span>
        <p id={lineId} className="lp-setup__line">
          {SETUP_LINE}
        </p>
        <GuideCopyButton
          text={SETUP_LINE}
          blockId={id}
          label="Copy"
          ariaLabel="Copy the setup line"
          selectTargetId={lineId}
          track={false}
        />
      </div>
      <p className="lp-setup__note">Paste it into Claude Code or Codex. Your agent adds Pancake and you sign in.</p>
      <p className="lp-setup__guides">
        <span>Step by step:</span>
        {GUIDES.map((guide) => (
          <a key={guide.name} className="lp-setup__guide" href={guide.href}>
            <span className="lp-setup__mark" aria-hidden="true">
              {guide.mark}
            </span>
            {guide.name}
          </a>
        ))}
      </p>
    </div>
  );
}

export function LpSetupPill() {
  return (
    <p className="lp-setup-pill">
      <GuideCopyButton
        text={SETUP_LINE}
        blockId="home-cta-setup"
        label="Copy the setup line"
        ariaLabel="Copy the one-line setup for Claude Code or Codex"
        track={false}
      />
      <span className="lp-setup-pill__cap">for Claude Code or Codex</span>
    </p>
  );
}
