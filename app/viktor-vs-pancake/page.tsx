import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Viktor vs Pancake: General AI Employee vs AI GTM Team";
const description = "Compare Viktor and Pancake: a broad AI employee in Slack and Teams versus an AI GTM team that finds buyers, starts conversations, and writes for AI search.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/viktor-vs-pancake" },
  openGraph: { type: "website", url: "https://getpancake.ai/viktor-vs-pancake", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Viktor vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "viktor-vs-pancake",
  competitor: "Viktor",
  competitorInitial: "V",
  heroLede: "A general AI employee versus an AI GTM team built to bring you customers.",
  heroSummary: "Viktor works across many company functions from Slack or Microsoft Teams and connects to thousands of tools. Pancake finds the people showing buying signals, starts the conversations from your own account, and writes articles for Google and AI search, all from one GTM Brain.",
  competitorBody: "A shared AI employee that lives in Slack and Microsoft Teams. Viktor completes broad tasks across reporting, campaigns, operations, engineering, finance, and internal tools, with 3,200+ advertised integrations and scheduled workflows.",
  competitorChoose: "Choose it when one generalist should work across the company.",
  pancakeBody: "An AI GTM team for founders and small B2B companies. Its agents watch six kinds of buying signals, bring you new leads every morning with the reason each was picked, open the conversation from your own account, and write articles built to show up in Google and AI answers.",
  pancakeChoose: "Choose it when the job is bringing in customers.",
  verdictTitle: "Choose Viktor for breadth. Choose Pancake for GTM depth.",
  verdictLede: "Both products do real work on a schedule. The question is whether you need a general AI employee or a GTM team whose agents all work on your pipeline.",
  competitorBestFit: "Viktor is the stronger fit when a team wants one shared AI employee inside Slack or Teams to handle varied work across finance, engineering, operations, reporting, and marketing through a broad integration catalog.",
  differencesLede: "Viktor spreads one AI employee across the whole company. Pancake puts a full team of agents on one outcome: customers.",
  differences: [
    { n: "01", title: "Generalist breadth versus GTM specialization", body: "Viktor accepts a wide range of assignments across the company. Every Pancake agent works toward customers: watching buying signals, picking the people behind them, starting conversations, and writing articles built to be found in search.", angle: "Pick the surface area you need, not the largest feature list." },
    { n: "02", title: "Shared workspace memory versus a structured GTM Brain", body: "Viktor remembers company context and prior work. Pancake reads your website and builds a GTM Brain of your positioning, ideal customers, offers, proof, and objections. Every agent works from it, and it gets sharper with every result.", angle: "One memory, built for winning customers." },
    { n: "03", title: "Tasks across tools versus a daily acquisition loop", body: "Viktor can build reports, update tools, create apps, and schedule recurring work. Pancake runs one loop every day: spot a buying signal, pick the person behind it, start the conversation, and learn from what works.", angle: "Breadth of tasks versus depth of outcome." },
    { n: "04", title: "Viktor wins on interface and integration breadth", body: "Viktor's Slack and Teams presence, fast install, and 3,200+ advertised integrations make it compelling for organizations that want a shared employee in their existing communication layer. Pancake posts each new lead to Slack for your approval and works from Claude, ChatGPT, or Codex through its MCP server.", angle: "Choose Viktor when the collaboration surface matters most." },
    { n: "05", title: "Different entry prices", body: "Viktor publicly starts at $50 per month after free credits. Pancake is $99 a month flat, with every agent included, no seats, and no usage billing. Compare what each subscription gets done every month.", angle: "A lower generalist entry price versus a full GTM team at one flat price." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "General AI employee across company functions", mark: "yes" }, pancake: { text: "AI GTM team that finds buyers and starts conversations", mark: "yes" } },
    { feature: "Primary interface", competitor: { text: "Slack and Microsoft Teams", mark: "yes" }, pancake: { text: "Pancake app, Slack, and Claude, ChatGPT, or Codex via MCP", mark: "yes" } },
    { feature: "Tool breadth", competitor: { text: "3,200+ advertised integrations", mark: "yes" }, pancake: { text: "Focused on GTM" } },
    { feature: "Recurring work", competitor: { text: "Scheduled tasks and proactive suggestions", mark: "yes" }, pancake: { text: "New leads every morning from six kinds of buying signals", mark: "yes" } },
    { feature: "GTM Brain", competitor: { text: "Shared company memory" }, pancake: { text: "Positioning, buyers, offers, proof, and objections, learned from your website", mark: "yes" } },
    { feature: "AI-search articles", competitor: { text: "Can complete broad content tasks" }, pancake: { text: "Writes articles for Google and AI answers that you approve", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Can manage workflows across connected tools" }, pancake: { text: "Profile visit, like, invite, then up to three messages from your account", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$50/month after free credits", mark: "yes" }, pancake: { text: "$99/month flat, every agent included", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams wanting one broad shared AI employee" }, pancake: { text: "Founders and small B2B teams that need customers" } },
  ],
  closingTitle: "Put an AI GTM team on your pipeline.",
  closingLede: "Add your website. Pancake learns who buys from you, watches for buying signals, and starts the conversations.",
  faqs: [
    { q: "What is the main difference between Viktor and Pancake?", a: "Viktor is a broad AI employee that works across company functions from Slack or Teams. Pancake is an AI GTM team: its agents turn buying signals into daily leads, open conversations from your own account, and write articles for AI search." },
    { q: "Does Viktor work without prompting?", a: "Yes. Viktor supports scheduled tasks and proactive automations, so it is not prompt-only. Pancake works without prompting too: it watches your buying signals and has new leads waiting each morning, each with the reason it was picked." },
    { q: "Which product has more integrations?", a: "Viktor advertises more than 3,200 integrations and wins on breadth. Pancake connects where GTM happens: your own account for outreach, Slack for lead approvals, and Claude, ChatGPT, or Codex through its MCP server." },
    { q: "Which is better for outreach and AI search?", a: "Pancake. Outreach and articles for AI search are its core work, and both draw on the same GTM Brain. Viktor fits better when those tasks are a small part of a company-wide workload." },
    { q: "How does pricing compare?", a: "At the time of review, Viktor advertised paid plans from $50 per month after free credits. Pancake starts with a 3-day free trial (card required), then costs one flat $99 a month. Confirm Viktor's current limits before buying." },
  ],
  related: [{ href: "/claude-tag-vs-pancake", label: "Claude Tag vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://viktor.com/", label: "Viktor product page" }, { href: "https://viktor.com/docs/getting-started", label: "Viktor documentation" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function ViktorVsPancakePage() { return <GtmComparisonPage config={config} />; }
