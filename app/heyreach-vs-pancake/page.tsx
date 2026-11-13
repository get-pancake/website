import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// HeyReach facts read on 2026-11-10 from heyreach.io and heyreach.io/pricing (monthly billing:
// Growth $79 per sender, Agency $999 for 25 senders, Unlimited $2,999, capped at 300 senders
// under its fair-use policy).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
// HeyReach names the network it automates on every line; this page never does, and stays at
// the level of what the tool does: senders, lists, an inbox, steps with conditions.
const title = "HeyReach vs Pancake: Imported Lists vs Plays That Find Leads";
const description = "Compare HeyReach and Pancake: outreach automation priced per sender, for lists you import, versus Plays that find the people and write to each one.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/heyreach-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/heyreach-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "heyreach-vs-pancake",
  competitor: "HeyReach",
  competitorInitial: "H",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "Outreach for lists you import versus Plays that find the people.",
  heroSummary: "HeyReach automates social outreach across many sender accounts, for lead lists you import. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "An outreach automation tool for agencies, sales teams and GTM operators. It rotates sending across many accounts, keeps every reply in one unified inbox, and connects to Clay, HubSpot, Instantly and Smartlead.",
  competitorChoose: "Choose it when you bring the lists and need many senders.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. It finds the people, checks every lead against your ICP and writes each one a personal message in your voice.",
  pancakeChoose: "Choose it when you want the leads found, then messaged.",
  verdictTitle: "HeyReach sends to your lists. Pancake finds the people.",
  verdictLede: "HeyReach is the stronger choice for agencies and teams that run many senders on lists they already have. Pancake fits when you want the search, the ICP check and the message in one Play.",
  competitorBestFit: "HeyReach is the better fit when an agency or a sales team runs outreach from dozens of accounts, wants one inbox for every reply, and builds its lead lists in another tool.",
  differencesLede: "Both send messages from your own accounts. They differ in where the leads come from and in how you pay.",
  differences: [
    {
      n: "01",
      title: "Lists you import versus leads Pancake finds",
      body: "HeyReach starts from a list: you import contacts from Clay, HubSpot, RB2B or another tool. Pancake starts from a sentence. Say who to reach, and the Play searches 50+ data providers and checks every lead against your ICP.",
      angle: "One needs a list. The other builds it.",
    },
    {
      n: "02",
      title: "Per sender versus per workspace",
      body: "As of November 2026, HeyReach's Growth plan is $79 a month per sender. Agency is $999 a month for 25 senders, and Unlimited is $2,999. Pancake starts at $99 a month per workspace with one sending account. Each extra one is $39 a month.",
      angle: "HeyReach is priced for many senders. Pancake is priced for the search.",
    },
    {
      n: "03",
      title: "HeyReach wins on scale across senders",
      body: "HeyReach rotates sending across your accounts, with unlimited senders on its top plan under a fair-use cap of 300. A Pancake Play sends from one account or rotates across up to ten.",
      angle: "Pick HeyReach when you run dozens of accounts.",
    },
    {
      n: "04",
      title: "HeyReach wins on agency tooling",
      body: "HeyReach keeps each client's senders, leads and outreach in a separate workspace under one login. Its Agency plan adds whitelabel. In Pancake one workspace is one company: a second company is a second workspace, with its own plan.",
      angle: "Pick HeyReach when clients need their own branded tool.",
    },
    {
      n: "05",
      title: "Both run from Claude",
      body: "HeyReach has an MCP server, a CLI and an API to launch and manage outreach from Claude or ChatGPT. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in. Ask for a Play, and it finds the people too.",
      angle: "Same chat. Pancake starts one step earlier.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Outreach automation across many senders", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "Where leads come from", competitor: { text: "Lists you import from Clay, HubSpot, RB2B and other tools" }, pancake: { text: "A search across 50+ data providers", mark: "yes" } },
    { feature: "Qualification", competitor: { text: "You import leads already qualified" }, pancake: { text: "Every lead checked against your ICP", mark: "yes" } },
    { feature: "Messages", competitor: { text: "Sequences of steps, with conditions", mark: "yes" }, pancake: { text: "A personal message for each lead, in your voice", mark: "yes" } },
    { feature: "Senders", competitor: { text: "Auto-rotation; unlimited senders on the top plan", mark: "yes" }, pancake: { text: "One sending account included; a Play rotates across up to ten", mark: "yes" } },
    { feature: "Replies", competitor: { text: "One unified inbox for every sender", mark: "yes" }, pancake: { text: "A reply stops the sequence", mark: "yes" } },
    { feature: "Email", competitor: { text: "Through Instantly and Smartlead integrations; finds verified emails", mark: "yes" }, pancake: { text: "No email outreach; finds a lead's work email on demand" } },
    { feature: "CRM", competitor: { text: "HubSpot sync", mark: "yes" }, pancake: { text: "No sync: a one-way export to HubSpot, Attio, Pipedrive and others", mark: "no" } },
    { feature: "AI agents", competitor: { text: "MCP server, CLI and API", mark: "yes" }, pancake: { text: "Claude, Claude Code, ChatGPT and Codex, with a browser sign-in", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "$79 a month per sender; $999 for 25 senders; $2,999 unlimited" }, pancake: { text: "From $99 a month per workspace; extra sending accounts $39 a month" } },
    { feature: "Free trial", competitor: { text: "Free to try, no card", mark: "yes" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Agencies and sales teams with many senders and their own lists" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Say who to reach. Pancake finds them.",
  closingLede: "Tell Pancake who to reach. It builds the Play, checks every lead against your ICP and writes to the people who fit.",
  faqs: [
    { q: "What is the main difference between HeyReach and Pancake?", a: "HeyReach automates outreach for lead lists you import, across many sender accounts, priced per sender. Pancake builds Plays: say who to reach, and it finds the people, checks each one against your ICP and writes to them from your own account." },
    { q: "Is Pancake an alternative to HeyReach?", a: "Yes, if you want the leads found as well as messaged. Not if you run outreach for many clients from dozens of accounts: HeyReach is built for that." },
    { q: "How does pricing compare?", a: "As of November 2026, HeyReach's Growth plan is $79 a month per sender, Agency is $999 a month for 25 senders and Unlimited is $2,999 a month. Pancake starts at $99 a month per workspace with one sending account. Each extra account is $39 a month." },
    { q: "Where do the leads come from?", a: "In HeyReach, from lists you import from tools such as Clay, HubSpot or RB2B. In Pancake, from the Play: it searches 50+ data providers for the people you described and checks each one against your ICP." },
    { q: "Do both work from Claude?", a: "Yes. HeyReach has an MCP server, a CLI and an API. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key." },
    { q: "Can I send from several accounts with Pancake?", a: "Yes. One sending account is included, and each extra one is $39 a month. A Play sends from one account or rotates across up to ten." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.heyreach.io/", label: "HeyReach product page (November 2026)" },
    { href: "https://www.heyreach.io/pricing", label: "HeyReach pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function HeyReachVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
