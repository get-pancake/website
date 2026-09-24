import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Lemlist vs Pancake: Outbound Platform vs AI GTM Team";
const description = "Compare Lemlist and Pancake: a multichannel sales-engagement platform your team operates versus an AI GTM team that finds buyers and starts conversations.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/lemlist-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/lemlist-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lemlist vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "lemlist-vs-pancake",
  competitor: "Lemlist",
  competitorInitial: "L",
  heroLede: "A sales platform your team operates versus agents that operate for you.",
  heroSummary: "Lemlist gives sales teams a large lead database, multichannel campaign controls, enrichment, and deliverability tooling. Pancake gives founders an AI GTM team: agents that watch buying signals, start conversations from your own account, write articles for AI search, and learn through one GTM Brain.",
  competitorBody: "A mature sales-engagement platform for building and managing outbound campaigns. Teams use its lead database, enrichment, sequencing, multichannel steps, deliverability tools, and integrations to control the sales workflow.",
  competitorChoose: "Choose it when a sales team wants deep campaign control.",
  pancakeBody: "An AI GTM team for founders who want the work done for them. It learns your business from your website, picks the people showing buying signals, and opens each conversation with a question about that signal. There are no sequences to build.",
  pancakeChoose: "Choose it when you want GTM outcomes without staffing the platform.",
  verdictTitle: "Choose Lemlist to equip a sales team. Choose Pancake to avoid building one.",
  verdictLede: "Lemlist is the stronger operator's toolkit. Pancake is designed for a founder who wants agents to own and run the motion.",
  competitorBestFit: "Lemlist is the better fit when SDRs or sales operators need granular sequences, channel breadth, email deliverability controls, a prospect database, and integrations around an established outbound process.",
  differencesLede: "The real question is who designs, operates, and improves the outbound system: your team or the agents.",
  differences: [
    {
      n: "01",
      title: "A platform to operate versus agents that operate",
      body: "Lemlist gives a sales team the data and controls to build outbound campaigns. Pancake's agents take the recurring work: they watch the signals, pick the people, and write and send the messages from your own account, every day.",
      angle: "Your team runs Lemlist. Pancake runs GTM for your team.",
    },
    {
      n: "02",
      title: "Campaign context versus a persistent GTM Brain",
      body: "Lemlist organizes leads, sequences, variables, and campaign performance. Pancake's GTM Brain holds what every agent writes from: your positioning, ideal customers, offers, proof, and objections, drawn from your website. It keeps learning from what works.",
      angle: "Campaign history versus shared GTM knowledge.",
    },
    {
      n: "03",
      title: "Outbound depth versus GTM breadth",
      body: "Lemlist goes deep on sales engagement across email, the professional network, calls, WhatsApp, and SMS. Pancake connects outreach with six kinds of buying signals and with articles built to show up in Google and AI answers.",
      angle: "Lemlist covers more outbound channels. Pancake covers more of GTM.",
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
      body: "Lemlist is built for sales organizations and agencies that want users inside a campaign platform. Pancake is built for founders and lean teams that want agents to supply the GTM capacity they would otherwise hire for.",
      angle: "More capacity for an existing team versus GTM without the team.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Equip teams to build and manage outbound", mark: "yes" }, pancake: { text: "Finds buyers and opens conversations for you", mark: "yes" } },
    { feature: "Operating model", competitor: { text: "Sales reps or operators run campaigns" }, pancake: { text: "Agents own recurring execution", mark: "yes" } },
    { feature: "Prospect data", competitor: { text: "Large B2B database and enrichment", mark: "yes" }, pancake: { text: "Leads picked daily from six kinds of buying signals", mark: "yes" } },
    { feature: "Outbound channels", competitor: { text: "Email, professional-network steps, calls, WhatsApp, and SMS", mark: "yes" }, pancake: { text: "Your own professional-network account" } },
    { feature: "Deliverability tooling", competitor: { text: "Dedicated hub and lemwarm", mark: "yes" }, pancake: { text: "—" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign and lead context" }, pancake: { text: "Your market and offers, learned from your website", mark: "yes" } },
    { feature: "AI-search content", competitor: { text: "Not the core product", mark: "no" }, pancake: { text: "Search articles written for you to approve", mark: "yes" } },
    { feature: "Pricing model", competitor: { text: "Tiered plans; cost depends on plan and team needs" }, pancake: { text: "$99/month flat, no tiers, no seats", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Sales teams and agencies wanting control" }, pancake: { text: "Founders wanting GTM operated for them" } },
  ],
  closingTitle: "Stop staffing the platform. Start running GTM.",
  closingLede: "Hand the outbound work to agents that find your buyers and open the conversations for you.",
  faqs: [
    { q: "What is the main difference between Lemlist and Pancake?", a: "Lemlist is a sales-engagement platform that gives sales teams data, sequencing, multichannel controls, deliverability tools, and integrations. Pancake is an AI GTM team that runs the outbound work itself, from picking leads off buying signals to opening each conversation from your own account." },
    { q: "Is Lemlist better for email deliverability?", a: "Lemlist has the more specialized deliverability toolkit, including lemwarm and a dedicated deliverability hub. It is the stronger choice when a team needs hands-on control over high-volume outbound infrastructure." },
    { q: "Which product supports more outbound channels?", a: "Lemlist publicly supports a broader set of outbound channels, including email, the professional network, calls, WhatsApp, and SMS. Pancake starts conversations from your own account on the professional network, and each first message asks about the signal that picked the lead." },
    { q: "Does Pancake replace a sales team?", a: "Pancake lets founders and lean teams run GTM without hiring an SDR or sales-operations team. Its agents find the buyers and open the conversations. You approve leads and articles, set the direction, and handle the conversations that need you." },
    { q: "How does pricing compare?", a: "Lemlist uses tiered plans whose current price and included channels depend on the package and team needs. Pancake has one plan with no tiers: $99 a month flat, after a 3-day free trial (card required). Check Lemlist's pricing page for current limits before deciding." },
    { q: "Can Lemlist and Pancake work together?", a: "They can run side by side. A sales team can keep Lemlist for email sequencing and deliverability while Pancake watches buying signals, opens conversations from the founder's own account, and writes articles for AI search." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.lemlist.com/", label: "Lemlist product page" },
    { href: "https://www.lemlist.com/pricing", label: "Lemlist pricing" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function LemlistVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
