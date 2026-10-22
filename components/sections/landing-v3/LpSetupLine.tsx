import { GuideCopyButton } from "@/components/sections/guide-claude/GuideCopyButton";
import { STEP_CONNECT } from "@/components/sections/guide-claude/guide-copy";

/**
 * The one-line setup on the homepage (the infra-first landing, 2026-10-21): the guide's
 * install.md line, the line Cargo and Landbase put in front of their infrastructure ("Paste in
 * Claude Code or Codex"). An agent that reads it adds Pancake's MCP server and opens the browser
 * sign-in: no API key (OAuth 2.1). The hero's For agents view keeps the designer's own box
 * (LpAgentPrompt); the final CTA carries this pill: one copy button and its caption. The copy
 * pushes no analytics event (track={false}): a new event is out of scope.
 */

/** the guide's own line: the text the /claude and /codex pages copy */
export const SETUP_LINE = STEP_CONNECT.claudeCode.line;

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
