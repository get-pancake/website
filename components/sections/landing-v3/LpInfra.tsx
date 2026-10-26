import type { ComponentType } from "react";

import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";
import { LpInfraFlow } from "@/components/sections/landing-v3/LpInfraAnim";
import { SL_AVATAR } from "@/components/sections/landing-v3/lp-story-learns-art";

/**
 * Section — "Give your agent everything it needs to sell." (founder 2026-10-26, verbatim; it was
 * "Everything your agent needs to sell.", and the same day: "on peut s inspirer un peu de sites
 * best in class pour mieux faire ressortir cette page genre kicker.run // clay … Un peu de
 * dynamisme. Un peu de juice!!!", then "use components from mobbin"). After the build-up the
 * diagram stays alive (infra.css, the live loops): live notes take turns on the canvas (Mobbin:
 * Plain's and Granola's notifications, kicker.run's activity pills), packets keep flowing into
 * Pancake, the Play's run fills and its leads come up for approval one after another (Zaro's live
 * runs, Antimetal's Approve). The infra-first landing's section before that: until 2026-10-22
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
 * The look (founder 2026-10-22: "make this more beautiful - use design system - toolkits like
 * mobin and brand assets"): Mobbin's infra diagrams (Cloudflare's dotted canvas and grouped
 * nodes, Coda's product-as-hub) drawn with the kit. Pancake is one platform holding its three
 * layers, and each layer takes the colour of its pancake in the logo (the kit's canonical stack:
 * yellow on top, purple, pink under) as a kit brand card with a kit badge. Each card shows a small
 * picture of what it holds, cast from the page's one story (lp-story-sources-data.ts): Acme's
 * brain, the providers' own marks (unmodified, half the disc's width on a white disc, as the
 * sources story draws them; Dealroom left out until it has a production key), and the Play
 * "Funded startups hiring a marketing lead" with Tamsin Okafor waiting for approval.
 *
 * The card plays once (LpInfraFlow, lp-infra-timeline.ts): the agents send, the wire draws down
 * through the sign-in, Pancake lights, the brain, the data and the tools light up in turn and the
 * Play goes live. The markup below is the finished picture.
 */

type Tone = "yellow" | "purple" | "pink";
type Layer = { tone: Tone; name: string; title: string; body: string; pic: ComponentType };

const LAYERS: readonly Layer[] = [
  {
    tone: "yellow",
    name: "The brain",
    title: "Knows your business",
    body: "What you sell, who buys and how you talk. It learns from every lead.",
    pic: BrainPic,
  },
  {
    tone: "purple",
    name: "The data",
    title: "Finds your buyers",
    body: "30+ data providers: funding, hiring, tech stacks and the people behind them.",
    pic: DataPic,
  },
  {
    tone: "pink",
    name: "The tools",
    title: "Runs your Plays",
    body: "Searches on your schedule and writes from your own accounts to the leads you approve.",
    pic: ToolsPic,
  },
];

/** what the brain knows about Acme, the page's studio that designs websites for startups */
const MEMORY = [
  { key: "Sells", value: "Websites for startups" },
  { key: "Buyers", value: "Funded founders" },
  { key: "Voice", value: "Warm and short" },
] as const;

