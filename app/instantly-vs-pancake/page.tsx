import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// Instantly facts read on 2026-11-10 from instantly.ai and instantly.ai/pricing (the Outreach
// and Instantly Credits tabs, monthly billing: outreach $47 / $107 / $358, lead database
// credits from $47, two separate plans).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
const title = "Instantly vs Pancake: Cold Email vs Plays From Claude";
const description = "Compare Instantly and Pancake: cold email with unlimited email accounts from $47 a month, versus Plays you ask for in Claude, with a personal message per lead.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/instantly-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/instantly-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "instantly-vs-pancake",
  competitor: "Instantly",
  competitorInitial: "I",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "Cold email at volume versus a personal message per lead.",
  heroSummary: "Instantly sends cold email at volume, with unlimited email accounts, warmup and a lead database. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "A cold email platform: unlimited email accounts and warmup, deliverability tools, a database of 450M+ B2B leads, a built-in CRM and AI agents that write and reply. It connects to ChatGPT.",
  competitorChoose: "Choose it when cold email is your channel and volume matters.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. It checks every lead against your ICP and writes each one a personal message in your voice, sent from your own account.",
  pancakeChoose: "Choose it when you want each lead checked and messaged personally.",
  verdictTitle: "Instantly sends the volume. Pancake builds the Play.",
  verdictLede: "Instantly is the stronger choice when cold email at volume is the plan and you manage the mailboxes. Pancake fits when you want to say who to reach and have each lead checked and messaged for you.",
  competitorBestFit: "Instantly is the better fit when a team or an agency runs cold email across many mailboxes and needs warmup, deliverability tools, a lead database and one inbox for replies.",
  differencesLede: "Both reach people who haven't heard of you. They differ in the channel, the volume and who builds the list.",
  differences: [
    {
      n: "01",
      title: "Email volume versus a message per lead",
      body: "Instantly's entry plan sends 5,000 emails a month from unlimited email accounts, and its Light Speed plan sends 500,000. Pancake writes each lead a personal message, in your voice, and sends it from your own account.",
      angle: "Volume on one side. A message written for one person on the other.",
    },
    {
      n: "02",
      title: "Mailboxes to manage versus your own account",
      body: "Instantly is built on email accounts: you connect them, warm them up and watch inbox placement. Pancake sends no email. Its messages leave from the account you already have, under your name.",
      angle: "Nothing to warm up.",
    },
    {
      n: "03",
      title: "A database you filter versus a Play that searches",
      body: "Instantly sells its 450M+ lead database as a separate credits plan, with 13 filters and work email enrichment. In Pancake you say who to reach. The Play searches 50+ data providers and checks every lead against your ICP.",
      angle: "Say who you want. Skip the filters.",
    },
    {
      n: "04",
      title: "Instantly wins on email and deliverability",
      body: "Instantly includes unlimited warmup on every outreach plan, and its Light Speed plan adds dedicated server and IP rotation. Pancake sends no email, so it has no deliverability tooling.",
      angle: "Pick Instantly when the inbox is where you sell.",
    },
    {
      n: "05",
      title: "Two plans versus one",
      body: "As of November 2026, Instantly's outreach plans start at $47 a month, and its lead database credits start at $47 a month, sold separately. Pancake starts at $99 a month per workspace. The search, the ICP check and the messages are in one plan.",
      angle: "Compare what each plan covers, not only the price.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Cold email at volume", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you start", competitor: { text: "Connect email accounts, add leads, launch" }, pancake: { text: "Say who to reach; Pancake builds the Play", mark: "yes" } },
    { feature: "Channel", competitor: { text: "Email", mark: "yes" }, pancake: { text: "Direct messages under your name, from the accounts you send from", mark: "yes" } },
    { feature: "Email infrastructure", competitor: { text: "Unlimited email accounts and warmup", mark: "yes" }, pancake: { text: "No email", mark: "no" } },
    { feature: "Lead data", competitor: { text: "450M+ lead database, sold as separate credits", mark: "yes" }, pancake: { text: "50+ data providers included", mark: "yes" } },
    { feature: "Qualification", competitor: { text: "13 filters, including keywords and lookalikes" }, pancake: { text: "Every lead checked against your ICP", mark: "yes" } },
    { feature: "Replies", competitor: { text: "Unibox and an AI Reply Agent", mark: "yes" }, pancake: { text: "A reply stops the sequence", mark: "yes" } },
    { feature: "AI agents", competitor: { text: "Connects to ChatGPT; Claude listed as coming soon" }, pancake: { text: "Claude, Claude Code, ChatGPT and Codex, with a browser sign-in", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "Outreach from $47 a month; lead credits from $47 a month" }, pancake: { text: "From $99 a month per workspace, whole team included", mark: "yes" } },
    { feature: "Free trial", competitor: { text: "Free to start, no card", mark: "yes" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams and agencies running cold email at volume" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "Skip the mailboxes. Say who to reach.",
  closingLede: "Tell Pancake who to reach. It builds the Play and writes each lead a personal message from your own account.",
  faqs: [
    { q: "What is the main difference between Instantly and Pancake?", a: "Instantly is a cold email platform: you connect email accounts, warm them up and send sequences at volume. Pancake builds Plays: say who to reach, and it finds the people, checks each one against your ICP and writes to them from your own account." },
    { q: "Is Pancake an alternative to Instantly?", a: "Only if you want to move away from cold email. Pancake sends no email. It finds people who fit your ICP and writes each one a personal message, sent from your own account." },
    { q: "How does pricing compare?", a: "As of November 2026, Instantly's outreach plans are $47, $107 and $358 a month, and its lead database credits start at $47 a month, sold separately. Pancake starts at $99 a month per workspace with 60,000 credits. Its 7-day free trial comes with 30,000 credits, and a card is required to start it." },
    { q: "Does Pancake send cold email?", a: "No. Pancake doesn't send outreach by email. It can find a lead's work email, and you can export the leads you pick to your CRM or download them as CSV." },
    { q: "Can I use Instantly and Pancake together?", a: "Yes. They cover different channels. Keep Instantly for cold email, and use Pancake for Plays and personal messages from your own account." },
    { q: "Do both work from ChatGPT or Claude?", a: "Instantly connects to ChatGPT, and its site lists Claude as coming soon. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key." },
  ],
  related: [
    { href: "/smartlead-vs-pancake", label: "Smartlead vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://instantly.ai/", label: "Instantly product page (November 2026)" },
    { href: "https://instantly.ai/pricing", label: "Instantly pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function InstantlyVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
