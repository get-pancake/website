import type { Metadata } from "next";

import { alternativesLink } from "@/components/sections/comparison/alternatives-link";
import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// ZoomInfo facts read on 2026-11-10 from zoominfo.com and zoominfo.com/pricing. The pricing
// page shows no price: custom packages, a "Get pricing" form, and an FAQ that names the three
// things a quote depends on (features and functionality, number of licenses, credit usage).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
const title = "ZoomInfo vs Pancake: Enterprise Data vs Plays From $99";
const description = "Compare ZoomInfo and Pancake: an enterprise GTM data platform sold in custom packages, versus Plays you ask for in Claude from $99 a month per workspace.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/zoominfo-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/zoominfo-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "zoominfo-vs-pancake",
  competitor: "ZoomInfo",
  competitorInitial: "Z",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "GTM data sold by custom quote versus Plays from $99 a month.",
  heroSummary: "ZoomInfo sells verified B2B data, agents and a GTM platform in custom packages. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "A GTM data platform. Its site says over half the Fortune 500 use it. It covers prospecting, account-based marketing, data enrichment, deal execution and conversation intelligence, in its own platform or through an API, MCP and CLI.",
  competitorChoose: "Choose it when sales, marketing and RevOps share one data layer.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. 30+ data providers come included. Every lead is checked against your ICP and gets a personal message from your own account.",
  pancakeChoose: "Choose it when you want a public price and a first search today.",
  verdictTitle: "ZoomInfo is the data layer. Pancake builds the Play.",
  verdictLede: "ZoomInfo is the deeper system for revenue teams that buy data for many jobs. Pancake fits founders and small teams who want buyers found and messaged, at a price on the page.",
  competitorBestFit: "ZoomInfo is the better fit when sales, marketing and RevOps need one verified record for prospecting, account-based marketing, enrichment and conversation intelligence, with governance scoped to each job.",
  differencesLede: "Both start from data on companies and people. They differ in scope, in how you buy and in who starts the conversation.",
  differences: [
    {
      n: "01",
      title: "A custom package versus a public price",
      body: "As of November 2026, ZoomInfo publishes no prices. Its pricing page offers custom packages, quoted on features, number of licenses and credit usage. Pancake starts at $99 a month per workspace, with a 7-day free trial.",
      angle: "Know the price before the first call.",
    },
    {
      n: "02",
      title: "A data layer versus a Play that reaches people",
      body: "ZoomInfo's core is the record: verified data on companies and people, with forty ready-made plays and agents that run on it. In Pancake you say who to reach. It builds the Play, finds the people and writes to each one from your own account.",
      angle: "One sells the data foundation. The other starts the conversation.",
    },
    {
      n: "03",
      title: "Scoped for the enterprise versus self-serve",
      body: "ZoomInfo scopes the data, the agents and the governance to each job you describe. Pancake is self-serve: sign up, say who to reach, and your first search runs right away.",
      angle: "One starts with a form. The other starts with a sentence.",
    },
    {
      n: "04",
      title: "ZoomInfo wins on breadth of jobs",
      body: "ZoomInfo covers account-based marketing, inbound lead routing, deal execution, customer expansion, conversation intelligence and recruiting, all on one record. Pancake does one job: it finds buyers and starts the conversation.",
      angle: "Pick ZoomInfo when many teams need the same data.",
    },
    {
      n: "05",
      title: "ZoomInfo wins on data delivery",
      body: "ZoomInfo delivers data through its platform, through an API, MCP and CLI priced on usage, or straight to Snowflake, Databricks, BigQuery and S3. Pancake's leads leave as a CSV download or a one-way export to your CRM.",
      angle: "Pick ZoomInfo when the data feeds your own systems.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Verified GTM data, with plays and agents on top", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you buy", competitor: { text: "Custom package after a form" }, pancake: { text: "From $99 a month per workspace, self-serve", mark: "yes" } },
    { feature: "What the price depends on", competitor: { text: "Features, number of licenses and credit usage" }, pancake: { text: "Monthly credits, shared by the whole team", mark: "yes" } },
    { feature: "Getting started", competitor: { text: "Free trial or a sales call, by form" }, pancake: { text: "Sign up and say who to reach", mark: "yes" } },
    { feature: "Data", competitor: { text: "Its own verified B2B database, with intent data", mark: "yes" }, pancake: { text: "30+ data providers included, no API key", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Sequences for prospecting, in its platform", mark: "yes" }, pancake: { text: "A personal message for each lead, from your own account", mark: "yes" } },
    { feature: "Other jobs", competitor: { text: "ABM, lead routing, conversation intelligence, recruiting", mark: "yes" }, pancake: { text: "Not covered", mark: "no" } },
    { feature: "Data delivery", competitor: { text: "API, MCP, CLI and data warehouses", mark: "yes" }, pancake: { text: "CSV download; a one-way export to HubSpot, Attio, Pipedrive and others" } },
    { feature: "AI agents", competitor: { text: "API, MCP and CLI, priced on usage", mark: "yes" }, pancake: { text: "Claude, Claude Code, ChatGPT and Codex, with a browser sign-in", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Revenue teams across sales, marketing and RevOps" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "See the price. Start today.",
  closingLede: "Tell Pancake who to reach. It builds the Play, finds the people who fit and writes to them.",
  faqs: [
    { q: "What is the main difference between ZoomInfo and Pancake?", a: "ZoomInfo is a GTM data platform sold in custom packages to sales, marketing and RevOps teams. Pancake builds Plays: say who to reach, and it finds the people, checks each one against your ICP and writes to them from your own account, from $99 a month per workspace." },
    { q: "How much does ZoomInfo cost?", a: "As of November 2026, ZoomInfo publishes no prices. Its pricing page says packages are custom, based on features and functionality, number of licenses and credit usage. You fill in a form to get pricing." },
    { q: "Is Pancake an alternative to ZoomInfo?", a: "For a founder or a small team that wants buyers found and conversations started, yes. It doesn't replace ZoomInfo's database for a large sales, marketing and RevOps organization." },
    { q: "What does ZoomInfo do that Pancake doesn't?", a: "Account-based marketing, inbound lead routing, deal execution, conversation intelligence, recruiting data and delivery to data warehouses. Pancake covers none of these. It finds people who fit your ICP and messages them from your own account." },
    { q: "Do both work with AI agents?", a: "Yes. ZoomInfo offers an API, MCP and CLI, priced on usage. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key. Ask for a Play in the chat, and Pancake builds it." },
    { q: "Who should choose Pancake over ZoomInfo?", a: "Founders who do their own sales, and small B2B teams that want a public price. The 7-day free trial comes with 30,000 credits, and a card is required to start it." },
  ],
  related: [
    ...alternativesLink("zoominfo-alternatives", "ZoomInfo alternatives"),
    { href: "/apollo-vs-pancake", label: "Apollo vs Pancake" },
    { href: "/clay-vs-pancake", label: "Clay vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.zoominfo.com/", label: "ZoomInfo product page (November 2026)" },
    { href: "https://www.zoominfo.com/pricing", label: "ZoomInfo pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function ZoomInfoVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
