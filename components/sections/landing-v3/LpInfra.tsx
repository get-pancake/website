import type { CSSProperties, ComponentType } from "react";

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
 * les petits details". So: the three bricks (Context, Data, Tools) come up first, large; then the
 * details of a go-to-market (BITS) pop up all over the screen and fly into their brick; then
 * Pancake comes up over them, branches down to all three and connects to your agent. The sources:
 * Mobbin's Front and Tines integration heroes (white logo discs scattered around a centred
 * heading), Antimetal's discs of several sizes for depth, and save.design's hero (scattered
 * pieces converging into the product, measured live). Elsewhere the card plays its build-up
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
 * diagram, three layers", as Apollo's "One system. Three layers." and Cargo's "your agent writes
 * it, Cargo runs it"). The first version (eight layers, Deploy / Host / Run, four figures on a
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
    title: "Knows how you sell",
    pic: BrainPic,
  },
  {
    tone: "purple",
    name: "Data",
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

/** what the brain knows about Acme, the page's studio that designs websites for startups */
const MEMORY = [
  { key: "Sells", value: "Websites for startups" },
  { key: "Buyers", value: "Funded founders" },
  { key: "Voice", value: "Warm and short" },
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

/** the two signals of the page's Play: Quillfern raised a seed round and is hiring a marketing lead */
const SIGNALS = [
  { id: "seed", label: "Raised a seed round" },
  { id: "hiring", label: "Hiring a marketing lead" },
] as const;

/** three of the CRMs a workspace connects (the dive names HubSpot, Attio, Pipedrive and Close) */
const CRMS = [
  { id: "hubspot", name: "HubSpot", logo: "/lp/vendor-logos/hubspot.svg" },
  { id: "attio", name: "Attio", logo: "/lp/vendor-logos/attio.svg" },
  { id: "pipedrive", name: "Pipedrive", logo: "/lp/vendor-logos/pipedrive.svg" },
] as const;

/** each mark's pancake, the same in the card and on the piece that flies there */
const SHAPE: Record<string, number> = {
  ...Object.fromEntries(PROVIDERS.map((p, i) => [p.id, i + 1])),
  ...Object.fromEntries(CRMS.map((c, i) => [c.id, i + 2])),
  more: 3,
};

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
   pancakes; vetted files, docs/public-assets/lp/vendor-logos/README.md), the Play's switch and Tamsin
   waiting for approval (lp-step-data.ts). `fill` names what the piece becomes in its bucket (data-fill in the cards).
   Places are in the card's own px at full size, from its top edge (y) and its centre (x): `x`
   beyond the title's half width (360) stretches or shrinks with the window's width
   (--lp-infra-reach), `y` beyond the band of the agent and the buckets with its height
   (--lp-infra-reach-y, LpInfraAnim), so the pieces use the whole screen. `s` is the piece's size, for depth; `r` its tilt (marks are never tilted). Shown
   only in the scroll version. */
type Bucket = "context" | "data" | "tools";
type Bit = { to: Bucket; fill: string; x: number; y: number; s: number; r: number; last?: true } & (
  | { kind: "logo"; logo: string }
  | { kind: "badge" | "signal"; label: string }
  | { kind: "row"; label: string; value: string }
  | { kind: "more" | "play" | "toggle" | "lead" }
);

/* Every piece lands on its own place in its brick (data-fill, the same name on both): founder
   2026-10-27, "mieux flecher chacun de ces elements vers sa place finale dans la card la on n
   amene pas chaque objet dans sa position finale on triche un peu". */
const BITS: readonly Bit[] = [
  { to: "context", kind: "row", label: "Buyers", value: "Funded founders", fill: "buyers", x: -560, y: -95, s: 1, r: 4 },
  { to: "context", kind: "row", label: "Sells", value: "Websites for startups", fill: "sells", x: -500, y: 20, s: 1.05, r: -3 },
  { to: "context", kind: "row", label: "Voice", value: "Warm and short", fill: "voice", x: -330, y: 160, s: 0.95, r: -2 },
  { to: "context", kind: "badge", label: "Personas", fill: "personas", x: -650, y: 300, s: 2, r: 6 },
  { to: "context", kind: "badge", label: "Competitors", fill: "competitors", x: -450, y: 560, s: 1.9, r: -5 },
  { to: "data", kind: "logo", logo: "/lp/story-sources/apify.svg", fill: "apify", x: -420, y: -70, s: 1.35, r: 0 },
  { to: "data", kind: "logo", logo: "/lp/story-sources/coresignal.svg", fill: "coresignal", x: 470, y: -75, s: 0.85, r: 0 },
  { to: "data", kind: "logo", logo: "/lp/story-sources/theirstack.svg", fill: "theirstack", x: -230, y: 30, s: 0.8, r: 0 },
  { to: "data", kind: "logo", logo: "/lp/story-sources/wappalyzer.svg", fill: "wappalyzer", x: 230, y: 25, s: 0.8, r: 0 },
  { to: "data", kind: "logo", logo: "/lp/story-sources/firecrawl.png", fill: "firecrawl", x: 670, y: 280, s: 1.1, r: 0 },
  { to: "data", kind: "more", fill: "more", x: -90, y: 150, s: 0.95, r: 0 },
  { to: "data", kind: "signal", label: "Raised a seed round", fill: "seed", x: -120, y: 560, s: 1.35, r: 3 },
  { to: "data", kind: "signal", label: "Hiring a marketing lead", fill: "hiring", x: 150, y: 595, s: 1.25, r: -3 },
  { to: "tools", kind: "logo", logo: "/lp/vendor-logos/hubspot.svg", fill: "hubspot", x: 640, y: -100, s: 1.3, r: 0 },
  { to: "tools", kind: "logo", logo: "/lp/vendor-logos/attio.svg", fill: "attio", x: 420, y: 10, s: 0.9, r: 0 },
  { to: "tools", kind: "logo", logo: "/lp/vendor-logos/pipedrive.svg", fill: "pipedrive", x: 680, y: 450, s: 0.8, r: 0 },
  { to: "tools", kind: "play", fill: "play", x: 500, y: 130, s: 1, r: -2 },
  { to: "tools", kind: "toggle", fill: "toggle", x: 290, y: 150, s: 1.2, r: 0 },
  { to: "tools", kind: "lead", fill: "lead", last: true, x: 420, y: 565, s: 1, r: -3 },
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

/** The scroll version's pieces (BITS), hidden elsewhere (infra.css): each the look of the place
    it lands on */
function Bits() {
  return (
    <div className="lp-infra__bits" aria-hidden="true">
      {BITS.map((bit) => {
        const xi = Math.max(-TITLE_HALF, Math.min(TITLE_HALF, bit.x));
        const yi = Math.max(BAND_TOP, Math.min(BAND_BOTTOM, bit.y));
        const props = {
          className: `lp-infra__bit lp-infra__bit--${bit.kind}`,
          "data-to": bit.to,
          "data-fill": bit.fill,
          "data-last": bit.last,
          "data-s": bit.s,
          "data-r": bit.r,
          style: { "--xi": xi, "--xo": bit.x - xi, "--yi": yi, "--yo": bit.y - yi } as CSSProperties,
        };
        switch (bit.kind) {
          case "logo":
            return (
              <span key={bit.fill} {...props}>
                <Pk shape={SHAPE[bit.fill] ?? 1} />
                {/* eslint-disable-next-line @next/next/no-img-element -- the vendor's own mark, unmodified */}
                <img src={bit.logo} alt="" width={30} height={30} loading="lazy" decoding="async" />
              </span>
            );
          case "more":
            return (
              <span key={bit.fill} {...props}>
                <Pk shape={SHAPE.more} />
                <span>30+</span>
              </span>
            );
          case "row":
            return (
              <span key={bit.fill} {...props}>
                <span className="lp-infra__bit-key">{bit.label}</span>
                <span className="lp-infra__bit-val">{bit.value}</span>
              </span>
            );
          case "play":
            return (
              <span key={bit.fill} {...props}>
                <PlayIcon />
                <span className="lp-infra__play-name">{PLAY_NAME}</span>
                <i className="lp-infra__bit-gap" />
              </span>
            );
          case "toggle":
            return (
              <span key={bit.fill} {...props}>
                <i />
              </span>
            );
          case "lead":
            return (
              <span key={bit.fill} {...props}>
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
              <span key={bit.fill} {...props}>
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
              <span className="lp-infra__lead-co">{lead.company}</span>
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
const PLAY_NAME = "Funded startups hiring a marketing lead";
function PlayIcon() {
  return (
    <span className="lp-infra__play-icon">
      <svg viewBox="0 0 16 16" width="16" height="16" focusable="false">
        <path d="M5.5 3.8v8.4L12 8z" />
      </svg>
    </span>
  );
}
