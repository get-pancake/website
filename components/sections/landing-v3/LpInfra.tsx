import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";
import { LpInfraFlow } from "@/components/sections/landing-v3/LpInfraAnim";

/**
 * Section — "Everything your agent needs to sell." (the infra-first landing). Until 2026-10-22
 * the launch line, "Your agent decides. Pancake runs it." — founder: "doesnt mean anything". The
 * heading now says what the diagram shows: Pancake gives your agent the brain, the data and the
 * tools (no kicker: "Connect Claude or Codex." went the same day, founder: "Remove").
 *
 * The page's model (2026-10-21, the infra outline the founder approved: "one sentence, one
 * diagram, three layers", as Apollo's "One system. Three layers." and Cargo's "your agent writes
 * it, Cargo runs it"). The three layers are the hero lede's own words: "the brain, the data and
 * the tools". The first version (eight layers, Deploy / Host / Run, four figures on a dark card)
 * read as engineering notes: "I dont understand anything about the new block". Plain words,
 * one sentence per layer; claims in docs/infra/infra-landing-brief.md, the 30+ data providers
 * being the founder's figure (the dive's sources story).
 *
 * The card plays once (LpInfraFlow, lp-infra-timeline.ts): the agents send, the wire draws down
 * through the sign-in, Pancake lights, the branch draws to the three layers and they light up.
 * The markup below is the finished picture.
 */

type Layer = { name: string; title: string; body: string };

const LAYERS: readonly Layer[] = [
  { name: "The brain", title: "Knows your business", body: "What you sell, who buys and how you talk. It learns from every lead." },
  { name: "The data", title: "Finds your buyers", body: "30+ data providers: funding, hiring, tech stacks and the people behind them." },
  {
    name: "The tools",
    title: "Runs your Plays",
    body: "Searches on your schedule and writes from your own accounts to the leads you approve.",
  },
];

export function LpInfra() {
  return (
    <section id="infra" className="lp-infra" aria-labelledby="lp-infra-title">
      <div className="lp-infra__org">
        <header className="lp-infra__head">
          <h2 id="lp-infra-title" className="lp-infra__title lp-title-section">
            Everything your agent needs to sell.
          </h2>
        </header>
        <LpInfraFlow>
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
          <div className="lp-infra__link">
            <Wire />
            <p className="lp-infra__link-text">One sign-in. No API keys.</p>
            <Wire />
          </div>
          <img className="lp-infra__logo" src="/lp/lp-nav-logo.svg" alt="Pancake" width={114.956} height={56} />
          {/* Pancake to its three layers: a stem, a bar across the columns' centres, three drops */}
          <div className="lp-infra__branch" aria-hidden="true">
            <span className="lp-infra__branch-stem" />
            <span className="lp-infra__branch-bar" />
            <span className="lp-infra__branch-drop" data-col="1" />
            <span className="lp-infra__branch-drop" data-col="2" />
            <span className="lp-infra__branch-drop" data-col="3" />
          </div>
          <ul className="lp-infra__parts">
            {LAYERS.map((layer) => (
              <li key={layer.name} className="lp-infra__part">
                <p className="lp-infra__part-name">{layer.name}</p>
                <h3 className="lp-infra__part-title">{layer.title}</h3>
                <p className="lp-infra__part-body">{layer.body}</p>
              </li>
            ))}
          </ul>
        </LpInfraFlow>
      </div>
    </section>
  );
}

/** a hairline wire (drawn by the flow) with the dot that rides its front */
function Wire() {
  return (
    <span className="lp-infra__wire" aria-hidden="true">
      <i className="lp-infra__line" />
      <i className="lp-infra__dot" />
    </span>
  );
}
