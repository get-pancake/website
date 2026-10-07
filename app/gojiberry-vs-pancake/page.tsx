import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const title = "Gojiberry vs Pancake: Outreach Agent vs GTM Platform";
const description = "Compare Gojiberry and Pancake: focused AI prospecting and outreach versus a GTM platform that finds buyers, shows why each one fits, and starts conversations.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/gojiberry-vs-pancake` },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4): the shared
  // homepage card, so the alt is its printed text, not this page's name.
  ...social({ path: "/gojiberry-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "gojiberry-vs-pancake",
  competitor: "Gojiberry",
  competitorInitial: "G",
  heroLede: "A focused outreach agent versus a full GTM platform.",
  heroSummary: "Gojiberry finds high-intent prospects and automates email and social outreach. Pancake researches your company from your website, builds a Play for each audience you sell to, and starts conversations from your own account.",
  competitorBody: "An AI prospecting product focused on identifying high-intent leads, scoring them, and running multichannel email and social outreach. It offers approval controls, a unified inbox, and agents that adapt campaigns over time.",
  competitorChoose: "Choose it when your main job is outbound prospecting.",
  pancakeBody: "A GTM platform built around one Brain: your ideal customer, personas, competitors, messaging, and voice. Every Play starts from it. Each lead arrives with why they fit and gets a personal message written from that reason.",
  pancakeChoose: "Choose it when every audience you sell to should run from one Brain.",
  verdictTitle: "Choose Gojiberry for focused outbound. Choose Pancake for one Brain behind every Play.",
  verdictLede: "Both can help a lean team reach prospects. The deciding question is whether you need an outreach specialist or a Play for each audience, all running from one Brain.",
  competitorBestFit: "Gojiberry is the cleaner fit if your immediate bottleneck is prospecting and personalized email or social outreach, and you want an inbox and approval controls built around that workflow.",
  differencesLede: "The products overlap in outbound. They differ in what learns, what executes, and how far the system carries your GTM.",
  differences: [
    {
      n: "01",
      title: "One Brain behind every Play",
      body: "Gojiberry learns from prospecting and outreach activity. Pancake's core is the Brain: your ideal customer, personas, competitors, messaging, and voice, researched from your website. Every new Play starts from it.",
      angle: "Outreach learns a campaign. Pancake's whole GTM learns the market.",
    },
    {
      n: "02",
      title: "One Play per audience",
      body: "Gojiberry concentrates on finding prospects and contacting them. Pancake runs a Play for each audience you sell to. Each Play finds one audience one way, and you run as many as you need.",
      angle: "One outbound lane versus a Play for every audience.",
    },
    {
      n: "03",
      title: "A reason on every lead",
      body: "Gojiberry finds and scores high-intent prospects. Every Pancake lead arrives with one line on why they fit, such as “Commented on Gong’s post · Revenue leader at a B2B SaaS.”",
      angle: "You see the reason before you approve the lead.",
    },
    {
      n: "04",
      title: "Focused workflow versus compounding context",
      body: "Gojiberry's unified inbox and approval modes make outbound execution easy to supervise. With Pancake, you approve every lead before anyone is contacted. Reject one with a reason, and Pancake suggests Brain changes you accept or ignore.",
      angle: "Every reason you give shapes the next Play.",
    },
    {
      n: "05",
      title: "Similar entry price, different scope",
      body: "Gojiberry publicly lists a $99 monthly starting point for focused prospecting and outreach agents. Pancake is $99 a month per workspace for everything: Plays, leads, personal messages, and the shared Brain.",
      angle: "Compare the motion you automate, not only the monthly price.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Prospecting and multichannel outreach", mark: "yes" }, pancake: { text: "GTM platform: Plays, leads, and outreach", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign learning centered on outreach" }, pancake: { text: "Ideal customer, personas, competitors, messaging, and voice; every Play starts from it", mark: "yes" } },
    { feature: "High-intent leads", competitor: { text: "Finds high-intent prospects", mark: "yes" }, pancake: { text: "Eight ways a Play finds leads", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "Email and social outreach with approval controls", mark: "yes" }, pancake: { text: "From your own account, each message written from why the lead fits", mark: "yes" } },
    { feature: "Unified inbox", competitor: { text: "Built in", mark: "yes" }, pancake: { text: "—" } },
    { feature: "Lead context", competitor: { text: "An intent score on each prospect", mark: "yes" }, pancake: { text: "One line on why each lead fits", mark: "yes" } },
    { feature: "Approvals", competitor: { text: "Approval modes on outreach", mark: "yes" }, pancake: { text: "You approve every lead", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$99/month", mark: "yes" }, pancake: { text: "$99/month per workspace, whole team included", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want a focused outbound agent" }, pancake: { text: "Founders who want every Play working from one Brain" } },
  ],
  closingTitle: "Give every Play the same Brain.",
  closingLede: "Pancake researches your company from your website. Every new Play starts from what it learned.",
  faqs: [
    { q: "What is the main difference between Gojiberry and Pancake?", a: "Gojiberry is focused on AI prospecting and multichannel outreach. Pancake is a GTM platform built around a shared Brain: what it knows about your buyers shapes every Play it builds and every message it writes." },
    { q: "Do both products find high-intent leads?", a: "Yes. Gojiberry describes high-intent lead discovery and scoring as a core part of its prospecting agent. Pancake finds leads eight ways: people engaging with posts from your competitors, experts, or your own brand, everyone who reacted to one specific post, people posting about your topics, companies hiring for a role, companies using a technology, recently funded companies, companies that look like your best customers, and a direct match on role, industry, company size, and location. Every lead arrives with one line on why they fit." },
    { q: "Which product is better for a pure outbound motion?", a: "Gojiberry is a strong fit when you mainly need outbound prospecting, an integrated inbox, and explicit approval controls. Pancake is the better fit when you sell to more than one audience and want a Play for each, all drawing on one Brain." },
    { q: "Do Gojiberry and Pancake cost the same?", a: "At the time of review, Gojiberry publicly listed $99 a month as its starting point. Pancake's $99 a month covers everything, with no seat or usage fees on top. Check Gojiberry's current plans and allowances before buying." },
    { q: "What is a Play in Pancake?", a: "A Play is how Pancake finds one audience. You tell Pancake in plain English who you want to reach, and it builds the Play with you: who to find, how to find them, and how many leads per search, up to 50. Run as many Plays as you need, one per audience." },
    { q: "Can I use Gojiberry and Pancake together?", a: "Yes. A team could keep Gojiberry for email outreach and use Pancake for its Plays and outreach from your own account. Decide first whether you want one platform or separate specialist tools." },
  ],
  related: [
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://gojiberry.ai/", label: "Gojiberry product page" },
    { href: `${SITE_ORIGIN}/`, label: "Pancake product page" },
  ],
};

export default function GojiberryVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
