/**
 * ARCHIVED — the Pancake Influencer Program. Not public.
 *
 * This lives in a Next.js private folder (`app/_influencers`), so it is
 * excluded from routing and returns 404. Code is kept intact for future
 * revival. To bring the program back: rename `app/_influencers` →
 * `app/influencers`, restore the "Influencers" footer link in
 * components/shared/Footer.tsx, and (optionally) add /influencers to
 * app/sitemap.ts.
 *
 * Show off your Pancake, get cash or Pancake tokens (50% richer).
 * Structure intentionally diverges from comparable influencer pages: no
 * application form, no platform-by-platform tables — one toggle
 * (X / LinkedIn), one ladder, no gate.
 */
import type { Metadata } from "next";
import Link from "next/link";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { InfluencersRewards } from "@/components/sections/influencers/InfluencersRewards";
import { InfluencersRules } from "@/components/sections/influencers/InfluencersRules";
import { InfluencersSubmit } from "@/components/sections/influencers/InfluencersSubmit";
import { InfluencersTiers } from "@/components/sections/influencers/InfluencersTiers";
import { Footer } from "@/components/shared/Footer";
import { Badge } from "@/components/ui/Badge";
import { H2, H3 } from "@/components/ui/Headings";
import { serializeJsonLd } from "@/lib/json-ld";
import "@/app/_styles/components.css";

export const metadata: Metadata = {
  title: "Influencer Program — Post a Pancake, get cash or tokens · Pancake",
  description:
    "Show what your Pancake is doing on X or LinkedIn. Get paid in cash or Pancake tokens (50% richer). No application form.",
  alternates: { canonical: "https://getpancake.ai/influencers" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/influencers",
    title: "Pancake Influencer Program — Post a Pancake, get cash or tokens",
    description:
      "Post about Pancake on X or LinkedIn and get paid in cash or tokens (50% richer). No application form.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake Influencer Program" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake Influencer Program — Post a Pancake, get cash or tokens",
    description:
      "Post about Pancake, get paid in cash or tokens (50% richer). No application form.",
    images: ["/og-image.png"],
  },
};

const steps = [
  {
    n: "01",
    title: "Catch Pancake in the act",
    body: "Real screenshot, real workspace, real output. Briefing, research, copy, code — whatever made you go 'huh, that's good.'",
  },
  {
    n: "02",
    title: "Post it. Tag us.",
    body: "X or LinkedIn. Tag @getpancake_ai. No paid boosts. No 5-tools-I-use roundups.",
  },
  {
    n: "03",
    title: "Wait a week",
    body: "Seven days for the numbers to settle. Then send us the post link and an analytics screenshot.",
  },
  {
    n: "04",
    title: "Get paid",
    body: "Pick your reward: cash sent or tokens applied instantly.",
  },
];

const influencerProgramJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pancake Influencer Program",
  url: "https://getpancake.ai/influencers",
  description:
    "Earn cash or Pancake tokens (50% richer) by posting about Pancake on X or LinkedIn.",
  isPartOf: {
    "@type": "WebSite",
    name: "Pancake",
    url: "https://getpancake.ai",
  },
};

export default function InfluencersPage() {
  return (
    <main id="main-content" className="influencers-page min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(influencerProgramJsonLd) }}
      />

      <HomeNav />

      {/* Hero */}
      <section className="home-landing-section" aria-labelledby="influencers-hero-heading">
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <Badge variant="brand-alt-1">Influencer Program</Badge>
            <h1
              id="influencers-hero-heading"
              className="heading home-landing-section__title text-center"
            >
              Post a Pancake.<br />Get paid.
            </h1>
            <p className="home-landing-section__lede text-center">
              Show the internet what your Pancake is doing. We pay you back
              in cash — or tokens, which land 50% richer.
            </p>
          </header>
          <div className="influencers-hero__cta">
            <a
              href="#prizes"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
            >
              Show me the payouts
            </a>
            <p className="influencers-hero__cta-note">
              There&apos;s no application form. That&apos;s the whole bit.
            </p>
          </div>
        </div>
      </section>

      {/* Tier table with X / LinkedIn toggle */}
      <section
        id="prizes"
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="influencers-tiers-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="influencers-tiers-heading" className="heading home-landing-section__title text-center">
              How big you go = what you get
            </H2>
            <p className="home-landing-section__lede text-center">
              Each post, pick one: take the cash, or take the tokens.
            </p>
          </header>

          <InfluencersTiers />
        </div>
      </section>

      {/* Tokens or cash */}
      <section
        className="home-landing-section"
        aria-labelledby="influencers-rewards-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="influencers-rewards-heading" className="heading home-landing-section__title text-center">
              Two ways to get paid
            </H2>
            <p className="home-landing-section__lede text-center">
              Tokens or cash — your call, every post.
            </p>
          </header>

          <InfluencersRewards />
        </div>
      </section>

      {/* How it works */}
      <section
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="influencers-howto-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="influencers-howto-heading" className="heading home-landing-section__title text-center">
              Four steps. No paperwork.
            </H2>
            <p className="home-landing-section__lede text-center">
              From screenshot to payout in about eight days.
            </p>
          </header>

          <ol className="influencers-steps">
            {steps.map((s) => (
              <li key={s.n} className="influencers-step">
                <span className="influencers-step__num">{s.n}</span>
                <div>
                  <H3 className="heading influencers-step__title">{s.title}</H3>
                  <p className="influencers-step__body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ready to get paid — platform picker → Tally submission form */}
      <section
        id="submit"
        className="home-landing-section"
        aria-labelledby="influencers-submit-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <Badge variant="brand-alt-1">Ready to get paid</Badge>
            <H2 id="influencers-submit-heading" className="heading home-landing-section__title text-center">
              You did the work. Now get paid.
            </H2>
            <p className="home-landing-section__lede text-center">
              Send us the post link and an analytics screenshot showing your
              numbers. Pick tokens or cash — tokens land 50% richer.
            </p>
          </header>

          <InfluencersSubmit />
        </div>
      </section>

      {/* House rules */}
      <section
        id="rules"
        className="home-landing-section home-landing-section--alt"
        aria-labelledby="influencers-rules-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner`}>
          <header className="home-landing-section__header">
            <H2 id="influencers-rules-heading" className="heading home-landing-section__title text-center">
              House rules
            </H2>
            <p className="home-landing-section__lede text-center">
              Mostly shared. X lets you post more, LinkedIn wants you to chill.
            </p>
          </header>

          <InfluencersRules />
        </div>
      </section>

      {/* Closing */}
      <section
        className="home-landing-section"
        aria-labelledby="influencers-closing-heading"
      >
        <div className={`${HOME_PAGE_CONTAINER_CLASS} home-landing-section__inner home-landing-section__inner--closing`}>
          <h2
            id="influencers-closing-heading"
            className="heading home-landing-section__closing-title text-center"
          >
            Your turn.
          </h2>
          <p className="home-landing-section__lede home-landing-section__lede--closing text-center">
            Open Pancake. Open X (or LinkedIn). Post. Tag us. That&apos;s it.
          </p>
          <div className="home-landing-closing-cta">
            <Link
              href="https://x.com/getpancake_ai"
              className="button inline-flex w-fit shrink-0 items-center justify-center no-underline"
              data-size="lg"
              prefetch={false}
            >
              Tag @getpancake_ai
            </Link>
            <p className="home-landing-closing-cta__note">
              Questions? DM us — or read the{" "}
              <a href="#rules" className="underline">house rules</a>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
