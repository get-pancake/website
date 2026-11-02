import type { ComponentType } from "react";

import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";
import { LpInfraFlow } from "@/components/sections/landing-v3/LpInfraAnim";
import { PANCAKE_AVATAR } from "@/components/sections/landing-v3/lp-pancake-avatar-art";

/**
 * Section — "Your agent needs 3 things to sell." (founder 2026-10-26:
 * "Can we do something like Your agent needs 3 things to sell and show that pancake brings all 3
 * of them when scrolling ? … sometimes it's like some components that are spread in the hero and
 * end up as components from an UI as the scroll goes", then "The reproduction should be PERFECT,
 * the flow supersmooth every movement well calibrated"). On desktops the stage pins and the scroll
 * tells it in three moves (buildInfraScroll, LpInfraAnim). The next day: "It should be way more
 * juicy and spread accross the page and show they're a bit everywhere maybe show the tools a bit
 * everywhere that go in 3 bucjets and unified in pancake", then "Comment BCP plus insister sur les
 * 3 briques CONTEXT / DATA / TOOLS ? … quitte a les faire arriver en premier puis faire arriver
 * les petits details". So: the three bricks (Context, Signals, Tools) come up first, large; then
 * their contents appear in place (2026-10-28: "je ferais pas arriver tout de tous les cotes mais
 * je ferai apparaitre tout a l interieur de maniere simple et best practice"; until then they flew
 * in from all over the page); then Pancake comes up over them and every cable draws at once, down
 * to the three and up to your agent. Elsewhere the card plays its build-up
 * once, and only its leads move after it (buildInfraLoop; Mobbin: Antimetal's "Needs your
 * decision" cards).
 *
 * 2026-10-28, on the bricks closing up into a platform as a dotted canvas came in: "Je crois que
 * je prefere sans le resserrement qui correspond a l arrivee du background avec les points et je
 * ne veux pas du background point je trouve ca bien que ca occupe plus d espace / J integrerai le
 * pancake das un truc plus beau et moins vibe coded que dans la version actuelle - check mobbin
 * in case". So the cards stay as the scroll fills them, a size up and spread over the page, with
 * no canvas and no platform under them; Pancake is the brand's own lockup on plum (the avatar's
 * colour mascot, whose three pancakes are the cards' three colours, and the footer's cream
 * wordmark), the node the three cards hang from: Mobbin's Cartesia "Your code" node, a size up
 * from the nodes it branches down to, its fork drawn with the wire's hairline.
 *
 * The same day, before this: the headings "Give your agent everything it needs to sell." (his)
 * and "Everything your agent needs to sell."; a first "juice" pass of ambient loops, live notes,
 * beams and rings, gone on "Ton animation elle fait molle et tres vibe codee dude" and "nothing
 * should look vibe coded / everything should be inspired from our design system OR from a best in
 * class component taken from mobbin"; the cards' sentences, gone on "Trop de texte trop de
 * complexité ici !" (a card is its badge, its title and its picture); the labels are "Context /
 * Data / Tools" ("No 'The'"); no glowing borders ("Glowing borders look vibe coded").
 *
 * The page's model (2026-10-21, the infra outline the founder approved: "one sentence, one
 * diagram, three layers"). The first version (eight layers, Deploy / Host / Run, four figures on a
 * dark card) read as engineering notes: "I dont understand anything about the new block". Claims
 * in docs/infra/infra-landing-brief.md, the 30+ data providers being the founder's figure (the
 * dive's signals story, lp-story-signals-data.ts).
 *
 * The look (founder 2026-10-22: "make this more beautiful - use design system - toolkits like
 * mobin and brand assets"): Mobbin's infra diagrams (Cloudflare's grouped nodes, Coda's
 * product-as-hub) drawn with the kit. Each of Pancake's three layers takes the colour of its
 * pancake in the logo (the kit's canonical stack: yellow on top, purple, pink under) as a kit
 * brand card with a kit badge. Each card shows a small
 * picture of what it holds, cast from the page's one story (the cast in lp-step-data.ts): Acme's
 * brain, the providers' own marks (unmodified, half the disc's width on a white disc, as the
 * dive's signals story draws them: five of its six, as approved on 2026-10-22), and the Play
 * that reaches warm accounts, with its leads (a buyer's title over the signal that found them)
 * waiting for approval.
 *
 * The markup below is the finished picture (no JS, reduced motion, the build-up's end, the
 * scroll's end).
 */

type Tone = "yellow" | "purple" | "pink";
/* The cards' labels: "Context", "Signals", "Tools" (founder 2026-10-26: "No 'The'"; they were
   "The brain", "The data", "The tools"; the second was "Data" until his preview comment on it,
   2026-10-29: "Signals"). */
type Layer = { tone: Tone; name: string; title: string; pic: ComponentType };