/** five of the providers the product names to its users (lp-story-sources-data.ts hub) */
const PROVIDERS = [
  { name: "Apify", logo: "/lp/story-sources/apify.svg" },
  { name: "TheirStack", logo: "/lp/story-sources/theirstack.svg" },
  { name: "Coresignal", logo: "/lp/story-sources/coresignal.svg" },
  { name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg" },
  { name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png" },
] as const;

const SIGNALS = ["Funding", "Hiring", "Tech stack"] as const;

/** The leads the Play brings up for approval, in turn: the page's cast (LpStepMocks' leads). */
const LEADS = [
  { initials: "TO", name: "Tamsin Okafor", company: "Quillfern" },
  { initials: "JA", name: "Julien Aubert", company: "Brightloop" },
  { initials: "SM", name: "Samantha Mills", company: "Northvale" },
] as const;

/** The live notes around the diagram (Mobbin: Plain's and Granola's stacked notifications,
 *  kicker.run's activity pills), one at a time: what the Play found, a reply, the Brain learning
 *  from it. Placed by `at` (infra.css). */
const TOASTS: readonly { at: string; tone: Tone; title: string; meta: string; initials?: string }[] = [
  { at: "left", tone: "pink", title: "13 new leads", meta: "Funded startups hiring a marketing lead" },
  { at: "right", tone: "purple", title: "Tamsin Okafor replied", meta: "Interested, labeled for you", initials: "TO" },
  { at: "left-low", tone: "yellow", title: "Brain updated", meta: "Learned from Tamsin’s reply" },
];

export function LpInfra() {
  return (
    <section id="infra" className="lp-infra" aria-labelledby="lp-infra-title">
      <div className="lp-infra__org">
        <header className="lp-infra__head">
          <h2 id="lp-infra-title" className="lp-infra__title lp-title-section">
            Give your agent everything it needs to sell.
          </h2>
        </header>
        <LpInfraFlow>
          {/* what Pancake is doing right now: one note at a time on the canvas (wide screens) */}
          <ul className="lp-infra__toasts" aria-hidden="true">
            {TOASTS.map((toast) => (
              <li key={toast.title} className="lp-infra__toast" data-at={toast.at}>
                <span className="lp-infra__toast-icon" data-tone={toast.tone}>
                  {toast.initials ?? <PancakeMark />}
                </span>
                <span className="lp-infra__toast-text">
                  <b>{toast.title}</b>
                  <span>{toast.meta}</span>
                </span>
                <span className="lp-infra__toast-time">now</span>
              </li>
            ))}
          </ul>
          <div className="lp-infra__agentbar">
            <p className="lp-infra__label">Your agent</p>
            <ul className="lp-infra__agents">
              <li className="lp-infra__agent" data-agent="claude">
                <span className="lp-infra__mark" aria-hidden="true"><ClaudeMark /></span>
                Claude
              </li>
              <li className="lp-infra__agent" data-agent="codex">
                <span className="lp-infra__mark" aria-hidden="true"><CodexMark /></span>
                Codex
              </li>
            </ul>
          </div>
          <div className="lp-infra__link">
            <Wire />
            <p className="lp-infra__link-text">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <circle cx="5.5" cy="8" r="3" />
                <path d="M8.5 8h6M12.5 8v2.5M14.5 8v1.8" />
              </svg>
              One sign-in. No API keys.
            </p>
            <Wire />
          </div>
          {/* Pancake: the platform, its name on the edge where the wire plugs in */}
          <div className="lp-infra__brand">
            <PancakeMark />
            {/* eslint-disable-next-line @next/next/no-img-element -- the nav's wordmark SVG */}
            <img className="lp-infra__logo" src="/lp/lp-nav-logo.svg" alt="Pancake" width={114.956} height={56} />
          </div>
          <div className="lp-infra__stack">
            <ul className="lp-infra__parts">
              {LAYERS.map(({ tone, name, title, body, pic: Pic }) => (
                <li key={name} className="lp-infra__part" data-tone={tone}>
                  <div className="lp-infra__pic" aria-hidden="true">
                    <Pic />
                  </div>
                  <p className="lp-infra__part-name">{name}</p>
                  <h3 className="lp-infra__part-title">{title}</h3>
                  <p className="lp-infra__part-body">{body}</p>
                </li>
              ))}
            </ul>
          </div>
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

/** The Pancake mark, full colour (as step 02's, LpStepMocks): its three pancakes are the three layers */
function PancakeMark() {
  return (
    <svg className="lp-infra__pk" viewBox={`0 0 ${SL_AVATAR.size} ${SL_AVATAR.size}`} aria-hidden="true" focusable="false">
      {SL_AVATAR.shapes.map((shape, i) => (
        <path
          key={i}
          className={i >= SL_AVATAR.shapes.length - 2 ? "lp-infra__pk-eye" : undefined}
          d={shape.d}
          fill={shape.fill}
          opacity={"opacity" in shape ? shape.opacity : undefined}
        />
      ))}
    </svg>
  );
}

function BrainPic() {
  return (
    <dl className="lp-infra__memory">
      {MEMORY.map((row) => (
        <div key={row.key} className="lp-infra__mem-row">
          <dt>{row.key}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DataPic() {
  return (
    <div className="lp-infra__data">
      <ul className="lp-infra__discs">
        {PROVIDERS.map((provider) => (
          <li key={provider.name} className="lp-infra__disc">
            {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
            <img src={provider.logo} alt="" width={22} height={22} loading="lazy" decoding="async" />
          </li>
        ))}
        <li className="lp-infra__disc lp-infra__disc--more">30+</li>
      </ul>
      <ul className="lp-infra__signals">
        {SIGNALS.map((signal) => (
          <li key={signal} className="lp-infra__signal">
            {signal}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolsPic() {
  return (
    <div className="lp-infra__tools">
      <div className="lp-infra__play">
        <span className="lp-infra__play-icon">
          <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
            <path d="M5.5 3.8v8.4L12 8z" />
          </svg>
        </span>
        <span className="lp-infra__play-name">Funded startups hiring a marketing lead</span>
        <span className="lp-infra__toggle">
          <i className="lp-infra__toggle-knob" />
        </span>
      </div>
      <p className="lp-infra__play-meta">
        <i className="lp-infra__live" />
        Live · On your schedule
        <span className="lp-infra__run">
          <i />
        </span>
      </p>
      <ul className="lp-infra__leads">
        {LEADS.map((lead) => (
          <li key={lead.name} className="lp-infra__lead">
            <span className="lp-infra__lead-avatar">{lead.initials}</span>
            <span className="lp-infra__lead-who">
              <span className="lp-infra__lead-name">{lead.name}</span>
              <span className="lp-infra__lead-co">{lead.company}</span>
            </span>
            <span className="lp-infra__approve">
              <span className="lp-infra__approve-do">Approve</span>
              <span className="lp-infra__approve-ok">Approved</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
