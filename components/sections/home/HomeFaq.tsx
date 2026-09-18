/**
 * Visible homepage FAQ — "Questions founders ask".
 *
 * Why this exists: the homepage shipped FAQPage JSON-LD (`app/page.tsx`)
 * while rendering no FAQ — a violation of Google's structured-data
 * guideline that marked-up content must be visible on the page.
 *
 * `FAQ_ITEMS` is the single source of truth: this component renders it,
 * and `app/page.tsx` should regenerate its FAQPage JSON-LD from it so the
 * markup and the visible page can never drift apart again.
 *
 * Zero-JS accordion: native `<details>/<summary>` carries the open state,
 * and the plus→x icon is pure CSS keyed off `details[open]`. Styles live
 * in `app/_styles/home-faq.css`, imported here so the section is fully
 * self-contained (App Router allows global-CSS imports from components).
 */

import "@/app/_styles/home-faq.css";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { H2 } from "@/components/ui/Headings";
import { TRIAL_NOTICE } from "@/lib/trial";

/**
 * Q&A source of truth.
 *
 * The first five entries mirror the FAQPage JSON-LD questions in
 * `app/page.tsx` — wording lightly tightened for on-page reading, every
 * factual claim kept identical. The last two (control, cost) are additions;
 * the cost figures come from `lib/copy.ts` `pricing` ($49 infrastructure,
 * labs' public token price, $100 free credits, cancel anytime).
 */
export const FAQ_ITEMS: readonly { q: string; a: string }[] = [
  {
    q: "What is OpenClaw and how does Pancake use it?",
    a: "OpenClaw is an open-source AI agent runtime that powers multi-agent workflows. Pancake is the product built on top of it: a fully managed AI coworker that knows your company, runs inside Slack, and handles 50–70% of the work by default. You get OpenClaw's agent power without setting up or maintaining the runtime yourself.",
  },
  {
    q: "What is an autonomous company?",
    a: "One where AI handles 50–70% of recurring work by default — GTM motions, engineering tasks, ops workflows — without a human prompting each step. Humans focus on direction, decisions, and edge cases; a coordinating squad of AI agents handles execution. Pancake is purpose-built for this model: it deploys agents with their own memory, tools, and schedules that work continuously inside your Slack workspace.",
  },
  {
    q: "How is Pancake different from Viktor?",
    a: "Viktor is a coworker you prompt — it responds, then waits, and there's nothing behind it. Pancake is also one coworker in Slack, but with a whole team of agents behind it that work proactively without being asked — each with its own memory, cron schedule, and dedicated infrastructure — so your company runs itself rather than just being assisted.",
  },
  {
    q: "What does Pancake do for early-stage founders?",
    a: "It gives you an AI coworker that knows your company — goals, decisions, metrics, customers — and staffs a team of agents to handle growth, engineering, and operations tasks 24/7 inside Slack. The result: a founding team of two that operates like a team of ten, going from $1 to $1M without traditional hiring.",
  },
  {
    q: "Does Pancake replace human employees?",
    a: "No. Pancake is designed for founders who want to stay lean while moving fast. Its agents handle high-volume, repeatable work — outbound sequences, PR reviews, onboarding ops, weekly reports — so the humans on the team focus on judgment, relationships, and direction. Think of it as replacing your first 5 hires with agents, not your core team.",
  },
  {
    q: "Do I stay in control?",
    a: "Always. Sensitive actions pause for your approval in Slack before anything happens. Most founders start with approvals on everything, then widen autonomy as trust builds. And every action is logged, so you can see exactly what your agents did.",
  },
  {
    q: "What does it cost?",
    a: `$49/month flat for the always-on setup, plus a token pack at the labs' public price — no markup. ${TRIAL_NOTICE} You can cancel anytime. The only thing we stack is pancakes.`,
  },
];

/**
 * Full landing section (header + accordion) — drop-in alongside the other
 * `home-landing-section` blocks on the homepage.
 *
 * `alt` toggles the `--alt` background modifier so the section can keep the
 * page's alternating surface rhythm wherever it's inserted; the cards sit
 * on `--surface` with a `--stroke` border, so they read on both backgrounds.
 */
export function HomeFaq({ alt = false }: { alt?: boolean }) {
  return (
    <section
      className={`home-landing-section${alt ? " home-landing-section--alt" : ""}`}
      aria-labelledby="home-faq-heading"
    >
      <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
        <header className="home-landing-section__header">
          <H2 id="home-faq-heading" className="heading home-landing-section__title text-center">
            Questions founders ask
          </H2>
        </header>

        {/* Native disclosure list — no client JS, works before hydration. */}
        <div className="home-faq">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="home-faq__item">
              <summary className="home-faq__question">
                <span>{item.q}</span>
                {/* Plus icon drawn in CSS (rotates to an x when open). */}
                <span className="home-faq__icon" aria-hidden="true" />
              </summary>
              <p className="home-faq__answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
