import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// Smartlead facts read on 2026-11-10 from smartlead.ai and smartlead.ai/pricing. Prices are
// the monthly ones its pricing FAQ states (Base $39, Pro $94, Unlimited Smart $174, Unlimited
// Prime $379; the cards default to yearly billing, 17% lower).
// Re-check both pages before moving `factsReviewed`, and again within 90 days.
const title = "Smartlead vs Pancake: Cold Email Infrastructure vs Plays";
const description = "Compare Smartlead and Pancake: cold email with unlimited mailboxes and warmup from $39 a month, versus Plays you ask for in Claude from $99 a month.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/smartlead-vs-pancake` },
  // Share card via lib/social-meta.ts, like every comparison page: the shared homepage card,
  // so the alt is its printed text, not this page's name.
  ...social({ path: "/smartlead-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "smartlead-vs-pancake",
  competitor: "Smartlead",
  competitorInitial: "S",
  modified: "2026-11-10",
  factsReviewed: "November 10, 2026",
  heroLede: "Mailboxes and warmup to manage versus Plays you ask Claude for.",
  heroSummary: "Smartlead runs cold email on unlimited mailboxes, with warmup, a deliverability engine and a master inbox. Pancake lets you deploy any GTM play from Claude, ChatGPT or Codex: say who to reach, and Pancake builds the Play.",
  competitorBody: "A cold email platform built around deliverability: unlimited mailboxes, automatic warmup and sender rotation, verified prospect emails, a master inbox, a dialer and a built-in CRM. Agencies can whitelabel it for each client.",
  competitorChoose: "Choose it when deliverability at volume is the job.",
  pancakeBody: "Deploy any GTM play from Claude, ChatGPT or Codex. Say who to reach, and Pancake builds the Play. It checks every lead against your ICP and writes each one a personal message in your voice, sent from your own account.",
  pancakeChoose: "Choose it when you want no mailboxes to run.",
  verdictTitle: "Smartlead runs the mailboxes. Pancake builds the Play.",
  verdictLede: "Smartlead is the stronger choice when cold email volume is the plan and someone owns deliverability. Pancake fits when you want to say who to reach and skip the email infrastructure.",
  competitorBestFit: "Smartlead is the better fit when a team or an agency sends cold email from many mailboxes and wants warmup, sender rotation, a master inbox, a dialer and client workspaces in one tool.",
  differencesLede: "Both start conversations with people who don't know you yet. They differ in the channel, the setup and what you pay for.",
  differences: [
    {
      n: "01",
      title: "Emails sent versus research per lead",
      body: "Smartlead's plans are sized by emails: 6,000 sends a month on Base, up to 500,000 on Unlimited Prime. Pancake's credits pay for the research a search does, and every lead is checked against your ICP.",
      angle: "One plan counts sends. The other counts research.",
    },
    {
      n: "02",
      title: "Mailboxes to run versus your own account",
      body: "With Smartlead you connect mailboxes, and it handles DNS, warmup and sender rotation. Pancake sends no email. Its messages leave from the account you already have, under your name.",
      angle: "No infrastructure to keep healthy.",
    },
    {
      n: "03",
      title: "Verified emails versus a Play that searches",
      body: "Smartlead's SmartProspect supplies verified prospect emails, with filters and intent signals. It is a $59 a month add-on on Base and Pro. In Pancake you say who to reach. The Play searches 50+ data providers and keeps searching on your schedule.",
      angle: "Say who you want. The Play does the search.",
    },
    {
      n: "04",
      title: "Smartlead wins on deliverability and volume",
      body: "Smartlead offers dedicated infrastructure and IPs, a private warmup pool and inbox placement tests, built to send cold email at volume. Pancake sends no email, so it has none of this.",
      angle: "Pick Smartlead when you send email by the hundred thousand.",
    },
    {
      n: "05",
      title: "Smartlead wins on calling and agency tooling",
      body: "Smartlead has a dialer with parallel dialing, a master inbox across clients, and whitelabel at $29 a month per client workspace. Pancake makes no calls. One workspace is one company: a second company is a second workspace, with its own plan.",
      angle: "Pick Smartlead when you run outbound for clients.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Cold email at volume, with deliverability built in", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "How you start", competitor: { text: "Connect mailboxes, add leads, launch sequences" }, pancake: { text: "Say who to reach; Pancake builds the Play", mark: "yes" } },
    { feature: "Channel", competitor: { text: "Email, plus a dialer", mark: "yes" }, pancake: { text: "Direct messages under your name, from the accounts you send from", mark: "yes" } },
    { feature: "Email infrastructure", competitor: { text: "Unlimited mailboxes, warmup and sender rotation", mark: "yes" }, pancake: { text: "No email", mark: "no" } },
    { feature: "Lead data", competitor: { text: "Verified prospect emails, a $59 add-on on Base and Pro" }, pancake: { text: "50+ data providers included", mark: "yes" } },
    { feature: "Qualification", competitor: { text: "Filters and intent signals" }, pancake: { text: "Every lead checked against your ICP", mark: "yes" } },
    { feature: "Replies", competitor: { text: "A master inbox with an AI reply manager", mark: "yes" }, pancake: { text: "A reply stops the sequence", mark: "yes" } },
    { feature: "Calling", competitor: { text: "A dialer with parallel dialing", mark: "yes" }, pancake: { text: "No calls", mark: "no" } },
    { feature: "Agencies", competitor: { text: "Client workspaces, with a whitelabel add-on", mark: "yes" }, pancake: { text: "One workspace per company" } },
    { feature: "Pricing", competitor: { text: "$39, $94, $174 or $379 a month, sized by emails sent" }, pancake: { text: "From $99 a month per workspace, whole team included", mark: "yes" } },
    { feature: "Free trial", competitor: { text: "Free trial, no card", mark: "yes" }, pancake: { text: "7-day free trial with 30,000 credits, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams and agencies sending cold email at volume" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "No warmup. No DNS. One sentence.",
  closingLede: "Tell Pancake who to reach. It builds the Play and writes each lead a personal message from your own account.",
  faqs: [
    { q: "What is the main difference between Smartlead and Pancake?", a: "Smartlead is cold email infrastructure: unlimited mailboxes, warmup, sender rotation and a master inbox, sized by emails sent. Pancake builds Plays: say who to reach, and it finds the people, checks each one against your ICP and writes to them from your own account." },
    { q: "Is Pancake an alternative to Smartlead?", a: "Only if you want to move away from cold email. Pancake sends no email. It finds people who fit your ICP and writes each one a personal message, sent from your own account." },
    { q: "How does pricing compare?", a: "As of November 2026, Smartlead's plans are $39, $94, $174 and $379 a month, sized by emails sent, and annual billing is 17% lower. Pancake starts at $99 a month per workspace with 60,000 credits. Its 7-day free trial comes with 30,000 credits, and a card is required to start it." },
    { q: "Does Pancake send cold email?", a: "No. Pancake doesn't send outreach by email. It can find a lead's work email, and you can export the leads you pick to your CRM or download them as CSV." },
    { q: "Can I use Smartlead and Pancake together?", a: "Yes. They cover different channels. Keep Smartlead for cold email, and use Pancake for Plays and personal messages from your own account." },
    { q: "Can I run Pancake from Claude?", a: "Yes. Pancake connects to Claude, Claude Code, ChatGPT and Codex with a browser sign-in and no API key. You create Plays, review leads and edit messages from the chat." },
  ],
  related: [
    { href: "/instantly-vs-pancake", label: "Instantly vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.smartlead.ai/", label: "Smartlead product page (November 2026)" },
    { href: "https://www.smartlead.ai/pricing", label: "Smartlead pricing (November 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function SmartleadVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
