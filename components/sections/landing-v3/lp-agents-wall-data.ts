import type { ContentStatus } from "@/lib/placeholders";

/**
 * Agents view code wall + card copy (V2 Figma 4911:1461: wall 4939:3760, card 4964:4098).
 * Owner: agents-view package. In scripts/homepage-lint.mjs FILES.
 *
 * Fixed for app/page.tsx (integrator): AGENT_CARD_BODY (production body: the existing puzzle,
 * never an empty card — decision 2026-10-09 §8) and AGENT_CARD_BODY_PLACEHOLDER (a preview-only
 * body or null), passed as LpAgentLab's `cardBody` through the SHOW_PLACEHOLDERS gate. The
 * AgentCardBody shape is the owner's to extend.
 */
export type AgentCardBody =
  | { kind: "captcha"; status: ContentStatus }
  | { kind: "transcript"; status: ContentStatus; lines: readonly string[] };

export const AGENT_CARD_BODY: AgentCardBody = { kind: "captcha", status: "final" };

/** dev/preview only (null = none) */
export const AGENT_CARD_BODY_PLACEHOLDER: AgentCardBody | null = null;
