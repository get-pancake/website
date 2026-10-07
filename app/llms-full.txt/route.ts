import { readFileSync } from "node:fs";
import path from "node:path";

import { pricingPlan } from "@/lib/copy";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

/**
 * /llms-full.txt (2026-10-07, audit 7.2): llms.txt plus the documents it points
 * agents to, in one plain-text file, so an assistant can read the facts,
 * the setup steps and the pricing rules in one fetch. Built once at build time
 * from the same files the site serves, so it can't drift from them:
 *   - public/llms.txt          → /llms.txt
 *   - public/install.md        → /install.md
 *   - public/guides/claude.md  → /guides/claude.md
 *   - pricingPlan.faq (lib/copy.ts), the answers /pricing shows
 */
export const dynamic = "force-static";

const read = (file: string) => readFileSync(path.join(process.cwd(), "public", file), "utf8").trim();

/** Each document keeps its own Markdown, under a line naming where it lives. */
const section = (url: string, body: string) => `Source: ${url}\n\n${body}`;

export function GET() {
  const pricing = [
    "# Pricing questions",
    "",
    pricingPlan.lede,
    ...pricingPlan.faq.flatMap((item) => ["", `## ${item.q}`, "", item.a]),
  ].join("\n");

  const body = [
    section(`${SITE_ORIGIN}/llms.txt`, read("llms.txt")),
    section(`${SITE_ORIGIN}/install.md`, read("install.md")),
    section(`${SITE_ORIGIN}/guides/claude.md`, read("guides/claude.md")),
    section(`${SITE_ORIGIN}/pricing`, pricing),
  ].join("\n\n---\n\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