const LAYERS: readonly Layer[] = [
  {
    tone: "yellow",
    name: "Context",
    title: "Knows how you sell",
    pic: BrainPic,
  },
  {
    tone: "purple",
    name: "Signals",
    title: "Finds who to sell to",
    pic: DataPic,
  },
  {
    tone: "pink",
    name: "Tools",
    title: "Runs your Plays",
    pic: ToolsPic,
  },
];

/** what the context holds, said as what each part is, not as an invented company's notes
    (founder 2026-10-28: "giving examples like fake names i am not sure it's what talks the
    most"): the ICP, the voice and the CRM, his "Unified GTM context" */
const MEMORY = [
  { key: "ICP", value: "Who buys, and why" },
  { key: "Voice", value: "How you write" },
  { key: "CRM", value: "Your accounts and deals" },
] as const;

/** five of the providers the product names to its users (the same five as the dive's signals
    story, lp-story-signals-data.ts); `id`
    pairs each disc with its piece in the scroll version */
const PROVIDERS = [
  { id: "apify", name: "Apify", logo: "/lp/story-sources/apify.svg" },
  { id: "theirstack", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg" },
  { id: "coresignal", name: "Coresignal", logo: "/lp/story-sources/coresignal.svg" },
  { id: "wappalyzer", name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg" },
  { id: "firecrawl", name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png" },
] as const;

/** the brain's other sections, as chips under its notes */
const CONTEXT_CHIPS = ["Personas", "Competitors"] as const;

/** what the data finds: the buying signals (as the dive's signals story fans them out) and the
    enrichment, not one invented lead's two signals */
const SIGNALS = [
  { id: "signals", label: "Hiring, funding, site visits" },
  { id: "emails", label: "Work emails on demand" },
] as const;

/** three of the CRMs a workspace connects (the dive names HubSpot, Attio, Pipedrive and Close) */
const CRMS = [
  { id: "hubspot", name: "HubSpot", logo: "/lp/vendor-logos/hubspot.svg" },
  { id: "attio", name: "Attio", logo: "/lp/vendor-logos/attio.svg" },
  { id: "pipedrive", name: "Pipedrive", logo: "/lp/vendor-logos/pipedrive.svg" },
] as const;

/** each mark's pancake */
const SHAPE: Record<string, number> = {
  ...Object.fromEntries(PROVIDERS.map((p, i) => [p.id, i + 1])),
  ...Object.fromEntries(CRMS.map((c, i) => [c.id, i + 2])),
  more: 3,
};

/** The leads the Play brings up for approval, in turn: who and why, never an invented person:
    a role at a real startup over the signal that found them, the company's initial on the
    avatar (founder 2026-10-28: roles at real companies instead of invented people; the signals
    are illustrative) */
const LEADS = [
  { initials: "V", name: "Sales @ Vapi", signal: "Hiring SDRs" },
  { initials: "M", name: "Growth @ Mintlify", signal: "Just raised" },
  { initials: "G", name: "Marketing @ Granola", signal: "Visited your site" },
] as const;


/* The kit's pancakes (_design-kit/pancake.html, `pancake-top-bordered-1…3`: an imperfect round
   seen from above, its back layer showing under it as the pancake's edge). Founder 2026-10-27:
   "Les petits ronds peuvent etre des ronds imparfaits un peu comme les pancake du design system":
   every small round of the section is one, the vendors' marks on its white face, its edge in the
   colour of the bucket it belongs to. Drawn once in a sprite (as the kit does), used by <Pk>. */
const PK_SHAPES = [
  {
    back: "M25.9381 48C33.3476 48 39.2723 42.626 43.3305 37.1936C46.1161 33.4647 47.7671 28.7568 47.8098 23.4826C47.9152 10.471 37.572 -4.71682e-06 24.9517 -4.71682e-06C12.3313 -4.71682e-06 1.5995 9.21835 0.284057 23.4826C-0.514219 32.1381 3.48143 36.8362 7.99137 40.6918C12.4705 44.521 19.7118 48 25.9381 48Z",
    front: "M25.8574 44C32.9581 44 38.6359 39.0738 42.5251 34.0941C45.1946 30.676 46.7768 26.3604 46.8178 21.5257C46.9187 9.59842 37.0065 -6.85743e-06 24.912 -6.85743e-06C12.8175 -6.85743e-06 2.53285 8.45015 1.27222 21.5257C0.507207 29.4599 4.33637 33.7665 8.65839 37.3008C12.9509 40.8109 19.8905 44 25.8574 44Z",
  },
  {
    back: "M23.3576 48C30.7788 48 39.2585 41.6636 43.3231 36.3538C46.1131 32.7091 47.7668 28.1075 47.8095 22.9524C47.9151 10.2346 37.5556 -4.71143e-06 24.9153 -4.71143e-06C19.1438 -4.71143e-06 13.8375 2.50121 9.57236 5.86992C4.4964 9.87906 0.208705 14.46 0.208705 22.9524C0.208746 36.6853 11.325 48 23.3576 48Z",
    front: "M23.3844 44C30.4964 44 38.6227 38.1916 42.518 33.3243C45.1918 29.9834 46.7765 25.7652 46.8175 21.0397C46.9186 9.38169 36.9908 -9.22488e-06 24.8772 -9.22488e-06C19.3461 -9.22488e-06 14.2609 2.29277 10.1735 5.38075C5.30905 9.0558 1.20001 13.255 1.20001 21.0397C1.20005 33.6282 11.8532 44 23.3844 44Z",
  },
  {
    back: "M22.1484 46.4163C26.967 46.4163 34.482 46.5516 39.1488 42.9163C44.8494 38.4758 47.7422 31.2041 47.7958 24.7072C47.9013 11.9254 38.4073 1.68428e-05 25.7706 1.68428e-05C20.0007 1.68428e-05 13.4127 1.53069 9.1488 4.91634C4.07427 8.94565 0.20837 14.2913 0.20837 22.8264C0.208411 36.6284 7.5672 46.4163 22.1484 46.4163Z",
    front: "M22.2261 42.5483C26.8439 42.5483 34.0458 42.6723 38.5181 39.34C43.9812 35.2696 46.7534 28.6038 46.8048 22.6483C46.9059 10.9317 37.8075 5.16207e-05 25.6973 5.16207e-05C20.1679 5.16207e-05 13.8544 1.40317 9.76813 4.50668C4.90504 8.20022 1.20022 13.1004 1.20022 20.9243C1.20026 33.5761 8.25243 42.5483 22.2261 42.5483Z",
  },
] as const;


export function LpInfra() {
  return (
    <section id="infra" className="lp-infra" aria-labelledby="lp-infra-title">
      <PkSprite />
      <div className="lp-infra__org">
        {/* the pin: on wide, tall desktops the stage stays put while the visitor scrolls through it
            and the three things come together (LpInfraAnim, data-scroll); elsewhere it is a plain
            block and the card plays its build-up once */}
        <div className="lp-infra__pin">
          <div className="lp-infra__stage">
            <header className="lp-infra__head">
              {/* the heading alone: "Pancake brings all 3." went on 2026-10-27 ("Remove the
                  'Pancake brings all 3.'") */}
              <h2 id="lp-infra-title" className="lp-infra__title lp-title-section">
                Your agent needs 3 things to sell.
              </h2>
            </header>
            <LpInfraFlow>
              {/* your agent: its two chips, no label beside them (founder 2026-10-27: "Remove 'Your
                  agent' next to the 2 logos"); the heading says it, the list keeps the name for
                  screen readers */}
              <div className="lp-infra__agentbar">
                <ul className="lp-infra__agents" aria-label="Your agent">
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
              {/* your agent plugs straight into Pancake (founder 2026-10-27, on the sign-in pill that
                  sat on this wire: "One sign-in. No API keys. => Remove / Just put the Pancake part
                  instead") */}
              <div className="lp-infra__link">
                <Wire />
              </div>
              {/* Pancake: the brand's lockup on plum, the avatar's colour mascot and the footer's
                  cream wordmark (the looped k is drawn, never typed). It was a white bar holding a
                  chip with the name typed in (2026-10-27: "Pancake peut etre mieux positionné et
                  unifié avec design de claude codex"), then "plus beau et moins vibe coded" */}
              <div className="lp-infra__brand">
                <PancakeMark />
                {/* eslint-disable-next-line @next/next/no-img-element -- the footer's wordmark file, as the nav's */}
                <img className="lp-infra__wordmark" src="/lp/lp-footer-logo.svg" alt="Pancake" width={239.672} height={116.755} />
              </div>
              {/* Pancake branches down to its three cards: a stem, and arms out to the side cards
                  (Cartesia's fork, in the wire's hairline). Where the cards stack, the stem alone
                  runs into the first */}
              <div className="lp-infra__fork" aria-hidden="true">
                <i className="lp-infra__fork-arms" />
                <i className="lp-infra__fork-stem" />
              </div>
              <ul className="lp-infra__parts">
                {LAYERS.map(({ tone, name, title, pic: Pic }) => (
                  <li key={name} className="lp-infra__part" data-tone={tone}>
                    {/* the scroll version opens on this word alone, large (infra.css) */}
                    <span className="lp-infra__part-word" aria-hidden="true">
                      {name}
                    </span>
                    <div className="lp-infra__pic" aria-hidden="true">
                      <Pic />
                    </div>
                    <p className="lp-infra__part-name">{name}</p>
                    <h3 className="lp-infra__part-title">{title}</h3>
                  </li>
                ))}
              </ul>
            </LpInfraFlow>
          </div>
        </div>
      </div>
    </section>
  );
}

/** the pancakes' sprite, once in the section */
function PkSprite() {
  return (
    <svg className="lp-infra__sprite" aria-hidden="true" focusable="false">
      {PK_SHAPES.map((shape, i) => (
        <symbol key={i} id={`lp-infra-pk-${i + 1}`} viewBox="0 0 48 48">
          <path d={shape.back} fill="var(--lp-pk-back)" />
          <path d={shape.front} fill="var(--lp-pk-front)" />
        </symbol>
      ))}
    </svg>
  );
}

/** one pancake, shape 1–3, under what it holds */
function Pk({ shape }: { shape: number }) {
  return (
    <svg className="lp-infra__cake" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <use href={`#lp-infra-pk-${((shape - 1) % PK_SHAPES.length) + 1}`} />
    </svg>
  );
}

/** a lead's face: the initials on a pink pancake */
function LeadFace({ initials }: { initials: string }) {
  return (
    <span className="lp-infra__lead-avatar">
      <Pk shape={2} />
      <span>{initials}</span>
    </span>
  );
}

/** a hairline wire (drawn by the build-up: scaleY on a 1 px box) */
function Wire() {
  return (
    <span className="lp-infra__wire" aria-hidden="true">
      <i className="lp-infra__line" />
    </span>
  );
}

/** The Pancake mark, full colour (as step 02's, LpStepMocks): its three pancakes are the three
    layers. The view box is the avatar's, cropped to the mascot (the avatar keeps room around it) */
function PancakeMark() {
  return (
    <svg className="lp-infra__pk" viewBox="3.9 4.9 24 24" aria-hidden="true" focusable="false">
      {PANCAKE_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

function BrainPic() {
  return (
    <div className="lp-infra__brain">
      <dl className="lp-infra__memory">
        {MEMORY.map((row) => (
          <div key={row.key} className="lp-infra__mem-row" data-fill={row.key.toLowerCase()}>
            <dt>{row.key}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="lp-infra__chips">
        {CONTEXT_CHIPS.map((chip) => (
          <li key={chip} className="lp-infra__chip" data-fill={chip.toLowerCase()}>
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataPic() {
  return (
    <div className="lp-infra__data">
      <ul className="lp-infra__discs">
        {PROVIDERS.map((provider, i) => (
          <li key={provider.name} className="lp-infra__disc" data-fill={provider.id}>
            <Pk shape={SHAPE[provider.id] ?? i + 1} />
            {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
            <img src={provider.logo} alt="" width={22} height={22} loading="lazy" decoding="async" />
          </li>
        ))}
        <li className="lp-infra__disc lp-infra__disc--more" data-fill="more">
          <Pk shape={SHAPE.more} />
          <span>30+</span>
        </li>
      </ul>
      <ul className="lp-infra__signals">
        {SIGNALS.map((signal) => (
          <li key={signal.id} className="lp-infra__signal" data-fill={signal.id}>
            {signal.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolsPic() {
  return (
    <div className="lp-infra__tools">
      <div className="lp-infra__play" data-fill="play">
        <PlayIcon />
        <span className="lp-infra__play-name">{PLAY_NAME}</span>
        <span className="lp-infra__toggle" data-fill="toggle">
          <i className="lp-infra__toggle-knob" />
        </span>
      </div>
      <ul className="lp-infra__leads" data-fill="lead">
        {LEADS.map((lead) => (
          <li key={lead.name} className="lp-infra__lead">
            <LeadFace initials={lead.initials} />
            <span className="lp-infra__lead-who">
              <span className="lp-infra__lead-name">{lead.name}</span>
              <span className="lp-infra__lead-co">{lead.signal}</span>
            </span>
            <span className="lp-infra__approve">
              <span className="lp-infra__approve-do">Approve</span>
              <span className="lp-infra__approve-ok">Approved</span>
            </span>
          </li>
        ))}
      </ul>
      <ul className="lp-infra__crms">
        {CRMS.map((crm) => (
          <li key={crm.id} className="lp-infra__crm" data-fill={crm.id}>
            <Pk shape={SHAPE[crm.id] ?? 1} />
            {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
            <img src={crm.logo} alt={crm.name} width={14} height={14} loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** the Play's name and icon, in the card and on its piece */
/** the Play's job, not an example Play's name: the deck's sends go to warm accounts, approved by you */
const PLAY_NAME = "Reach warm accounts";
function PlayIcon() {
  return (
    <span className="lp-infra__play-icon">
      <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
        <path d="M5.5 3.8v8.4L12 8z" />
      </svg>
    </span>
  );
}
