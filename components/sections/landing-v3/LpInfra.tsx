import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";

/**
 * Section — "Your agent decides. Pancake runs it." (the infra-first landing): the launch line,
 * word for word (Pancake V2 launch material, public/llms.txt).
 *
 * The page's model (2026-10-21, the infra outline the founder approved: "one sentence, one
 * diagram, three layers", as Apollo's "One system. Three layers." and Cargo's "your agent writes
 * it, Cargo runs it"). The three layers are the hero lede's own words: "the brain, the data and
 * the tools". The first version (eight layers, Deploy / Host / Run, four figures on a dark card)
 * read as engineering notes: "I dont understand anything about the new block". Plain words,
 * one sentence per layer; claims in docs/infra/infra-landing-brief.md, the 30+ data providers
 * being the founder's figure (the dive's sources story).
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
          <p className="lp-infra__kicker">Your agent decides.</p>
          <h2 id="lp-infra-title" className="lp-infra__title lp-title-section">
            Pancake runs it.
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
            {LAYERS.map((layer) => (
              <li key={layer.name} className="lp-infra__part">
                <p className="lp-infra__part-name">{layer.name}</p>
                <h3 className="lp-infra__part-title">{layer.title}</h3>
                <p className="lp-infra__part-body">{layer.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
