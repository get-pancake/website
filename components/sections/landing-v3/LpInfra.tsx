import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";

/**
 * Section — "Your agent decides. Pancake does the work." (the infra-first landing).
 *
 * 2026-10-21, second version. The first one (eight infrastructure layers, Deploy / Host / Run,
 * four figures, a vision line, on a dark card) read as engineering notes: founder, "I dont
 * understand anything about the new block". This one says one thing and draws it: your agent
 * on top, it signs in to Pancake, and the four things Pancake does under it. Plain words, one
 * sentence per part; every claim is in docs/infra/infra-landing-brief.md ("Safe to claim
 * now") or already on this page (the 30+ data providers of the dive's sources story).
 */

type Part = { title: string; body: string };

const PARTS: readonly Part[] = [
  { title: "Finds your buyers", body: "Funding rounds, open roles and tech stacks from 30+ data providers." },
  { title: "Knows your business", body: "What you sell, who buys and how you talk, learned from your website." },
  { title: "Reaches out for you", body: "From your own accounts, under your name, once you approve each lead." },
  { title: "Keeps running", body: "Every Play runs on the schedule you pick, even with your laptop closed." },
];

export function LpInfra() {
  return (
    <section id="infra" className="lp-infra" aria-labelledby="lp-infra-title">
      <div className="lp-infra__org">
        <header className="lp-infra__head">
          <p className="lp-infra__kicker">Your agent decides.</p>
          <h2 id="lp-infra-title" className="lp-infra__title lp-title-section">
            Pancake does the work.
          </h2>
        </header>
        <div className="lp-infra__card">
          <p className="lp-infra__label">Your agent</p>
          <ul className="lp-infra__agents">
            <li className="lp-infra__agent">
              <span className="lp-infra__mark" aria-hidden="true"><ClaudeMark /></span>
              Claude
            </li>
            <li className="lp-infra__agent">
              <span className="lp-infra__mark" aria-hidden="true"><CodexMark /></span>
              Codex
            </li>
          </ul>
          <p className="lp-infra__link">One sign-in. No API keys.</p>
          <img className="lp-infra__logo" src="/lp/lp-nav-logo.svg" alt="Pancake" width={114.956} height={56} />
          <ul className="lp-infra__parts">
            {PARTS.map((part) => (
              <li key={part.title} className="lp-infra__part">
                <h3 className="lp-infra__part-title">{part.title}</h3>
                <p className="lp-infra__part-body">{part.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
