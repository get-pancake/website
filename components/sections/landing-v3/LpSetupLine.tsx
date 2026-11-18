import { STEP_CONNECT } from "@/components/sections/guide-claude/guide-copy";

/**
 * The one-line setup on the homepage (the infra-first landing, 2026-10-21): the guide's
 * install.md line ("Paste in Claude Code or Codex"). An agent that reads it adds Pancake's MCP
 * server and opens the browser sign-in: no API key (OAuth 2.1). The hero's For agents view keeps
 * the designer's own box (LpAgentPrompt); the hero and, since 2026-11-16, the closing card copy it
 * through the install row (LpHeroInstall). Until then the closing card had its own outlined
 * "Copy the setup line" pill (LpSetupPill, in git before that day).
 */

/** the guide's own line: the text the /claude and /codex pages copy */
export const SETUP_LINE = STEP_CONNECT.claudeCode.line;
