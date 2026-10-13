import type { ContentStatus } from "@/lib/placeholders";

/**
 * Agents view code wall + card (V2 Figma 4911:1461: wall 4939:3760, card 4964:4098).
 * Owner: agents-view package. In scripts/homepage-lint.mjs FILES.
 *
 * Fixed for app/page.tsx (integrator): AGENT_CARD_BODY (the production body) and
 * AGENT_CARD_BODY_PLACEHOLDER (a dev/preview-only body, or null), passed as LpAgentLab's
 * `cardBody` through the SHOW_PLACEHOLDERS gate.
 */

/** One line of the illustrative install session: the agent's own echo of the prompt, a command
 *  it runs, or what it prints. */
export type AgentTranscriptLine = { kind: "prompt" | "run" | "out"; text: string };

/** What the card holds under its prompt row (V2 leaves the body empty — never shipped empty,
 *  decision 2026-10-09 §8). */
export type AgentCardBody =
  /** production's "Prove you're not human" puzzle (LpAgentCaptcha), unchanged */
  | { kind: "captcha"; status: ContentStatus }
  /** the agent's install session, printed line by line once the card has assembled */
  | { kind: "transcript"; status: ContentStatus; lines: readonly AgentTranscriptLine[] };

export const AGENT_CARD_BODY: AgentCardBody = { kind: "captcha", status: "final" };

/** Draft (founder question Q2, never production while "placeholder"): the card "does" what its
 *  prompt asks. The command is install.md's own Claude Code command; the block is illustrative.
 *  To preview it, set AGENT_CARD_BODY_PLACEHOLDER = AGENT_CARD_TRANSCRIPT_DRAFT. */
export const AGENT_CARD_TRANSCRIPT_DRAFT: AgentCardBody = {
  kind: "transcript",
  status: "placeholder",
  lines: [
    { kind: "prompt", text: "> Set up Pancake by reading https://pancake.ai/install.md and following its instructions." },
    { kind: "out", text: "Fetching https://pancake.ai/install.md" },
    { kind: "out", text: "Claude Code found. No Pancake server registered yet." },
    { kind: "run", text: "$ claude mcp add --transport http --scope user pancake https://app.pancake.ai/api/mcp" },
    { kind: "out", text: "Pancake added to your user config." },
    { kind: "out", text: "Open /mcp, select Pancake and sign in in your browser." },
  ],
};

/** dev/preview only (null = the production body there too, so the preview shows what ships). */
export const AGENT_CARD_BODY_PLACEHOLDER: AgentCardBody | null = null;

/**
 * The wall's pseudocode: production's terminal source, verbatim (it was LpAgentTerminalStream's
 * SOURCE). Illustrative, deliberately not product API calls. 2026-09-30, AI SEO retired: the three
 * search-intent / useful-answer lines became a Play's path (plan who, how, how many → create → run
 * → why they fit → your approval).
 */
export const AGENT_WALL_SOURCE = [
  '// pancake.simulation — illustrative pseudocode. no messages are sent.',
  'const human = { status: "building", focus: "the company" }; const agent = { focus: "bring customers", context: [offer, buyers, voice] };',
  'const offer = { product, problem, proof }; const audience = buyers.filter(matches_offer).sort(by_relevance);',
  'signals.filter(is_relevant).map(signal => ({ problem: signal.need, timing: signal.when, fit: match(offer, signal) }));',
  'for (const signal of buying_signals) { const reason = understand(signal); const next_move = prepare({ reason, offer, voice }); queue_for_review(next_move); }',
  'const first_message = draft({ context, reason: "a real need", tone: voice, length: "short" }); first_message.status = "awaiting review";',
  'const play = plays.plan({ who: "heads of sales at seed-stage SaaS", how: "hiring_for_role", how_many: 50 }); review(play);',
  'const brain = { offer: understand(product), buyers: recognize(audience), voice: learn(style), memory: [] };',
  '// relevance > volume. context > guesswork. useful > loud.',
  'const buying_signal = { problem: "growing team", constraint: "manual work", timing: "this quarter" }; const fit = compare(buying_signal, offer);',
  'outreach.preview = { who: audience.best_fit, why: fit.reason, message: first_message }; outreach.state = "draft";',
  'plays.create(play); const search = plays.run(play); search.steps = ["discover", "enrich", "qualify"]; log(search.research);',
  'while (human.is_building) { refresh(context); notice(signals); prepare(next_move); learn(feedback); }',
  'voice.rules = ["be concrete", "skip the jargon", "sound human"]; const message = rewrite(draft, voice);',
  'if (!useful(message) || !relevant(person, offer)) { return rethink(); } else { queue_for_review(message); }',
  'const context = { offer: product.what, buyers: product.who, proof: product.why, voice: human.style };',
  '// the human runs the company. the agent joins the dots.',
  'const next_customer = problem + timing + fit; const next_move = { context, direction: "help", human_in_the_loop: true };',
  'search.leads.forEach(lead => { lead.why_they_fit = explain(lead.signal, lead.role); queue_for_approval(lead); });',
  'memory.push({ resonated: feedback.yes, missed: feedback.no, changed: feedback.new }); context = refresh(memory);',
  'const tomorrow = { context: a_little_better, next_move: a_little_clearer }; continue_working(tomorrow);',
] as const;

/** V2's wall starts on SOURCE[5] (`const first_message = …`) and runs the source three times. */
export const AGENT_WALL_START = 5;
export const AGENT_WALL_TEXT = Array.from(
  { length: AGENT_WALL_SOURCE.length * 3 },
  (_, i) => AGENT_WALL_SOURCE[(AGENT_WALL_START + i) % AGENT_WALL_SOURCE.length],
).join("\n");
