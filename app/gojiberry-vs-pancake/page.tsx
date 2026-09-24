import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Gojiberry vs Pancake: Outreach Agent vs AI GTM Team";
const description = "Compare Gojiberry and Pancake: focused AI prospecting and outreach versus an AI GTM team that finds buyers, starts conversations, and writes for AI search.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/gojiberry-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/gojiberry-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Gojiberry vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "gojiberry-vs-pancake",
  competitor: "Gojiberry",
  competitorInitial: "G",
  heroLede: "A focused outreach agent versus a full AI GTM team.",
  heroSummary: "Gojiberry finds high-intent prospects and automates email and social outreach. Pancake learns your positioning from your website, watches six kinds of buying signals, starts conversations from your own account, and writes articles for Google and AI answers.",
  competitorBody: "An AI prospecting product focused on identifying high-intent leads, scoring them, and running multichannel email and social outreach. It offers approval controls, a unified inbox, and agents that adapt campaigns over time.",
  competitorChoose: "Choose it when your main job is outbound prospecting.",
  pancakeBody: "An AI GTM team built around one GTM Brain. Its agents share your positioning, buyers, offers, and proof, pick the people behind each buying signal, open the conversation with a question about that signal, and write articles built to show up in search.",
  pancakeChoose: "Choose it when every GTM motion should learn and operate together.",
  verdictTitle: "Choose Gojiberry for focused outbound. Choose Pancake for a whole AI GTM team.",
  verdictLede: "Both can help a lean team reach prospects. The deciding question is whether you need an outreach specialist or a GTM team whose every agent works from one Brain.",
  competitorBestFit: "Gojiberry is the cleaner fit if your immediate bottleneck is prospecting and personalized email or social outreach, and you want an inbox and approval controls built around that workflow.",
  differencesLede: "The products overlap in outbound. They differ in what learns, what executes, and how far the system carries your GTM.",
  differences: [
    {
      n: "01",
      title: "One Brain for every GTM agent",
      body: "Gojiberry learns from prospecting and outreach activity. Pancake's core is the GTM Brain: your positioning, ideal customers, offers, proof, and objections, learned from your website. Every agent works from it.",
      angle: "Outreach learns a campaign. Pancake's whole GTM learns the market.",
    },
    {
      n: "02",
      title: "Multiple motions, one strategy",
      body: "Gojiberry concentrates on finding prospects and contacting them. Pancake runs buying-signal monitoring, daily leads, outreach, and articles built for Google and AI answers from the same strategy.",
      angle: "One outbound lane versus a connected GTM team.",
    },
    {
      n: "03",
      title: "From signal to article",
      body: "Pancake's articles come from the same Brain that shapes its outreach, so a buyer meets the same positioning in a message and in an article. Gojiberry is not positioned as an AI-search content product.",
      angle: "One Brain behind every message and every article.",
    },
    {
      n: "04",
      title: "Focused workflow versus compounding context",
      body: "Gojiberry's unified inbox and approval modes make outbound execution easy to supervise. Pancake keeps you in control with approvals on leads and articles, and every agent draws on the same Brain.",
      angle: "Every result sharpens the next lead and the next message.",
    },
    {
      n: "05",
      title: "Similar entry price, different scope",
      body: "Gojiberry publicly lists a $99 monthly starting point for focused prospecting and outreach agents. Pancake is $99 a month flat for the whole AI GTM team: signals, leads, outreach, articles, and the shared Brain.",
      angle: "Compare the motion you automate, not only the monthly price.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Prospecting and multichannel outreach", mark: "yes" }, pancake: { text: "AI GTM team: signals, leads, outreach, and articles", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign learning centered on outreach" }, pancake: { text: "Positioning, buyers, offers, proof, and objections, shared by every agent", mark: "yes" } },
    { feature: "High-intent leads", competitor: { text: "Finds and scores high-intent prospects", mark: "yes" }, pancake: { text: "Six kinds of buying signals, new leads every morning", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "Email and social outreach with approval controls", mark: "yes" }, pancake: { text: "From your own account, first message tied to the signal", mark: "yes" } },
    { feature: "Unified inbox", competitor: { text: "Built in", mark: "yes" }, pancake: { text: "—" } },
    { feature: "AI-search content", competitor: { text: "Not positioned as a publishing product", mark: "no" }, pancake: { text: "Articles written to show up in AI answers", mark: "yes" } },
    { feature: "Approvals", competitor: { text: "Approval modes on outreach", mark: "yes" }, pancake: { text: "Approvals on leads and articles", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$99/month", mark: "yes" }, pancake: { text: "$99/month flat for the whole team", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want a focused outbound agent" }, pancake: { text: "Founders who want a whole GTM team working from one Brain" } },
  ],
  closingTitle: "Give every GTM agent the same Brain.",
  closingLede: "Pancake learns your business from your website, and every agent, from signals to articles, works from what it learned.",
  faqs: [
    { q: "What is the main difference between Gojiberry and Pancake?", a: "Gojiberry is focused on AI prospecting and multichannel outreach. Pancake is an AI GTM team built around a shared GTM Brain: what it learns about your buyers shapes the leads it picks, the messages it opens with, and the articles it writes." },
    { q: "Do both products find high-intent leads?", a: "Yes. Gojiberry describes high-intent lead discovery and scoring as a core part of its prospecting agent. Pancake watches six kinds of buying signals (keywords, competitors, influencers, your own brand, hiring, and tech stack) and brings new leads every morning, each with the reason it was picked." },
    { q: "Which product is better for a pure outbound motion?", a: "Gojiberry is a strong fit when you mainly need outbound prospecting, an integrated inbox, and explicit approval controls. Pancake is the better fit when outreach should draw on the same Brain as your buying signals and AI-search articles." },
    { q: "Do Gojiberry and Pancake cost the same?", a: "At the time of review, Gojiberry publicly listed $99 a month as its starting point. Pancake's $99 a month covers every agent, with no seat or usage fees on top. Check Gojiberry's current plans and allowances before buying." },
    { q: "Can Pancake write content as well as run outreach?", a: "Yes. Pancake writes articles built to show up in Google and in AI answers, and you approve each one. Its other agents watch signals and run outreach from the same GTM Brain." },
    { q: "Can I use Gojiberry and Pancake together?", a: "Yes. A team could keep Gojiberry for email outreach and use Pancake for buying signals, outreach from your own account, and AI-search articles. Decide first whether you want one GTM team or separate specialist tools." },
  ],
  related: [
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://gojiberry.ai/", label: "Gojiberry product page" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function GojiberryVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
