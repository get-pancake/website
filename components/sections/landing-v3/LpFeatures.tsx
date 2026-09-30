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
 * LpFeatAnim plays each once when its card comes into view and holds the
 * designer's picture as the last frame.
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
  {
    side: "left",
    title: "Tell Pancake \nwhat to watch",
    body: "Choose the keywords, competitors, influencers, hiring activity, and tech stacks that matter. Pancake finds matching prospects and shows the signal behind every match.",
    variant: "f1",
    alt: "Animation: a Signals panel where keyword mentions, competitor engagement, companies hiring and technologies used switch on one by one (4 active), then a Roles panel where Sales, Marketing and Customer success get checked (3 selected), and a clay alternatives note lands by the first signal.",
  },
  {
    side: "right",
    title: "Every first message starts warm",
    body: "Pancake opens with something they posted, never a pitch. Every message sounds like you.",
    variant: "f2",
    alt: "Animation: a post by Sarah Velasquez announcing a Product Hunt launch in 21 days, then a draft reply is written inside a rainbow ring — Hey Sarah, saw you're launching on Product Hunt in 21 days. We make SaaS launch videos people understand in seconds. Want an idea for yours? — its status reads Draft ready, then Message sent.",
  },
  {
    side: "left",
    title: "Show up where \nbuyers search",
    body: "Pancake finds the questions where Google and AI miss you. It drafts the article, waits for your review, and publishes it to your CMS.",
    variant: "f3",
    alt: "Animation: in an AI chat, the question best studio for a SaaS launch video in Stockholm is typed in the message bar and sent; the answer recommends Studio Pelican, while the ChatGPT, Claude and Gemini logos appear around the chat.",
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
      <article className="lp-feat-card" data-side={f.side}>
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
