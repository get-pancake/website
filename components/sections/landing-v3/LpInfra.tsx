import type { CSSProperties, ComponentType } from "react";

import { ClaudeMark, CodexMark } from "@/components/sections/landing-v3/LpAgentMarks";
import { LpInfraFlow } from "@/components/sections/landing-v3/LpInfraAnim";
import { SL_AVATAR } from "@/components/sections/landing-v3/lp-story-learns-art";

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
 * les petits details". So: the three bricks (Context, Data, Tools) come up first, large; then the
 * details of a go-to-market (BITS) pop up all over the screen and fly into their brick; then the
 * bricks close up into Pancake's platform, which connects to your agent. The sources: Mobbin's Front and Tines integration
 * heroes (white logo discs scattered around a centred heading, Tines on a dotted canvas),
 * Antimetal's discs of several sizes for depth, and save.design's hero (scattered pieces
 * converging into the product, measured live). Elsewhere the card plays its build-up once, and
 * only its leads move after it (buildInfraLoop; Mobbin: Antimetal's "Needs your decision"
 * cards).
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
 * diagram, three layers", as Apollo's "One system. Three layers." and Cargo's "your agent writes
 * it, Cargo runs it"). The first version (eight layers, Deploy / Host / Run, four figures on a
 * dark card) read as engineering notes: "I dont understand anything about the new block". Claims
 * in docs/infra/infra-landing-brief.md, the 30+ data providers being the founder's figure (the
 * dive's sources story).
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
 * The markup below is the finished picture (no JS, reduced motion, the build-up's end, the
 * scroll's end).
 */

type Tone = "yellow" | "purple" | "pink";
/* The cards' labels: "Context", "Data", "Tools" (founder 2026-10-26: "No 'The'"; they were
   "The brain", "The data", "The tools"). */
type Layer = { tone: Tone; name: string; title: string; pic: ComponentType };

const LAYERS: readonly Layer[] = [
  {
    tone: "yellow",
    name: "Context",
    title: "Knows your business",
    pic: BrainPic,
  },
  {
    tone: "purple",
    name: "Data",
    title: "Finds your buyers",
    pic: DataPic,
  },
  {
    tone: "pink",
    name: "Tools",
    title: "Runs your Plays",
    pic: ToolsPic,
  },
];

/** what the brain knows about Acme, the page's studio that designs websites for startups */
const MEMORY = [
  { key: "Sells", value: "Websites for startups" },
  { key: "Buyers", value: "Funded founders" },
  { key: "Voice", value: "Warm and short" },
] as const;

/** five of the providers the product names to its users (lp-story-sources-data.ts hub); `id`
    pairs each disc with its piece in the scroll version */
const PROVIDERS = [
  { id: "apify", name: "Apify", logo: "/lp/story-sources/apify.svg" },
  { id: "theirstack", name: "TheirStack", logo: "/lp/story-sources/theirstack.svg" },
  { id: "coresignal", name: "Coresignal", logo: "/lp/story-sources/coresignal.svg" },
  { id: "wappalyzer", name: "Wappalyzer", logo: "/lp/story-sources/wappalyzer.svg" },
  { id: "firecrawl", name: "Firecrawl", logo: "/lp/story-sources/firecrawl.png" },
] as const;

/** The leads the Play brings up for approval, in turn: the page's cast (LpStepMocks' leads). */
const LEADS = [
  { initials: "TO", name: "Tamsin Okafor", company: "Quillfern" },
  { initials: "JA", name: "Julien Aubert", company: "Brightloop" },
  { initials: "SM", name: "Samantha Mills", company: "Northvale" },
] as const;

/* The scroll version's pieces: what a company has lying around to run its go-to-market, all over
   the page before each flies into its bucket (founder 2026-10-27: "spread accross the page …
   show they're a bit everywhere … that go in 3 bucjets and unified in pancake", then "Les
   differents elements pourraient avoir des tailles differentes", "on est pas oblige de spread que
   des logos partout", "d autres elements … eparpilles un peu partout pour run ton gtm quand t es
   une boite"). Each is a piece of the page's own story or of the design system, never a made-up
   prop: the brain's sections (kit badges in the Context card's yellow) and two of its notes, the
   two signals of the page's Play (Quillfern raised a seed round and is hiring a marketing lead),
   the data providers and the CRMs the product names to its users (their own marks on the kit's
   pancakes; vetted files, public/lp/vendor-logos/README.md), the Play's switch, the message the
   page's story sends Tamsin (lp-story-message-data.ts, its first sentence) and Tamsin waiting for
   approval. `fill` names what the piece becomes in its bucket (data-fill in the cards).
   Places are in the card's own px at full size, from its top edge (y) and its centre (x): `x`
   beyond the title's half width (360) stretches or shrinks with the window's width
   (--lp-infra-reach), `y` beyond the band of the agent and the buckets with its height
   (--lp-infra-reach-y, LpInfraAnim), so the pieces use the whole screen. `s` is the piece's size, for depth; `r` its tilt (marks are never tilted). Shown
   only in the scroll version. */
type Bucket = "context" | "data" | "tools";
type Bit = { to: Bucket; x: number; y: number; s: number; r: number; fill?: string; last?: true } & (
  | { kind: "logo"; id: string; logo: string }
  | { kind: "badge" | "signal"; label: string }
  | { kind: "row"; label: string; value: string }
  | { kind: "message"; label: string; text: string }
  | { kind: "toggle" | "lead" }
);

const BITS: readonly Bit[] = [
  { to: "context", kind: "badge", label: "ICP", fill: "buyers", x: -640, y: -95, s: 1.3, r: -8 },
  { to: "context", kind: "row", label: "Sells", value: "Websites for startups", fill: "sells", x: -470, y: 30, s: 1.05, r: -3 },
  { to: "context", kind: "badge", label: "Personas", x: -260, y: 160, s: 0.9, r: 6 },
  { to: "context", kind: "badge", label: "Competitors", x: -480, y: 525, s: 0.85, r: -5 },
  { to: "context", kind: "row", label: "Voice", value: "Warm and short", fill: "voice", x: -180, y: 530, s: 0.95, r: 4 },
  { to: "data", kind: "logo", id: "apify", logo: "/lp/story-sources/apify.svg", x: -455, y: -70, s: 1.4, r: 0 },
  { to: "data", kind: "logo", id: "coresignal", logo: "/lp/story-sources/coresignal.svg", x: 470, y: -60, s: 0.85, r: 0 },
  { to: "data", kind: "logo", id: "theirstack", logo: "/lp/story-sources/theirstack.svg", x: -60, y: 150, s: 1, r: 0 },
  { to: "data", kind: "logo", id: "wappalyzer", logo: "/lp/story-sources/wappalyzer.svg", x: -670, y: 360, s: 0.8, r: 0 },
  { to: "data", kind: "logo", id: "firecrawl", logo: "/lp/story-sources/firecrawl.png", x: 665, y: 300, s: 1.15, r: 0 },
  { to: "data", kind: "signal", label: "Hiring a marketing lead", x: 480, y: 160, s: 1, r: -3 },
  { to: "data", kind: "signal", label: "Raised a seed round", x: 90, y: 520, s: 1.05, r: 3 },
  { to: "tools", kind: "logo", id: "hubspot", logo: "/lp/vendor-logos/hubspot.svg", x: 650, y: -95, s: 1.35, r: 0 },
  { to: "tools", kind: "logo", id: "attio", logo: "/lp/vendor-logos/attio.svg", x: 290, y: 150, s: 0.95, r: 0 },
  { to: "tools", kind: "logo", id: "pipedrive", logo: "/lp/vendor-logos/pipedrive.svg", x: 660, y: 430, s: 0.8, r: 0 },
  { to: "tools", kind: "toggle", fill: "toggle", x: 240, y: -15, s: 1.2, r: 0 },
  { to: "tools", kind: "message", label: "Sent", text: "Hi Tamsin, congrats on Quillfern\u2019s seed round.", x: 380, y: 540, s: 0.95, r: -2 },
  { to: "tools", kind: "lead", fill: "lead", last: true, x: 430, y: 40, s: 1, r: -3 },
];

/** the title's half width: a piece's x beyond it follows the window's width */
const TITLE_HALF = 360;
/** the band around the agent and the buckets: a piece's y above or below it follows the room
    the window leaves above the heading and under the card (--lp-infra-reach-y) */
const BAND_TOP = -40;
const BAND_BOTTOM = 490;

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
              <i className="lp-infra__canvas" aria-hidden="true" />
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
              {/* your agent plugs straight into Pancake (founder 2026-10-27, on the sign-in pill that
                  sat on this wire: "One sign-in. No API keys. => Remove / Just put the Pancake part
                  instead") */}
              <div className="lp-infra__link">
                <Wire />
              </div>
              {/* Pancake: the platform, its name on the edge where the wire plugs in */}
              <div className="lp-infra__brand">
                <PancakeMark />
                {/* eslint-disable-next-line @next/next/no-img-element -- the nav's wordmark SVG */}
                <img className="lp-infra__logo" src="/lp/lp-nav-logo.svg" alt="Pancake" width={114.956} height={56} />
              </div>
              <div className="lp-infra__stack">
                <i className="lp-infra__plat" aria-hidden="true" />
                <ul className="lp-infra__parts">
                  {LAYERS.map(({ tone, name, title, pic: Pic }) => (
                    <li key={name} className="lp-infra__part" data-tone={tone}>
                      <div className="lp-infra__pic" aria-hidden="true">
                        <Pic />
                      </div>
                      <p className="lp-infra__part-name">{name}</p>
                      <h3 className="lp-infra__part-title">{title}</h3>
                    </li>
                  ))}
                </ul>
              </div>
              <Bits />
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

/** The scroll version's pieces (BITS), hidden elsewhere (infra.css) */
function Bits() {
  return (
    <div className="lp-infra__bits" aria-hidden="true">
      {BITS.map((bit, i) => {
        const xi = Math.max(-TITLE_HALF, Math.min(TITLE_HALF, bit.x));
        const yi = Math.max(BAND_TOP, Math.min(BAND_BOTTOM, bit.y));
        const fill = bit.kind === "logo" ? bit.id : bit.fill;
        const props = {
          className: `lp-infra__bit lp-infra__bit--${bit.kind}`,
          "data-to": bit.to,
          "data-fill": fill,
          "data-last": bit.last,
          "data-s": bit.s,
          "data-r": bit.r,
          style: { "--xi": xi, "--xo": bit.x - xi, "--yi": yi, "--yo": bit.y - yi } as CSSProperties,
        };
        switch (bit.kind) {
          case "logo":
            return (
              <span key={i} {...props}>
                <Pk shape={i + 1} />
                {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
                <img src={bit.logo} alt="" width={30} height={30} loading="lazy" decoding="async" />
              </span>
            );
          case "row":
            return (
              <span key={i} {...props}>
                <span className="lp-infra__bit-key">{bit.label}</span>
                <span className="lp-infra__bit-val">{bit.value}</span>
              </span>
            );
          case "message":
            return (
              <span key={i} {...props}>
                <span className="lp-infra__bit-eb">{bit.label}</span>
                <span className="lp-infra__bit-text">{bit.text}</span>
              </span>
            );
          case "toggle":
            return (
              <span key={i} {...props}>
                <i />
              </span>
            );
          case "lead":
            return (
              <span key={i} {...props}>
                <LeadFace initials={LEADS[0].initials} />
                <span className="lp-infra__lead-who">
                  <span className="lp-infra__lead-name">{LEADS[0].name}</span>
                  <span className="lp-infra__lead-co">{LEADS[0].company}</span>
                </span>
                <span className="lp-infra__approve">Approve</span>
              </span>
            );
          default:
            return (
              <span key={i} {...props}>
                {bit.label}
              </span>
            );
        }
      })}
    </div>
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

/** a hairline wire (drawn by the build-up, as the sources story draws its wires) */
function Wire() {
  return (
    <span className="lp-infra__wire" aria-hidden="true">
      <i className="lp-infra__line" />
    </span>
  );
}

/** The Pancake mark, full colour (as step 02's, LpStepMocks): its three pancakes are the three layers */
function PancakeMark() {
  return (
    <svg className="lp-infra__pk" viewBox={`0 0 ${SL_AVATAR.size} ${SL_AVATAR.size}`} aria-hidden="true" focusable="false">
      {SL_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

function BrainPic() {
  return (
    <dl className="lp-infra__memory">
      {MEMORY.map((row) => (
        <div key={row.key} className="lp-infra__mem-row" data-fill={row.key.toLowerCase()}>
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
        {PROVIDERS.map((provider, i) => (
          <li key={provider.name} className="lp-infra__disc" data-fill={provider.id}>
            <Pk shape={i + 1} />
            {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
            <img src={provider.logo} alt="" width={22} height={22} loading="lazy" decoding="async" />
          </li>
        ))}
        <li className="lp-infra__disc lp-infra__disc--more" data-fill="more">
          <Pk shape={3} />
          <span>30+</span>
        </li>
      </ul>
    </div>
  );
}

function ToolsPic() {
  return (
    <div className="lp-infra__tools">
      <div className="lp-infra__play" data-fill="play">
        <span className="lp-infra__play-icon">
          <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
            <path d="M5.5 3.8v8.4L12 8z" />
          </svg>
        </span>
        <span className="lp-infra__play-name">Funded startups hiring a marketing lead</span>
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
