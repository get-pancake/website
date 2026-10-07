import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

// 2026-10-07: origami.chat now recommends plays and runs the ones you approve ("Origami gets
// customers for you"), so the "suggestions vs Plays that run" framing is gone. The angle is the
// one its pages show: Origami estimates each play in credits (about 100 for 20 accounts
// researched and emails verified); Pancake is one price per workspace and a Play searches again
// every night. Whether an approved Origami play repeats on its own is not on its site, so this
// page never claims it doesn't. Title and verdict await the founder's sign-off.
const title = "Origami vs Pancake: Plays in Credits vs One Price";
const description = "Compare Origami and Pancake: live-web plays billed in credits versus Plays that search every night for $99 a month per workspace.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/origami-vs-pancake` },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4): the shared
  // homepage card, so the alt is its printed text, not this page's name.
  ...social({ path: "/origami-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "origami-vs-pancake",
  competitor: "Origami",
  competitorInitial: "O",
  heroLede: "Plays billed in credits versus Plays at one price.",
  heroSummary: "Origami searches the live web, recommends plays from your website, and runs the ones you approve, priced in credits. Pancake runs Plays that find your buyers every night, tells you why each one fits, and opens the conversations from your own account.",
  competitorBody: "A GTM product that searches 50+ live sources, builds and enriches lists, and recommends plays from your website. Approve a play and Origami runs it, with email and social sequences and, on Pro and up, drafted posts.",
  competitorChoose: "Choose it when you want flexible live-web research and lists on demand.",
  pancakeBody: "A GTM platform that goes from who you want to reach to the first conversation. Every lead arrives with one line on why they fit. Pancake writes each one a personal message from that reason, in your voice.",
  pancakeChoose: "Choose it when you want Plays that keep searching, at one price.",
  verdictTitle: "Origami bills by credit. Pancake is one price.",
  verdictLede: "Origami is strong at live-web research, contact data, and content. Pancake is built for founders who want new leads every morning and conversations started from their own account.",
  competitorBestFit: "Origami is the better fit when your team wants natural-language live-web research, prospect lists with verified contact data, email and social sequences, and drafted posts, paid for in credits.",
  differencesLede: "Both products read the market and run what you approve. They differ in how you pay for it.",
  differences: [
    {
      n: "01",
      title: "Credits per play versus one price",
      body: "Origami prices each play in credits: about 100 to research 20 accounts and verify their emails. A Pancake Play searches again every night and qualifies each lead, within $99 a month per workspace.",
      angle: "A list is a start. A Play keeps finding new people.",
    },
    {
      n: "02",
      title: "Outreach and content versus outbound focus",
      body: "Origami runs outreach and, on Pro and up, drafts posts with a branded visual. Pancake focuses on outbound: finding your buyers and starting the conversation. Every lead gets a personal message written from why they fit.",
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
      title: "Credits versus one price per workspace",
      body: "Origami starts free, then $49 a month for 4,000 credits, five email senders and one social sender, with extra social senders at $10 a month. Pancake is $99 a month per workspace, everything included.",
      angle: "Pay for research capacity or pay for GTM that keeps moving.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Live-web research, lists, and the plays you approve", mark: "yes" }, pancake: { text: "Finds your buyers and starts the conversations", mark: "yes" } },
    { feature: "Live-web sources", competitor: { text: "Searches 50+ sources", mark: "yes" }, pancake: { text: "Eight ways a Play finds leads", mark: "yes" } },
    { feature: "Contact enrichment", competitor: { text: "Contact-data waterfalls", mark: "yes" }, pancake: { text: "Each search discovers, enriches, and qualifies leads", mark: "yes" } },
    { feature: "Content", competitor: { text: "Drafts posts and visuals on Pro and up", mark: "yes" }, pancake: { text: "Focused on outbound" } },
    { feature: "Outbound", competitor: { text: "Included multichannel sequencer", mark: "yes" }, pancake: { text: "A personal message for every lead, from your own account", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Research and workflow context" }, pancake: { text: "Built from your website; every Play starts from it", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$49/month, 4,000 credits", mark: "yes" }, pancake: { text: "$99/month per workspace, one plan", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want live-web lists, contact data, and content" }, pancake: { text: "Founders who want leads and conversations, not lists" } },
  ],
  closingTitle: "Start every morning with new leads.",
  closingLede: "Tell Pancake who you want to reach. It builds a Play to find them, and every lead arrives with why they fit.",
  faqs: [
    { q: "What is the main difference between Origami and Pancake?", a: "Origami is strong at live-web research, prospect lists, and enrichment, and it runs the plays you approve. Pancake runs Plays that search again every night. You tell it who you want to reach, it builds a Play to find them, and you approve every lead before anyone is contacted." },
    { q: "Does Origami create content?", a: "Yes, on Pro and up. Its Content mode drafts a post and a branded visual for your review. Pancake doesn't create content: it finds your buyers and starts the conversation." },
    { q: "Does Origami run outbound?", a: "Origami includes a multichannel sequencer, so it can support outbound execution after a list is created. Pancake ties outreach to the lead: each one arrives with one line on why they fit, and its personal message is written from that reason. A reply stops the sequence." },
    { q: "Which is better for prospect research?", a: "Origami may be the better fit for teams that primarily want natural-language searches across many live sources, data waterfalls, and flexible list building. Pancake is the better fit when you want a Play that keeps searching and starts each conversation for you." },
    { q: "How does pricing compare?", a: "As of October 2026, Origami starts free, then $49, $129 or $399 a month by credits and senders. Pancake's price does not move with how much you search: $99 a month per workspace, everything included. Check Origami's current pricing and limits before purchasing." },
    { q: "Who should choose Pancake instead of Origami?", a: "Choose Pancake when you want a Play for each audience you sell to, a reason on every lead, conversations started from your own account, and one price per workspace." },
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
