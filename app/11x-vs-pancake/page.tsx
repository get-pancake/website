import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// 11x facts read on 2026-11-10 from 11x.ai. The site has no pricing page (11x.ai/pricing
// answers 404) and every call to action is a demo, so this page says "publishes no prices"
// and gives no figure.
// Re-check the page before moving `factsReviewed`, and again within 90 days.
const title = "11x vs Pancake: Revenue Agents by Demo vs Plays From Claude";
const description = "Compare 11x and Pancake: AI agents for voice, chat, email and social, sold by demo to revenue teams, versus Plays you ask for in Claude from $99 a month.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/11x-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/11x-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "11x-vs-pancake",
  competitor: "11x",
  competitorInitial: "11",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "Revenue agents sold by demo versus Plays you start from Claude.",
  heroSummary: "11x sells AI agents for inbound, outbound and expansion across voice, chat, email and social, by demo. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "A platform of AI agents for revenue teams. Voice and chat agents qualify inbound leads and book meetings. Email and social agents run outbound. Voice agents call existing customers about upgrades. It integrates with Salesforce, HubSpot and Pipedrive.",
  competitorChoose: "Choose it when a revenue team needs inbound, outbound and calls covered.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. Every lead is checked against your ICP and gets a personal message in your voice, sent from your own account.",
  pancakeChoose: "Choose it when you want a public price and a first search today.",
  verdictTitle: "11x covers every channel. Pancake builds the Play.",
  verdictLede: "11x is the broader system for revenue teams with inbound volume, customers to expand and a CRM. Pancake fits founders and small teams who want to say who to reach and start today, at a price on the page.",
  competitorBestFit: "11x is the better fit when a revenue team wants agents on voice, chat, email, social, SMS and WhatsApp, for inbound qualification, outbound and account expansion, connected to its CRM.",
  differencesLede: "Both run outbound for you. They differ in scope, in channels and in how you buy.",
  differences: [
    {
      n: "01",
      title: "A demo versus a public price",
      body: "As of November 2026, 11x publishes no prices. Its site offers a demo. Pancake starts at $99 a month per workspace, with a 7-day free trial and 30,000 credits.",
      angle: "Know the price before the first call.",
    },
    {
      n: "02",
      title: "Agents on every channel versus one Play per audience",
      body: "11x runs agents across voice, chat, email, social, SMS and WhatsApp. Pancake runs one Play per audience you sell to. Each Play finds the people, checks them against your ICP and writes to each one from your own account.",
      angle: "Say the audience in one sentence. Pancake builds the Play.",
    },
    {
      n: "03",
      title: "11x wins on inbound and voice",
      body: "11x's chat and phone agents respond to inbound leads in under 60 seconds, qualify them and book a meeting with the right rep. Pancake makes no calls and doesn't handle inbound leads.",
      angle: "Pick 11x when inbound volume needs an answer.",
    },
    {
      n: "04",
      title: "11x wins on channels and expansion",
      body: "11x coordinates email, social and dials in one sequence. Its voice agents also call existing customers to find upgrades. Pancake sends no email and makes no calls. It messages new buyers from your own account.",
      angle: "Pick 11x when every channel matters.",
    },
    {
      n: "05",
      title: "A call with the team versus self-serve",
      body: "11x says it is built for scale and ready for enterprise, and it starts with a call with its team. Pancake is self-serve: sign up, say who to reach, and your first search runs right away.",
      angle: "One starts with a call. The other starts with a sentence.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "AI agents for inbound, outbound and expansion", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you buy", competitor: { text: "A demo with the 11x team" }, pancake: { text: "From $99 a month per workspace, self-serve", mark: "yes" } },
    { feature: "Channels", competitor: { text: "Voice, chat, email, social, SMS and WhatsApp", mark: "yes" }, pancake: { text: "Direct messages under your name, from the accounts you send from", mark: "yes" } },
    { feature: "Inbound qualification", competitor: { text: "Voice and chat agents, with routing to reps", mark: "yes" }, pancake: { text: "Not covered", mark: "no" } },
    { feature: "AI calling", competitor: { text: "Voice agents, plus a human dialer", mark: "yes" }, pancake: { text: "No calls", mark: "no" } },
    { feature: "Data", competitor: { text: "A company and lead database, with funding, hiring and tech stack signals", mark: "yes" }, pancake: { text: "30+ data providers; every lead checked against your ICP", mark: "yes" } },
    { feature: "CRM", competitor: { text: "Salesforce, HubSpot and Pipedrive integrations", mark: "yes" }, pancake: { text: "A one-way lead export to HubSpot, Attio, Pipedrive and others" } },
    { feature: "Getting started", competitor: { text: "Book a demo" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Revenue teams with inbound volume, reps and a CRM" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Start with one sentence.",
  closingLede: "Tell Pancake who to reach. It builds the Play, finds the people who fit and writes to them.",
  faqs: [
    { q: "What is the main difference between 11x and Pancake?", a: "11x sells AI agents for inbound, outbound and account expansion across voice, chat, email and social, by demo. Pancake builds Plays: say who to reach, and it finds the people and writes to them from your own account, from $99 a month per workspace." },
    { q: "How much does 11x cost?", a: "As of November 2026, 11x publishes no prices. Its site asks you to book a demo." },
    { q: "Is Pancake an alternative to 11x?", a: "For outbound to new buyers, yes: Pancake finds the people and starts the conversation. It doesn't replace 11x's voice and chat agents for inbound leads, or its calls to existing customers." },
    { q: "What does 11x do that Pancake doesn't?", a: "Inbound qualification by voice and chat, AI calls, outreach by email, SMS and WhatsApp, and expansion calls to existing customers. Pancake doesn't do these. It finds people who fit your ICP and messages them from your own account." },
    { q: "Is there a free trial?", a: "11x's site offers a demo. Pancake has a 7-day free trial with 30,000 credits, and a card is required to start it." },
    { q: "Can I run Pancake from Claude?", a: "Yes. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key. You create Plays, review leads and edit messages from the chat." },
  ],
  related: [
    { href: "/alta-vs-pancake", label: "Alta vs Pancake" },
    { href: "/unify-vs-pancake", label: "Unify vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.11x.ai/", label: "11x product page (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function ElevenXVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
