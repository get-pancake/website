import type { Metadata, Viewport } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

// Octave facts read on 2026-10-07 from octavehq.com and octavehq.com/pricing (audit plan 3.10).
// Re-check both pages before moving FACTS_REVIEWED, and again within 90 days.
const title = "Octave vs Pancake: Context Layer vs Plays That Run";
const description = "Compare Octave and Pancake: a GTM context layer from $1,500 a month, billed annually, versus Plays that find your buyers for $99 a month per workspace.";

// Status-bar zone matches the lp cream, as every comparison page. Same value as the
// comparisonViewport export the landing-audit-fixes template adds; switch to it once that lands.
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/octave-vs-pancake` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/octave-vs-pancake`,
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Octave vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "octave-vs-pancake",
  competitor: "Octave",
  competitorInitial: "O",
  heroLede: "A context layer for your GTM stack versus Plays that reach people.",
  heroSummary: "Octave models your positioning and buyers, then feeds that context to your tools and agents. Pancake runs Plays that find your buyers and writes to the ones you approve, from your own accounts.",
  competitorBody: "A context layer for B2B go-to-market teams. Its context graph holds segments, personas, buyer problems and differentiation. Its Intelligence Engine learns from buyer conversations, market shifts and competitor signals.",
  competitorChoose: "Choose it when many teams and agents need one source of truth.",
  pancakeBody: "Pancake reads your website and builds a Brain of your buyers, competitors and voice. Each Play uses it to find people every night and write each one a personal message.",
  pancakeChoose: "Choose it when you want that context turned into conversations.",
  verdictTitle: "Octave informs your stack. Pancake runs the Play.",
  verdictLede: "Octave is the deeper context system for teams with sales, marketing and RevOps. Pancake fits founders who want buyers found and messaged without wiring tools together.",
  competitorBestFit: "Octave is the better fit when a go-to-market team wants one governed source of positioning, learned from buyer conversations and pushed into Salesforce, HubSpot, Clay and its managed agents.",
  differencesLede: "Both keep a model of your market. Octave hands it to your tools. Pancake acts on it.",
  differences: [
    {
      n: "01",
      title: "Context versus a Play that runs",
      body: "Octave supplies context to the tools and agents you choose, through MCP, an API and a CLI. Tell Pancake who to reach, and it builds a Play that searches every night.",
      angle: "One sharpens your tools. The other reaches your buyers.",
    },
    {
      n: "02",
      title: "Two kinds of brain",
      body: "Octave's context graph learns from buyer conversations and competitor signals across your stack. Pancake's Brain is built from your website: ideal customer, personas, competitors, messaging and voice. Every Play starts from it.",
      angle: "Octave learns from your calls. Pancake starts from your website.",
    },
    {
      n: "03",
      title: "$1,500 a month versus $99 per workspace",
      body: "As of October 2026, Octave Ultra starts at $1,500 a month, billed annually, plus usage credits. Pancake is $99 a month per workspace.",
      angle: "Both include your whole team.",
    },
    {
      n: "04",
      title: "Octave wins on integrations and governance",
      body: "Octave connects to Salesforce, HubSpot, Gong and Clay, and adds SSO, role-based access and a dedicated CSM. Warehouse sync is an add-on. Pancake doesn't sync to a CRM or read your call recordings.",
      angle: "Pick Octave when many tools need the same context.",
    },
    {
      n: "05",
      title: "A guided build versus self-serve",
      body: "Octave's GTM engineers build your instance and ship a live use case with you within two weeks. Pancake is self-serve: sign up, describe who to reach, and the Play starts searching.",
      angle: "One is built with you. The other you start today.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Context layer for your tools and agents", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "Market model", competitor: { text: "Context graph of segments, personas and buyer problems", mark: "yes" }, pancake: { text: "A Brain built from your website", mark: "yes" } },
    { feature: "Buyer conversations", competitor: { text: "Learns from calls, with a Gong integration", mark: "yes" }, pancake: { text: "No call recordings", mark: "no" } },
    { feature: "Qualification", competitor: { text: "Scores accounts on pains from calls and research", mark: "yes" }, pancake: { text: "Checks every lead against your ICP, with why it fits", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Through the execution tools you choose" }, pancake: { text: "A personal message for each lead, from the accounts you send from", mark: "yes" } },
    { feature: "AI agents", competitor: { text: "MCP, API, CLI and a Claude Code plugin", mark: "yes" }, pancake: { text: "MCP for Claude, Claude Code and Codex", mark: "yes" } },
    { feature: "Integrations", competitor: { text: "Salesforce, HubSpot, Gong, Clay and more", mark: "yes" }, pancake: { text: "No CRM sync", mark: "no" } },
    { feature: "Team", competitor: { text: "Unlimited users", mark: "yes" }, pancake: { text: "Whole team included", mark: "yes" } },
    { feature: "Admin and support", competitor: { text: "SSO, role-based access, dedicated CSM", mark: "yes" }, pancake: { text: "No SSO or dedicated CSM", mark: "no" } },
    { feature: "Pricing", competitor: { text: "From $1,500/month billed annually, plus credits" }, pancake: { text: "$99 a month per workspace", mark: "yes" } },
    { feature: "Getting started", competitor: { text: "A two-week trial, built with Octave's team" }, pancake: { text: "Self-serve; 3-day free trial, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams across sales, marketing and RevOps" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Turn your context into conversations.",
  closingLede: "Tell Pancake who to reach. It builds the Play from your Brain and writes to every lead you approve.",
  faqs: [
    { q: "What is the main difference between Octave and Pancake?", a: "Octave is a context layer: it models your positioning and buyers and feeds that to your tools and agents. Pancake runs Plays that find your buyers and write to the ones you approve." },
    { q: "How does pricing compare?", a: "As of October 2026, Octave charges a platform fee plus usage credits. Octave Ultra starts at $1,500 a month, billed annually. Pancake is $99 a month per workspace." },
    { q: "What does Octave do that Pancake doesn't?", a: "Octave learns from buyer conversations and connects to Salesforce, HubSpot, Gong and Clay. It also offers SSO, role-based access and a data warehouse connector. Pancake doesn't do these." },
    { q: "Do both work in Claude?", a: "Yes. Octave offers MCP, an API, a CLI and a Claude Code plugin. Pancake connects to Claude, Claude Code and Codex with a browser sign-in. You create Plays and review leads from the agent." },
    { q: "What is a Play?", a: "A Play is how Pancake finds one audience. Tell it who to reach in one sentence. It asks what it needs, then searches every night and keeps up to 50 new leads per search." },
    { q: "Who should choose Pancake over Octave?", a: "Founders who do their own sales, and small B2B teams without a GTM engineer. Pancake builds the Brain from your website, finds the people who fit and writes to the leads you approve." },
  ],
  related: [
    { href: "/unify-vs-pancake", label: "Unify vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.octavehq.com/", label: "Octave product page (October 2026)" },
    { href: "https://www.octavehq.com/pricing", label: "Octave pricing (October 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function OctaveVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
