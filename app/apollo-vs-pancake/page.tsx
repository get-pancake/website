import type { Metadata } from "next";

import { alternativesLink } from "@/components/sections/comparison/alternatives-link";
import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// Apollo facts read on 2026-11-10 from apollo.io and apollo.io/pricing (the plan cards with
// both billing toggles: $49 / $79 / $119 per seat billed annually, $65 / $99 billed monthly,
// Organization annual only with a 3-seat minimum).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
const title = "Apollo vs Pancake: Contact Database vs Plays From Claude";
const description = "Compare Apollo and Pancake: a 240M+ contact database with sequences and a dialer, priced per seat, versus Plays you ask for in Claude from $99 a month.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/apollo-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/apollo-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "apollo-vs-pancake",
  competitor: "Apollo",
  competitorInitial: "A",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "A contact database priced per seat versus Plays you ask Claude for.",
  heroSummary: "Apollo gives sales teams 240M+ contacts, email sequences and a dialer, priced per seat. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "A GTM system for sales teams: 240M+ contacts and 30M+ accounts, email sequences, a dialer, deliverability tools and 200+ integrations. Reps work in Apollo, or from Claude, ChatGPT and their CRM.",
  competitorChoose: "Choose it when your reps prospect by email and phone.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. Every lead is checked against your ICP and gets a personal message in your voice, sent from your own account.",
  pancakeChoose: "Choose it when you do your own sales and want one plan for the whole team.",
  verdictTitle: "Apollo equips your reps. Pancake builds the Play.",
  verdictLede: "Apollo is the stronger toolkit once you have reps, mailboxes and a CRM. Pancake fits founders and small teams who want to say who to reach and get a Play that runs.",
  competitorBestFit: "Apollo is the better fit when several reps need contact data, email sequences, a dialer and CRM integrations, and each rep works from their own seat.",
  differencesLede: "Both find people to talk to, and both work from Claude. They differ in who does the work and in how you pay.",
  differences: [
    {
      n: "01",
      title: "A database to filter versus a Play that searches",
      body: "Apollo gives reps filters over 240M+ contacts and 30M+ accounts. In Pancake you say who to reach. It builds a Play that keeps searching on your schedule and checks every lead against your ICP.",
      angle: "Apollo gives you the filters. Pancake keeps the search running.",
    },
    {
      n: "02",
      title: "Per seat versus per workspace",
      body: "As of November 2026, Apollo's Basic plan is $49 per seat a month billed annually, or $65 billed monthly. Professional is $79, or $99 monthly. Pancake starts at $99 a month per workspace, with your whole team included.",
      angle: "Add a teammate and the Pancake price stays the same.",
    },
    {
      n: "03",
      title: "Credits that expire versus credits that roll over",
      body: "Apollo's credits come with each seat, and unused ones expire at the end of the billing cycle. Pancake's credits are shared by the workspace. Unused credits roll over, up to one month of credits.",
      angle: "A slow month isn't lost.",
    },
    {
      n: "04",
      title: "Apollo wins on email and calling",
      body: "Apollo runs email sequences with domain warming, inbox rotation and reputation monitoring, and it has a dialer. Pancake sends no email and makes no calls. It writes each lead a personal message and sends it from your own account.",
      angle: "Pick Apollo when email and phone are your channels.",
    },
    {
      n: "05",
      title: "Apollo wins on database size and CRM",
      body: "Apollo's own database covers 240M+ contacts, with waterfall enrichment and CRM integrations such as Salesforce and HubSpot. Pancake searches 30+ data providers for people who fit your ICP. It exports the leads you pick to your CRM, one way.",
      angle: "Pick Apollo when your reps browse the market themselves.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "A contact database and sales engagement for reps", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you start", competitor: { text: "Reps filter the database and build sequences" }, pancake: { text: "Say who to reach; Pancake builds the Play", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "Free plan, then $49 to $119 per seat a month, billed annually" }, pancake: { text: "From $99 a month per workspace", mark: "yes" } },
    { feature: "Seats", competitor: { text: "Paid per seat" }, pancake: { text: "Whole team included", mark: "yes" } },
    { feature: "Credits", competitor: { text: "Granted per seat; unused credits expire each cycle" }, pancake: { text: "Shared by the team; unused credits roll over", mark: "yes" } },
    { feature: "Contact data", competitor: { text: "240M+ contacts, 30M+ accounts", mark: "yes" }, pancake: { text: "30+ data providers; every lead checked against your ICP", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Email sequences and a dialer", mark: "yes" }, pancake: { text: "A personal message for each lead, from your own account", mark: "yes" } },
    { feature: "Email and calling", competitor: { text: "Deliverability suite, email warmup and a dialer", mark: "yes" }, pancake: { text: "No email, no calls", mark: "no" } },
    { feature: "CRM", competitor: { text: "CRM integrations, including Salesforce and HubSpot", mark: "yes" }, pancake: { text: "No sync: a one-way export to HubSpot, Attio, Pipedrive and others", mark: "no" } },
    { feature: "AI agents", competitor: { text: "Apollo MCP; works from Claude and ChatGPT", mark: "yes" }, pancake: { text: "Claude, Claude Code, ChatGPT and Codex, with a browser sign-in", mark: "yes" } },
    { feature: "Free trial", competitor: { text: "Free plan; 14-day trial on Basic and Professional", mark: "yes" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Sales teams with reps, mailboxes and a CRM" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Stop filtering. Say who to reach.",
  closingLede: "Tell Pancake who to reach. It builds the Play, keeps searching and writes to the people who fit.",
  faqs: [
    { q: "What is the main difference between Apollo and Pancake?", a: "Apollo is a contact database with email sequences and a dialer that sales reps operate, priced per seat. Pancake builds Plays: say who to reach, and it finds the people, checks each one against your ICP and writes to them from your own account." },
    { q: "Is Pancake an alternative to Apollo?", a: "Yes, if you want buyers found and conversations started without running a database and sequences yourself. Not if you need cold email or a dialer: Apollo has them and Pancake doesn't." },
    { q: "How does pricing compare?", a: "As of November 2026, Apollo has a Free plan, then Basic at $49, Professional at $79 and Organization at $119 per seat a month, billed annually. Basic and Professional cost $65 and $99 billed monthly. Pancake starts at $99 a month per workspace, with 60,000 credits your whole team shares." },
    { q: "Do both work from Claude?", a: "Yes. Apollo says it works where you work, in Claude and ChatGPT, and it has an MCP. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key. Ask for a Play in the chat, and Pancake builds it." },
    { q: "What does Apollo do that Pancake doesn't?", a: "Email sequences with deliverability tools, a dialer, call recording, a meeting scheduler and automated CRM enrichment. Pancake doesn't do these, apart from a one-way export of the leads you pick to your CRM." },
    { q: "Who should choose Pancake over Apollo?", a: "Founders who do their own sales, and small B2B teams without reps to run sequences. Say who to reach, and Pancake builds the Play and writes to each lead under your name." },
  ],
  related: [
    ...alternativesLink("apollo-alternatives", "Apollo alternatives"),
    { href: "/clay-vs-pancake", label: "Clay vs Pancake" },
    { href: "/zoominfo-vs-pancake", label: "ZoomInfo vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.apollo.io/", label: "Apollo product page (November 2026)" },
    { href: "https://www.apollo.io/pricing", label: "Apollo pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function ApolloVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
