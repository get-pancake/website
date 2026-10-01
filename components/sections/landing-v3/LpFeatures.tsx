import { LpFeatAnim } from "@/components/sections/landing-v3/LpFeatAnim";
import type { FeatVariant } from "@/components/sections/landing-v3/lp-feat-timelines";

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

function FeatureText({ title, body }: { title: string; body: string }) {
  return (
    <div className="lp-feat-text">
      <h3 className="lp-title-card lp-feat-h">{title}</h3>
      <p className="lp-feat-body">{body}</p>
    </div>
  );
}

type Feature = {
  side: "left" | "right";
  title: string;
  body: string;
  variant: FeatVariant;
  alt: string;
};

const FEATURES: Feature[] = [
  // Plays open the section (2026-09-30): a Play is the unit of work, and the
  // card replaced the AI-answers one (f3) when AI SEO was retired. Sides keep
  // alternating: f5 left, f1 right, f2 left, f4 right.
  {
    side: "left",
    title: "Ask for the people \nyou want",
    body: "Pancake turns one sentence into a Play: who to reach, how to find them, how many. You create it. Every lead comes back with why they fit.",
    variant: "f5",
    alt: "Animation: in the Pancake Agent, the request Find US SaaS founders with a launch coming up is typed and sent; Pancake plans a Play called Founders about to launch (who: early-stage SaaS founders in the US, found through the people engaging with launch posts, 25 leads per search), it is created and switches from Draft to Active, its Discover, Enrich and Qualify steps complete, and 25 new leads arrive, the first three each with a line on why they fit: the search that surfaced them, then the requirement they meet, such as Commented on a launch post, Seed-stage SaaS.",
  },
  {
    side: "right",
    title: "Tell Pancake \nwhat to watch",
    body: "Choose the keywords, competitors, influencers, hiring activity, and tech stacks that matter. Pancake finds matching prospects and shows the signal behind every match.",
    variant: "f1",
    alt: "Animation: a Signals panel where keyword mentions, competitor engagement, companies hiring and technologies used switch on one by one (4 active), then a Roles panel where Sales, Marketing and Customer success get checked (3 selected), and a clay alternatives note lands by the first signal.",
  },
  {
    side: "left",
    title: "Every first message starts warm",
    body: "Pancake opens with something they posted, never a pitch. Every message sounds like you.",
    variant: "f2",
    alt: "Animation: a post by Sarah Velasquez announcing a Product Hunt launch in 21 days, then a draft reply is written inside a rainbow ring — Hey Sarah, saw you're launching on Product Hunt in 21 days. We make SaaS launch videos people understand in seconds. Want an idea for yours? — its status reads Draft ready, then Message sent.",
  },
  {
    side: "right",
    title: "Pancake learns from what wins",
    body: "Pancake compares reply rates and remembers which opening, message length, and ask worked. The next campaign starts there.",
    variant: "f4",
    alt: "Animation: a chart grows week by week to a reply rate 56% up versus last period, a What worked card lists Lead with launch timing, Shorter intros and Offer one idea, and a Brain updated card confirms the winning patterns are saved for the next campaign.",
  },
];

function FeatureCard({ f }: { f: Feature }) {
  return (
    <>
      <article className="lp-feat-card" data-side={f.side} data-variant={f.variant}>
        <FeatureText title={f.title} body={f.body} />
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
