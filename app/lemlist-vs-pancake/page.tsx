import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const title = "Lemlist vs Pancake: Outbound Platform vs Plays That Run";
const description = "Compare Lemlist and Pancake: a multichannel sales-engagement platform your team operates versus Plays that find buyers and start conversations for you.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/lemlist-vs-pancake` },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4): the shared
  // homepage card, so the alt is its printed text, not this page's name.
  ...social({ path: "/lemlist-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "lemlist-vs-pancake",
  competitor: "Lemlist",
  competitorInitial: "L",
  heroLede: "A sales platform your team operates versus Plays that run for you.",
  heroSummary: "Lemlist gives sales teams a large lead database, multichannel campaign controls, enrichment, and deliverability tooling. Pancake gives founders Plays that find your buyers, a reason on every lead, and conversations started from your own account.",
  competitorBody: "A mature sales-engagement platform for building and managing outbound campaigns. Teams use its lead database, enrichment, sequencing, multichannel steps, deliverability tools, and integrations to control the sales workflow.",
  competitorChoose: "Choose it when a sales team wants deep campaign control.",
  pancakeBody: "A GTM platform for founders who want the work done for them. Tell it who you want to reach, and it builds a Play to find them. Each lead gets a personal message written from why they fit. There are no sequences to build.",
  pancakeChoose: "Choose it when you want GTM outcomes without staffing the platform.",
  verdictTitle: "Lemlist equips sales teams. Pancake finds your buyers.",
  verdictLede: "Lemlist is the stronger operator's toolkit. Pancake is built for founders who do their own sales: it finds the buyers and starts the conversations.",
  competitorBestFit: "Lemlist is the better fit when SDRs or sales operators need granular sequences, channel breadth, email deliverability controls, a prospect database, and integrations around an established outbound process.",
  differencesLede: "The real question is who designs, operates, and improves the outbound system: your team or Pancake.",
  differences: [
    {
      n: "01",
      title: "A platform to operate versus Plays that run",
      body: "Lemlist gives a sales team the data and controls to build outbound campaigns. Pancake takes the recurring work: its Plays find the people, and it writes and sends each message from your own account.",
      angle: "Your team runs Lemlist. Pancake runs GTM for your team.",
    },
    {
      n: "02",
      title: "Campaign context versus a persistent GTM Brain",
      body: "Lemlist organizes leads, sequences, variables, and campaign performance. Pancake's Brain holds your ideal customer, personas, competitors, messaging, and voice, researched from your website. Every new Play starts from it.",
      angle: "Campaign history versus shared GTM knowledge.",
    },
    {
      n: "03",
      title: "Channel depth versus a reason on every lead",
      body: "Lemlist goes deep on sales engagement across email, social, calls, WhatsApp, and SMS. Pancake starts earlier: its Plays find leads eight ways, and every lead arrives with one line on why they fit.",
      angle: "Lemlist covers more channels. Pancake tells you why each lead fits.",
    },
    {
      n: "04",
      title: "Lemlist wins on deliverability control",
      body: "Lemlist has dedicated deliverability products and operating controls, including lemwarm and a deliverability hub. That depth matters to teams managing significant outbound volume. Pancake puts its effort elsewhere: finding the buyers and starting the conversation from your own account.",
      angle: "Pick the specialist when deliverability operations are the job.",
    },
    {
      n: "05",
      title: "Different teams by design",
      body: "Lemlist is built for sales organizations and agencies that want users inside a campaign platform. Pancake is built for founders and lean teams: its Plays do the recurring outbound work, and you approve every lead.",
      angle: "Tools for a sales team versus Plays for a founder.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Equip teams to build and manage outbound", mark: "yes" }, pancake: { text: "Finds buyers and opens conversations for you", mark: "yes" } },
    { feature: "Operating model", competitor: { text: "Sales reps or operators run campaigns" }, pancake: { text: "Plays search every night; you approve every lead", mark: "yes" } },
    { feature: "Prospect data", competitor: { text: "Large B2B database and enrichment", mark: "yes" }, pancake: { text: "Eight ways a Play finds leads, each with why they fit", mark: "yes" } },
    { feature: "Outbound channels", competitor: { text: "Email, social steps, calls, WhatsApp, and SMS", mark: "yes" }, pancake: { text: "Direct messages under your name, from several of your own accounts" } },
    { feature: "Deliverability tooling", competitor: { text: "Dedicated hub and lemwarm", mark: "yes" }, pancake: { text: "—" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign and lead context" }, pancake: { text: "Your ideal customer, competitors, and voice, researched from your website", mark: "yes" } },
    { feature: "Pricing model", competitor: { text: "Tiered plans; cost depends on plan and team needs" }, pancake: { text: "$99/month per workspace, no tiers, no seats", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Sales teams and agencies wanting control" }, pancake: { text: "Founders wanting GTM operated for them" } },
  ],
  closingTitle: "Stop staffing the platform. Start running GTM.",
  closingLede: "Tell Pancake who to reach. Its Plays find your buyers, and Pancake opens the conversations for you.",
  faqs: [
    { q: "What is the main difference between Lemlist and Pancake?", a: "Lemlist is a sales-engagement platform that gives sales teams data, sequencing, multichannel controls, deliverability tools, and integrations. Pancake runs the outbound work itself, from finding the leads to opening each conversation from your own account." },
    { q: "Is Lemlist better for email deliverability?", a: "Lemlist has the more specialized deliverability toolkit, including lemwarm and a dedicated deliverability hub. It is the stronger choice when a team needs hands-on control over high-volume outbound infrastructure." },
    { q: "Which product supports more outbound channels?", a: "Lemlist publicly supports a broader set of outbound channels, including email, social, calls, WhatsApp, and SMS. Pancake sends direct messages under your name, each one written from why the lead fits. A reply stops the sequence." },
    { q: "Does Pancake replace a sales team?", a: "Pancake lets founders and lean teams run GTM without hiring an SDR or sales-operations team. It finds the buyers and opens the conversations. You approve every lead, set the direction, and handle the conversations that need you." },
    { q: "How does pricing compare?", a: "Lemlist uses tiered plans whose current price and included channels depend on the package and team needs. Pancake has one plan with no tiers: $99 a month per workspace, after a 3-day free trial (card required). Check Lemlist's pricing page for current limits before deciding." },
    { q: "Can Lemlist and Pancake work together?", a: "They can run side by side. A sales team can keep Lemlist for email sequencing and deliverability while Pancake runs Plays and opens conversations from the founder's own account." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.lemlist.com/", label: "Lemlist product page" },
    { href: "https://www.lemlist.com/pricing", label: "Lemlist pricing" },
    { href: `${SITE_ORIGIN}/`, label: "Pancake product page" },
  ],
};

export default function LemlistVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
