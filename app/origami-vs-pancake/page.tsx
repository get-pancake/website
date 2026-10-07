import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

const title = "Origami vs Pancake: GTM Suggestions vs Plays That Run";
const description = "Compare Origami and Pancake: live-web research and content-led GTM suggestions versus Plays that find your buyers and start the conversations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/origami-vs-pancake` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/origami-vs-pancake`,
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
  heroSummary: "Origami searches the live web, identifies prospects, and suggests content-led GTM opportunities. Pancake runs Plays that find your buyers, tells you why each one fits, and opens the conversations from your own account.",
  competitorBody: "A GTM research and prospecting product that searches live sources, builds lists, enriches contacts, and helps teams turn market information into content-led motions. It also includes multichannel sequencing for outbound follow-up.",
  competitorChoose: "Choose it when you want flexible live-web research and suggestions.",
  pancakeBody: "A GTM platform that goes from who you want to reach to the first conversation. Every lead arrives with one line on why they fit. Pancake writes each one a personal message from that reason, in your voice.",
  pancakeChoose: "Choose it when you want GTM work done, not suggested.",
  verdictTitle: "Origami suggests the motion. Pancake runs it.",
  verdictLede: "Origami is useful for discovering people and content-led opportunities. Pancake is built for founders who want that market knowledge turned into leads and conversations.",
  competitorBestFit: "Origami is the better fit when your team wants low-cost, natural-language live-web research, prospect lists, contact enrichment, and ideas it will review and carry forward itself.",
  differencesLede: "Both products read the market. Origami hands you the recommendation. Pancake acts on it.",
  differences: [
    {
      n: "01",
      title: "A list versus a Play that runs",
      body: "Origami answers a research question and hands your team the list. Tell Pancake who you want to reach, and it builds a Play to find them. Each search discovers, enriches, and qualifies leads.",
      angle: "A list is a start. A Play turns it into conversations.",
    },
    {
      n: "02",
      title: "Content-led ideas versus outbound focus",
      body: "Origami's strength is using live-web information to support prospecting and content-led motions. Pancake focuses on outbound: finding your buyers and starting the conversation. Every lead gets a personal message written from why they fit.",
      angle: "Pick the motion you want run for you.",
    },
    {
      n: "03",
      title: "A query result versus a persistent GTM Brain",
      body: "Origami makes it easy to search many live sources and enrich the people you find. Pancake turns your website into a Brain that remembers your ideal customer, personas, competitors, messaging, and voice. Every new Play starts from it.",
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
      title: "Lower entry price versus execution included",
      body: "Origami publicly starts at $29 a month and scales with search credits. Pancake is $99 a month flat, and nothing scales with usage. Compare the cost per conversation started, not the cost per search.",
      angle: "Pay for research capacity or pay for GTM that keeps moving.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Live-web GTM research, lists, and suggestions", mark: "yes" }, pancake: { text: "Finds your buyers and starts the conversations", mark: "yes" } },
    { feature: "Live-web sources", competitor: { text: "Searches 50+ sources", mark: "yes" }, pancake: { text: "Six ways a Play finds leads", mark: "yes" } },
    { feature: "Contact enrichment", competitor: { text: "Contact-data waterfalls", mark: "yes" }, pancake: { text: "Each search discovers, enriches, and qualifies leads", mark: "yes" } },
    { feature: "Content opportunities", competitor: { text: "Surfaces and suggests content-led motions", mark: "yes" }, pancake: { text: "Focused on outbound" } },
    { feature: "Outbound", competitor: { text: "Included multichannel sequencer", mark: "yes" }, pancake: { text: "A personal message for every lead, from your own account", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Research and workflow context" }, pancake: { text: "Built from your website; every Play starts from it", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$29/month with credit limits", mark: "yes" }, pancake: { text: "$99/month flat, one plan", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams researching and operating content-led motions" }, pancake: { text: "Founders who want leads and conversations, not lists" } },
  ],
  closingTitle: "Do not stop at the suggestion. Ship the motion.",
  closingLede: "Tell Pancake who you want to reach. It builds a Play to find them, and every lead arrives with why they fit.",
  faqs: [
    { q: "What is the main difference between Origami and Pancake?", a: "Origami is strong at live-web research, prospect lists, enrichment, and suggesting content-led GTM motions. Pancake acts on what it finds. You tell it who you want to reach, it builds a Play to find them, and you approve every lead before anyone is contacted." },
    { q: "Does Origami publish content for me?", a: "No. Origami can suggest content-led opportunities and support the research behind them, but your team still writes and publishes the content. Pancake focuses on outbound: finding your buyers and starting the conversation." },
    { q: "Does Origami run outbound?", a: "Origami includes a multichannel sequencer, so it can support outbound execution after a list is created. Pancake ties outreach to the lead: each one arrives with one line on why they fit, and its personal message is written from that reason. A reply stops the sequence." },
    { q: "Which is better for prospect research?", a: "Origami may be the better fit for teams that primarily want natural-language searches across many live sources, data waterfalls, and flexible list building. Pancake is the better fit when you want that research turned into conversations without running the lists yourself." },
    { q: "How does pricing compare?", a: "At the time of review, Origami publicly started at $29 a month with search-credit limits and higher tiers for more capacity. Pancake's price does not move with how much you search: $99 a month, every agent included. Check Origami's current pricing and limits before purchasing." },
    { q: "Who should choose Pancake instead of Origami?", a: "Choose Pancake when you need more than research: a Play for each audience you sell to, a reason on every lead, and conversations started from your own account. There is no GTM team to hire." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://origami.chat/", label: "Origami product page" },
    { href: "https://origami.chat/pricing", label: "Origami pricing" },
    { href: `${SITE_ORIGIN}/`, label: "Pancake product page" },
  ],
};

export default function OrigamiVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
