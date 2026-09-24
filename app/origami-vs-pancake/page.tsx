import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Origami vs Pancake: GTM Suggestions vs AI GTM Team";
const description = "Compare Origami and Pancake: live-web research and content-led GTM suggestions versus an AI GTM team that finds buyers, runs outreach, and writes articles.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/origami-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/origami-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Origami vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "origami-vs-pancake",
  competitor: "Origami",
  competitorInitial: "O",
  heroLede: "Content-led GTM suggestions versus a GTM team that does the work.",
  heroSummary: "Origami searches the live web, identifies prospects, and suggests content-led GTM opportunities. Pancake turns buying signals into new leads every morning, opens the conversations from your own account, and writes articles for Google and AI answers.",
  competitorBody: "A GTM research and prospecting product that searches live sources, builds lists, enriches contacts, and helps teams turn market information into content-led plays. It also includes multichannel sequencing for outbound follow-up.",
  competitorChoose: "Choose it when you want flexible live-web research and suggestions.",
  pancakeBody: "An AI GTM team that goes from signal to conversation. Every lead it brings you names the buying signal behind it, and the first message asks about that signal. The same GTM Brain, learned from your website, drives its articles for AI search.",
  pancakeChoose: "Choose it when you want GTM work done, not suggested.",
  verdictTitle: "Origami suggests the motion. Pancake runs it.",
  verdictLede: "Origami is useful for discovering people and content-led opportunities. Pancake is built for founders who want that market knowledge turned into leads and conversations every day.",
  competitorBestFit: "Origami is the better fit when your team wants low-cost, natural-language live-web research, prospect lists, contact enrichment, and ideas it will review and carry forward itself.",
  differencesLede: "Both products read the market. Origami hands you the recommendation. Pancake acts on it.",
  differences: [
    {
      n: "01",
      title: "Suggestions versus written articles",
      body: "Origami can surface content-led opportunities and help shape what to do next, while your team produces and publishes the content. Pancake writes the articles, built to show up in Google and AI answers, and brings each one to you for approval.",
      angle: "A recommendation is a start. An article is an asset.",
    },
    {
      n: "02",
      title: "Content-led motions versus connected GTM",
      body: "Origami's strength is using live-web information to support prospecting and content-based plays. Pancake runs buying signals, daily leads, outreach, and AI-search articles from one strategy.",
      angle: "Pancake connects what the market says to everything GTM does next.",
    },
    {
      n: "03",
      title: "A query result versus a persistent GTM Brain",
      body: "Origami makes it easy to search many live sources and enrich the people you find. Pancake turns your website into a GTM Brain that remembers your positioning, buyers, offers, and objections, then learns from each result.",
      angle: "Useful research becomes institutional memory, not another tab.",
    },
    {
      n: "04",
      title: "Origami wins on flexible list research",
      body: "Origami advertises natural-language search across more than 50 live sources, contact-data waterfalls, and an included sequencer. Those are compelling capabilities for a team that wants to investigate a market and operate the resulting lists itself.",
      angle: "Choose the research toolkit when your team wants to drive.",
    },
    {
      n: "05",
      title: "Lower entry price versus broader execution",
      body: "Origami publicly starts at $29 a month and scales with search credits. Pancake is $99 a month flat, and nothing scales with usage. Compare the cost per conversation started, not the cost per search.",
      angle: "Pay for research capacity or pay for GTM that keeps moving.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Live-web GTM research, lists, and suggestions", mark: "yes" }, pancake: { text: "Leads, outreach, and articles, done for you", mark: "yes" } },
    { feature: "Live-web sources", competitor: { text: "Searches 50+ sources", mark: "yes" }, pancake: { text: "Watches six kinds of buying signals", mark: "yes" } },
    { feature: "Contact enrichment", competitor: { text: "Contact-data waterfalls", mark: "yes" }, pancake: { text: "Every lead comes with the signal that picked it" } },
    { feature: "Content opportunities", competitor: { text: "Surfaces and suggests content-led plays", mark: "yes" }, pancake: { text: "Articles drawn from your GTM Brain", mark: "yes" } },
    { feature: "Writes the content", competitor: { text: "Suggests; your team produces and publishes it", mark: "no" }, pancake: { text: "Writes the articles; you approve them", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "Included multichannel sequencer", mark: "yes" }, pancake: { text: "Starts conversations from your own account", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Research and workflow context" }, pancake: { text: "Built from your website, reused by every agent", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$29/month with credit limits", mark: "yes" }, pancake: { text: "$99/month flat, one plan", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams researching and operating content-led motions" }, pancake: { text: "Founders who want leads and conversations, not lists" } },
  ],
  closingTitle: "Do not stop at the suggestion. Ship the motion.",
  closingLede: "Pancake's agents take it from the buying signal to the first message, and write the articles along the way.",
  faqs: [
    { q: "What is the main difference between Origami and Pancake?", a: "Origami is strong at live-web research, prospect lists, enrichment, and suggesting content-led GTM plays. Pancake is an AI GTM team that acts on what it finds: it picks leads from buying signals, runs the outreach from your own account, and drafts articles for you to approve." },
    { q: "Does Origami publish content for me?", a: "No. Origami can suggest content-led opportunities and support the research behind them, but the team still has to move that content through production and publication. Pancake covers the writing: its agents draft each article for Google and AI search, and you approve it." },
    { q: "Does Origami run outbound?", a: "Origami includes a multichannel sequencer, so it can support outbound execution after a list is created. Pancake ties outreach to the signal: each lead arrives with the reason it was picked, and the first message asks a light question about it." },
    { q: "Which is better for prospect research?", a: "Origami may be the better fit for teams that primarily want natural-language searches across many live sources, data waterfalls, and flexible list building. Pancake is the better fit when you want that research turned into conversations and articles without running the lists yourself." },
    { q: "How does pricing compare?", a: "At the time of review, Origami publicly started at $29 a month with search-credit limits and higher tiers for more capacity. Pancake's price does not move with how much you search: $99 a month, every agent included. Check Origami's current pricing and limits before purchasing." },
    { q: "Who should choose Pancake instead of Origami?", a: "Choose Pancake when you need more than research: buyers picked every morning, conversations started from your own account, and articles written, without hiring a GTM team." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://origami.chat/", label: "Origami product page" },
    { href: "https://origami.chat/pricing", label: "Origami pricing" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function OrigamiVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
