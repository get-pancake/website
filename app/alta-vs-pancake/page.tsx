import type { Metadata, Viewport } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

// Alta facts read on 2026-10-07 from altahq.com and altahq.com/plans (audit plan 3.10).
// Re-check both pages before moving FACTS_REVIEWED, and again within 90 days.
// Alta lists the professional network among its channels; this page never names it.
const title = "Alta vs Pancake: Named AI Agents vs Founder-Run Plays";
const description = "Compare Alta and Pancake: named AI agents for outbound, inbound and calls, sold by custom quote, versus Plays you run for $99 a month per workspace.";

// Status-bar zone matches the lp cream, as every comparison page. Same value as the
// comparisonViewport export the landing-audit-fixes template adds; switch to it once that lands.
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/alta-vs-pancake` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/alta-vs-pancake`,
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Alta vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "alta-vs-pancake",
  competitor: "Alta",
  competitorInitial: "A",
  heroLede: "Named AI agents for revenue teams versus Plays a founder runs.",
  heroSummary: "Alta sells three AI agents for outbound, inbound and growth, priced by custom quote. Pancake runs Plays that find your buyers and writes to the ones you approve, for $99 a month per workspace.",
  competitorBody: "An AI platform for go-to-market teams with three named agents. Katie runs outbound, Alex qualifies inbound leads by AI call and chat, and Luna finds signals and lookalikes across 50+ data sources.",
  competitorChoose: "Choose it when a revenue team needs outbound, inbound and calls covered.",
  pancakeBody: "Tell Pancake who to reach, and it builds a Play. Each Play searches every night. You approve every lead, and Pancake writes to each one under your name.",
  pancakeChoose: "Choose it when you do your own sales and want to start today.",
  verdictTitle: "Alta covers the funnel. Pancake runs the Play.",
  verdictLede: "Alta is the broader system for teams with reps, inbound volume and a CRM. Pancake fits founders who do their own sales and want a public price.",
  competitorBestFit: "Alta is the better fit when a revenue team wants outbound, inbound qualification, AI calls and CRM integrations in one system, with white-glove onboarding.",
  differencesLede: "Both find buyers and reach out. They differ in scope, channels and how you buy.",
  differences: [
    {
      n: "01",
      title: "Three agents versus one Play per audience",
      body: "Alta splits the work between Katie, Alex and Luna. Pancake runs one Play per audience you sell to. Each Play finds one audience, and every lead arrives with why it fits.",
      angle: "Describe the audience in one sentence. Pancake builds the Play.",
    },
    {
      n: "02",
      title: "A custom quote versus a public price",
      body: "As of October 2026, Alta publishes no prices. You fill in a form and get a custom quote, with onboarding included. Pancake is $99 a month per workspace, with a 3-day free trial.",
      angle: "Know the price before the first call.",
    },
    {
      n: "03",
      title: "Alta wins on inbound and calling",
      body: "Alex qualifies inbound leads with AI calls and chat, then routes qualified leads to your team's calendar. Pancake makes no calls and doesn't handle inbound leads.",
      angle: "Pick Alta when inbound volume needs an answer.",
    },
    {
      n: "04",
      title: "Alta wins on channels and CRM",
      body: "Alta sequences email, calls, SMS and WhatsApp, with branching on what each prospect does. It integrates with your CRM and 50+ tools. Pancake sends no email and doesn't sync to a CRM.",
      angle: "Pick Alta when every channel matters.",
    },
    {
      n: "05",
      title: "Built for founders who do their own sales",
      body: "Every Pancake lead arrives with one line on why it fits, and you approve each one. Pancake follows up until they answer. A yes gets your calendar link, sent from your account.",
      angle: "Every other answer comes back to you.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "AI agents for outbound, inbound and growth", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you buy", competitor: { text: "Custom quote after a form" }, pancake: { text: "$99 a month per workspace, self-serve", mark: "yes" } },
    { feature: "Onboarding", competitor: { text: "White-glove onboarding included", mark: "yes" }, pancake: { text: "Sign up and describe who to reach", mark: "yes" } },
    { feature: "Data", competitor: { text: "50+ sources: CRM, intent, job posts, news, product usage", mark: "yes" }, pancake: { text: "Nightly search: hiring, funding, tech used, lookalikes and more", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Email, calls, SMS, WhatsApp and more", mark: "yes" }, pancake: { text: "Direct messages under your name, from the accounts you send from", mark: "yes" } },
    { feature: "Inbound qualification", competitor: { text: "AI calls and chat, routed to your calendar", mark: "yes" }, pancake: { text: "Not covered", mark: "no" } },
    { feature: "AI calling", competitor: { text: "An AI calling agent", mark: "yes" }, pancake: { text: "No calls", mark: "no" } },
    { feature: "CRM", competitor: { text: "Free CRM integrations", mark: "yes" }, pancake: { text: "No CRM sync", mark: "no" } },
    { feature: "Best for", competitor: { text: "Revenue teams with reps, inbound volume and a CRM" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Start your first Play today.",
  closingLede: "Tell Pancake who to reach. It builds the Play, finds the people who fit and writes to the ones you approve.",
  faqs: [
    { q: "What is the main difference between Alta and Pancake?", a: "Alta sells three AI agents for outbound, inbound and growth, by custom quote. Pancake runs Plays that find your buyers and write to the leads you approve, for $99 a month per workspace." },
    { q: "How much does Alta cost?", a: "As of October 2026, Alta publishes no prices. Its plans page asks for your team size and goals, then sends a custom quote. It says you pay for what you use." },
    { q: "What does Alta do that Pancake doesn't?", a: "Inbound qualification, AI calls, email, SMS and WhatsApp outreach, CRM integrations and white-glove onboarding. Pancake doesn't do these. It finds people who fit and messages them from your own accounts." },
    { q: "Is there a free trial?", a: "Alta's site offers a demo and a custom quote. Pancake has a 3-day free trial, and a card is required to start it." },
    { q: "Who should choose Pancake over Alta?", a: "Founders who do their own sales, and small B2B teams without inbound volume to qualify. Tell Pancake who to reach and approve the leads that fit. Pancake writes to them under your name." },
    { q: "Can I run Pancake from Claude?", a: "Yes. Pancake connects to Claude, Claude Code and Codex with a browser sign-in. You create Plays, review leads and edit messages from the agent, on the same Brain as the app." },
  ],
  related: [
    { href: "/blog/alta-alternatives", label: "Alta alternatives" },
    { href: "/unify-vs-pancake", label: "Unify vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.altahq.com/", label: "Alta product page (October 2026)" },
    { href: "https://www.altahq.com/plans", label: "Alta pricing (October 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function AltaVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
