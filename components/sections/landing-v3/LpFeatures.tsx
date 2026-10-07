import { LpFeatAnim } from "@/components/sections/landing-v3/LpFeatAnim";
import type { FeatVariant } from "@/components/sections/landing-v3/lp-feat-timelines";
import { PLAYS_PATH } from "@/components/sections/plays/plays-copy";

/**
 * Landing v3 — section 6 "How Pancake finds customers" (Figma 4257:4976,
 * rev2 artboard 1654×2969). Heading + 4 feature cards (1296×621) + 4 hairline
 * separators. Each card's mock UI is an animation (founder 2026-09-02:
 * "animate the four buckets, fully derived from the designer's picture, the
 * picture is the final screen") — rendered IN PLACE as DOM + CSS + GSAP since
 * 2026-09-03 (founder: no video downloads, vector-based), the same markup,
 * geometry and choreography as the pancake-studio compositions that used to
 * be served as mp4s (LpFeatMocks.tsx, features.css, lp-feat-timelines.ts).
 * LpFeatAnim plays each once as its card arrives (lp-play-once.ts) and holds
 * the designer's picture as the last frame — which is also what the markup
 * shows before and without the animation.
 */

/** A quiet text link under a card's body (.lp-textlink, pricing.css: the "See how →" under
 *  the demo tour is the pattern). One card carries one, never a pill: the cards sell, the
 *  link only routes. */
type FeatureMore = { href: string; label: string };

function FeatureText({ title, body, more }: { title: string; body: string; more?: FeatureMore }) {
  return (
    <div className={more ? "lp-feat-text lp-feat-text--more" : "lp-feat-text"}>
      <h3 className="lp-title-card lp-feat-h">{title}</h3>
      <p className="lp-feat-body">{body}</p>
      {more ? (
        <p className="lp-feat-more">
          <a className="lp-textlink" href={more.href}>
            {more.label}
            <span aria-hidden="true"> →</span>
          </a>
        </p>
      ) : null}
    </div>
  );
}

type Feature = {
  side: "left" | "right";
  title: string;
  body: string;
  variant: FeatVariant;
  alt: string;
  more?: FeatureMore;
};

const FEATURES: Feature[] = [
  // Plays open the section (2026-09-30): a Play is the unit of work, and the
  // card replaced the AI-answers one (f3) when AI SEO was retired. Sides keep
  // alternating: f5 left, f1 right, f2 left, f4 right.
  // 2026-10-07 copy pass (titles kept except f4): f5 carries the ads line
  // ("Tell Pancake who to reach. It builds the Play.") and sells the
  // clarifying questions + the nightly search; f1 lists every way a Play finds
  // people (funding and lookalikes included: they are in the app, and what
  // the app does can be pitched, founder 2026-10-07) and the ICP check; f2
  // opens with the lead's signal (a post, an open role, a new tool), sells the
  // per-sequence language and tone and the editable draft, and its mock
  // message asks instead of pitching; f4 sells what the brain learns from
  // (lead reviews) and the per-Play stats. Its mock keeps the "+56%" chart
  // and the f2 post keeps its globe and action icons (founder 2026-10-08).
  // 2026-10-07 (founder: "inspire-toi de la compet pour rendre accessible les
  // pages que t'as créées"; Origami's "Explore buyer examples" under its plays
  // carousel is the model): the Plays card routes to /plays, the example-Plays
  // gallery, with one text line under its body. Here, not under step 02: this
  // card is the one about asking for a Play, and its text column floats beside
  // the art (centered ≥1341, a flex column ≤1340, stacked above it on phones),
  // so a line more never reaches the art box. Step 02's text card shares its
  // row with the fixed-aspect art card: at 1030 wide that card is 313px tall
  // and step 02's text already needs 310, so a 40px line would stretch the
  // row (measured 2026-10-07). ≥1341 the line sits in the column's bottom padding
  // (features.css .lp-feat-text--more), so the title and body keep their
  // artboard position.
  {
    side: "left",
    title: "Ask for the people \nyou want",
    body: "Tell Pancake who to reach. It builds the Play: who, how to find them, how many. It asks what it needs, searches every night and says why each lead fits.",
    more: { href: PLAYS_PATH, label: "See example Plays" },
    variant: "f5",
    alt: "Animation: in the Pancake Agent, the request Find US SaaS founders with a launch coming up is typed and sent; Pancake plans a Play called Founders about to launch (who: early-stage SaaS founders in the US, found through the people engaging with launch posts, 25 leads per search), it is created and switches from Draft to Active, its Discover, Enrich and Qualify steps complete, and 25 new leads arrive, the first three each with a line on why they fit: the search that surfaced them, then the requirement they meet, such as Commented on a launch post, Seed-stage SaaS.",
  },
  {
    side: "right",
    title: "Tell Pancake \nwhat to watch",
    body: "Pick keywords, competitors, experts, one specific post, hiring, tech stack, fresh funding or lookalikes of a company you name. Pancake checks every match against your ICP and shows the signal behind it.",
    variant: "f1",
    alt: "Animation: a Signals panel where keyword mentions, competitor engagement, companies hiring and technologies used switch on one by one (4 active), then a Roles panel where Sales, Marketing and Customer success get checked (3 selected), and a clay alternatives note lands by the first signal.",
  },
  {
    side: "left",
    title: "Every first message starts warm",
    body: "Pancake opens with their signal: a post, an open role, a new tool. Each sequence has its own language and tone. Edit any draft before it sends.",
    variant: "f2",
    alt: "Animation: a post by Sarah Velasquez, design lead at Shift, announcing a Product Hunt launch in 21 days, then a draft message is written inside a rainbow ring — Hey Sarah, saw you're launching on Product Hunt in 21 days. How will you show it on launch day, a video or screenshots? — its status reads Draft ready, then Message sent.",
  },
  {
    side: "right",
    title: "Pancake learns from every review",
    body: "Approve or reject a lead and your brain learns who fits. Each Play tracks contacts, replies and wins, so you see what works.",
    variant: "f4",
    alt: "Animation: a chart grows week by week to a reply rate 56% up versus last period, a Brain learned card lists Founders, not marketers, Seed to Series A and US only, and a Brain updated card confirms your next search starts from it.",
  },
];

function FeatureCard({ f }: { f: Feature }) {
  return (
    <>
      <article className="lp-feat-card" data-side={f.side} data-variant={f.variant}>
        <FeatureText title={f.title} body={f.body} more={f.more} />
        <LpFeatAnim className="lp-feat-mockzone" variant={f.variant} alt={f.alt} />
      </article>
      <hr className="lp-feat-sep" />
    </>
  );
}

export function LpFeatures() {
  return (
    <section className="lp-feat" aria-labelledby="lp-feat-heading-title">
      <div className="lp-feat-heading">
        <h2 id="lp-feat-heading-title" className="lp-title-section lp-feat-headline">
          How Pancake finds customers
        </h2>
      </div>
      {FEATURES.map((f) => (
        // rev2 artboard closes the section with a 4th separator (4526:3448)
        <FeatureCard key={f.variant} f={f} />
      ))}
    </section>
  );
}
