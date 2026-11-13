import type { Metadata } from "next";

import { alternativesLink } from "@/components/sections/comparison/alternatives-link";
import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// Clay facts read on 2026-11-10 from clay.com and clay.com/pricing. Prices are the monthly
// ones ("Launch starting at $185/mo" in the pricing FAQ; the cards default to annual, $167).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
// Clay names the network its ad audiences sync to; this page says "ad platforms".
const title = "Clay vs Pancake: Tables You Build vs Plays You Ask For";
const description = "Compare Clay and Pancake: data tables and workflows a GTM engineer builds, versus Plays you ask for in Claude, from $99 a month per workspace.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/clay-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/clay-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "clay-vs-pancake",
  competitor: "Clay",
  competitorInitial: "C",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "Tables you build versus Plays you deploy from Claude.",
  heroSummary: "Clay gives GTM engineers a data marketplace, tables and workflows to build any play. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "Infrastructure for GTM teams. One contract covers 200+ data and AI vendors, with waterfall enrichment, the Claygent research agent and a visual canvas for workflows. Its homepage says GTM engineers build on Clay.",
  competitorChoose: "Choose it when someone on your team builds data workflows.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. It finds the people, checks every lead against your ICP and writes each one a personal message in your voice.",
  pancakeChoose: "Choose it when you want the Play built for you.",
  verdictTitle: "Clay is the builder's toolkit. Pancake builds the Play.",
  verdictLede: "Clay is the stronger choice when you have a GTM engineer and want to design every step. Pancake fits when you want to say who to reach and get a Play that runs.",
  competitorBestFit: "Clay is the better fit when a GTM engineer or a RevOps team wants 200+ data and AI vendors, waterfall enrichment, CRM auto-sync, ad audiences and control over every step of the workflow.",
  differencesLede: "Both turn data into outreach. They differ in who builds the workflow and in how you pay.",
  differences: [
    {
      n: "01",
      title: "A toolkit versus a finished Play",
      body: "Clay gives you tables, a visual canvas and agents to build GTM plays with clicks, code or chat. In Pancake you say who to reach in one sentence. It plans who to find and how, then builds the Play.",
      angle: "Clay hands you the parts. Pancake hands you the Play.",
    },
    {
      n: "02",
      title: "Two meters versus one kind of credit",
      body: "Clay bills two meters. Data credits buy data from its marketplace, and actions measure the platform work. Pancake has one kind of credit, for the research a search does and each work email or phone number found. Building a Play is free.",
      angle: "You see the cost of a search before it runs.",
    },
    {
      n: "03",
      title: "From $185 a month versus from $99",
      body: "As of November 2026, Clay has a Free plan, then Launch from $185 a month and Growth from $495. Annual billing is 10% lower. Pancake starts at $99 a month per workspace, with 60,000 credits.",
      angle: "Neither charges per seat.",
    },
    {
      n: "04",
      title: "Clay wins on data breadth and control",
      body: "Clay's marketplace lists 200+ data and AI vendors under one contract. You combine providers in waterfalls, or bring your own API keys. Pancake includes 50+ data providers, with no contract to sign and no API key.",
      angle: "Pick Clay when the data model is yours to design.",
    },
    {
      n: "05",
      title: "Clay wins on CRM sync, email and ads",
      body: "Clay's Growth plan auto-syncs and enriches your CRM and pushes audiences to ad platforms. Clay also sends email through its own sequencer or an integration. Pancake sends no email and doesn't sync with your CRM. It exports the leads you pick, one way.",
      angle: "Pick Clay when the CRM is your system of record.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Data, tables and workflows to build GTM plays", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How a play starts", competitor: { text: "You build it, with clicks, code or chat" }, pancake: { text: "One sentence in Claude, ChatGPT, Codex or the app", mark: "yes" } },
    { feature: "Data", competitor: { text: "200+ data and AI vendors, waterfall enrichment", mark: "yes" }, pancake: { text: "50+ data providers included, no API key", mark: "yes" } },
    { feature: "Qualification", competitor: { text: "Lead scoring and Claygent research in your workflows", mark: "yes" }, pancake: { text: "Every lead checked against your ICP", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Email, through Clay's sequencer or an integration", mark: "yes" }, pancake: { text: "A personal message for each lead, from your own account", mark: "yes" } },
    { feature: "CRM", competitor: { text: "Auto-sync and enrichment on Growth", mark: "yes" }, pancake: { text: "No sync: a one-way export to HubSpot, Attio, Pipedrive and others", mark: "no" } },
    { feature: "Ad audiences", competitor: { text: "Pushed to ad platforms on Growth", mark: "yes" }, pancake: { text: "Not covered", mark: "no" } },
    { feature: "AI agents", competitor: { text: "A plugin for coding agents, a CLI and an API", mark: "yes" }, pancake: { text: "Claude, Claude Code, ChatGPT and Codex, with a browser sign-in", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "Free plan, then from $185 a month; data credits plus actions" }, pancake: { text: "From $99 a month per workspace, one kind of credit", mark: "yes" } },
    { feature: "Seats", competitor: { text: "Unlimited seats", mark: "yes" }, pancake: { text: "Whole team included", mark: "yes" } },
    { feature: "Free trial", competitor: { text: "Free plan; 14-day trial of paid plans", mark: "yes" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams with a GTM engineer or a RevOps owner" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Skip the build. Ask for the Play.",
  closingLede: "Tell Pancake who to reach. It builds the Play, checks every lead against your ICP and writes to the people who fit.",
  faqs: [
    { q: "What is the main difference between Clay and Pancake?", a: "Clay is a toolkit: a data marketplace, tables and workflows that a GTM engineer builds on. Pancake builds the Play for you. Say who to reach in Claude, ChatGPT, Codex or the app, and it finds the people and writes to them from your own account." },
    { q: "Is Pancake an alternative to Clay?", a: "For one job, yes: finding buyers and starting conversations without building a workflow. It doesn't replace Clay for CRM enrichment, ad audiences or custom data workflows." },
    { q: "How does pricing compare?", a: "As of November 2026, Clay has a Free plan, Launch from $185 a month and Growth from $495, billed in data credits and actions. Pancake starts at $99 a month per workspace with 60,000 credits. Its 7-day free trial comes with 30,000 credits, and a card is required to start it." },
    { q: "What does Clay do that Pancake doesn't?", a:"A marketplace of 200+ data and AI vendors, multi-provider waterfalls, CRM auto-sync, ad audiences, email sequencing and, on Enterprise, data warehouse connections. Pancake covers none of these, apart from finding a lead's work email or phone number and a one-way export of the leads you pick to your CRM." },
    { q: "Do both work with AI agents?", a: "Yes. Clay offers a plugin for coding agents, a CLI and an API to build in Clay. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key. Ask for a Play in the chat, and Pancake builds it." },
    { q: "Who should choose Pancake over Clay?", a: "Founders who do their own sales, and small B2B teams without a GTM engineer. Say who to reach, and Pancake builds the Play and writes to each lead under your name." },
  ],
  related: [
    ...alternativesLink("clay-alternatives", "Clay alternatives"),
    { href: "/apollo-vs-pancake", label: "Apollo vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.clay.com/", label: "Clay product page (November 2026)" },
    { href: "https://www.clay.com/pricing", label: "Clay pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function ClayVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
