import type { ReactNode } from "react";

import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";
import { CONNECT_PATHS } from "@/components/sections/guide-claude/connect-copy";
import { GUIDE_PATH, STEP_CONNECT } from "@/components/sections/guide-claude/guide-copy";
import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";

/**
 * Section — "Set up Pancake in one line." (the infra-first landing, 2026-10-21).
 *
 * The infrastructure moment of the page: the guide's one line (public/install.md), pasted into
 * Claude Code or Codex, has the agent add Pancake's MCP server and open the browser sign-in.
 * No API key: OAuth 2.1 with client metadata documents (teardown §3.1). The three guides are the
 * footer's Features column pages (/claude, /chatgpt, /codex). A purple-10 band in the banner's
 * frame (wrapper p-16, card r48) so the call to act stands apart from the cream sections
 * around it.
 */

/** the guide's own line: the same text the /claude and /codex pages copy */
const SETUP_LINE = STEP_CONNECT.claudeCode.line;

const GUIDES: readonly { name: string; href: string; mark: ReactNode }[] = [
  { name: "Claude", href: GUIDE_PATH, mark: <ClaudeMark /> },
  // the OpenAI glyph for both: ChatGPT's own, and the mark the site uses for Codex
  { name: "ChatGPT", href: CONNECT_PATHS.chatgpt, mark: <CodexMark /> },
  { name: "Codex", href: CONNECT_PATHS.codex, mark: <CodexMark /> },
];

export function LpConnect() {
  return (
    <section id="connect" className="lp-connect" aria-labelledby="lp-connect-title">
      <div className="lp-connect__card">
        <header className="lp-connect__head">
          <p className="lp-connect__kicker">Already using Claude or Codex?</p>
          <h2 id="lp-connect-title" className="lp-connect__title lp-title-section">
            Set up Pancake in one line.
          </h2>
        </header>
        <div className="lp-connect__prompt">
          <span className="lp-connect__caret" aria-hidden="true">
            &gt;
          </span>
          <p id="lp-connect-line" className="lp-connect__line">
            {SETUP_LINE}
          </p>
          <GuideCopyButton
            text={SETUP_LINE}
            blockId="home-setup-line"
            label="Copy"
            ariaLabel="Copy the setup line"
            selectTargetId="lp-connect-line"
            track={false}
          />
        </div>
        <p className="lp-connect__note">
          Paste it into Claude Code or Codex. Your agent adds Pancake and you sign in. No API key.
        </p>
        <p className="lp-connect__guides">
          <span>Or follow the steps for</span>
          {GUIDES.map((guide) => (
            <a key={guide.name} className="lp-connect__guide" href={guide.href}>
              <span className="lp-connect__mark" aria-hidden="true">
                {guide.mark}
              </span>
              {guide.name}
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}
