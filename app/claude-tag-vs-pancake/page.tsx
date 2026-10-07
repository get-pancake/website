import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

const title = "Claude Tag vs Pancake: AI Teammate vs GTM Platform";
const description = "Compare Claude Tag and Pancake: a shared Claude teammate in Slack versus a GTM platform that finds buyers, starts conversations, and works from Claude.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/claude-tag-vs-pancake` },
  openGraph: { type: "website", url: `${SITE_ORIGIN}/claude-tag-vs-pancake`, title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Claude Tag vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "claude-tag-vs-pancake",
  competitor: "Claude Tag",
  competitorInitial: "C",
  heroLede: "A shared AI teammate versus a GTM platform that finds your buyers.",
  heroSummary: "Claude Tag lets a team delegate broad work to Claude inside Slack, with channel context, connected tools, asynchronous tasks, and optional ambient initiative. Pancake finds the people you want to reach, tells you why each one fits, and starts the conversations. Run it all from Claude, ChatGPT, or Codex.",
  competitorBody: "Anthropic's shared Claude teammate in Slack. Team members tag Claude into work, grant selected channel and tool access, and let it complete asynchronous tasks. Ambient behavior can surface updates and follow up proactively.",
  competitorChoose: "Choose it when your team wants Claude across many collaborative jobs.",
  pancakeBody: "A GTM platform with the jobs already built. Tell it who you want to reach, and it builds a Play to find them. Every lead arrives with why they fit and gets a personal message in your voice.",
  pancakeChoose: "Choose it when you want a GTM function, not another teammate to delegate to.",
  verdictTitle: "Choose Claude Tag for flexible team delegation. Choose Pancake to find customers.",
  verdictLede: "Claude Tag is broader and native to Claude and Slack. Pancake is built for one job, customers, and does the recurring work that brings them in.",
  competitorBestFit: "Claude Tag is the better fit for Enterprise or Team customers that already work in Slack and want one governed Claude teammate across engineering, support, analytics, and other collaborative tasks.",
  differencesLede: "Both products take initiative. Claude Tag spreads it across your team's work. Pancake aims all of it at your pipeline.",
  differences: [
    { n: "01", title: "General delegation versus packaged GTM expertise", body: "Claude Tag can plan and complete many kinds of work from a channel request. Pancake arrives with the GTM jobs built: you describe who to reach, you approve every lead, and the outreach runs from your own account.", angle: "A capable teammate versus a function already assembled." },
    { n: "02", title: "Channel context versus a GTM Brain", body: "Claude learns from the channels and data sources an administrator permits. Pancake researches your company from your website and keeps a Brain of your ideal customer, personas, competitors, messaging, and voice. Every new Play starts from it.", angle: "Workplace context versus purpose-built market memory." },
    { n: "03", title: "Delegated tasks versus Plays that find buyers", body: "Claude Tag handles tagged and planned tasks and can proactively follow up. Pancake runs Plays: each search discovers, enriches, and qualifies leads. Every lead arrives with one line on why they fit.", angle: "The unit of work is a task. The unit of value is a Play." },
    { n: "04", title: "Claude Tag wins on collaborative breadth", body: "Claude Tag is strong when many team members need the same Claude across coding, support, metrics, research, and internal work, with administrator permissions and spend controls. Pancake is built for go-to-market, so it sits next to that collaboration layer instead of replacing it.", angle: "Choose the general teammate when the whole team shares the workload." },
    { n: "05", title: "Different buying models", body: "Claude Tag is available in beta to eligible Claude Enterprise and Team customers and uses organization spend controls. Pancake is a standalone subscription: $99 a month flat, every agent included, no seats.", angle: "An extension of a Claude workspace versus a complete GTM subscription." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Shared Claude teammate for broad work", mark: "yes" }, pancake: { text: "GTM platform for customer acquisition", mark: "yes" } },
    { feature: "Interface", competitor: { text: "Slack", mark: "yes" }, pancake: { text: "Pancake app, lead approvals in Slack, and Claude, ChatGPT, or Codex via MCP", mark: "yes" } },
    { feature: "Initiative", competitor: { text: "Ambient updates and follow-up when enabled", mark: "yes" }, pancake: { text: "Plays that find leads, each with why they fit", mark: "yes" } },
    { feature: "Memory", competitor: { text: "Permitted channel and tool context", mark: "yes" }, pancake: { text: "A Brain researched from your website; every Play starts from it", mark: "yes" } },
    { feature: "Breadth", competitor: { text: "Engineering, support, analytics, research, and more", mark: "yes" }, pancake: { text: "Focused on GTM" } },
    { feature: "Outbound system", competitor: { text: "Can complete delegated workflows" }, pancake: { text: "A warm-up, then up to three messages under your name", mark: "yes" } },
    { feature: "Availability", competitor: { text: "Beta for eligible Enterprise and Team customers" }, pancake: { text: "$99/month flat, 3-day free trial", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want Claude across many jobs" }, pancake: { text: "Small B2B companies that need pipeline" } },
  ],
  closingTitle: "Give your go-to-market a team of its own.",
  closingLede: "Tell Pancake who you want to reach. It builds a Play to find them, and every lead arrives with why they fit.",
  faqs: [
    { q: "What is the main difference between Claude Tag and Pancake?", a: "Claude Tag is a shared Claude teammate in Slack for broad collaborative work. Pancake is a GTM platform: you tell it who you want to reach, it builds a Play to find them, and it starts conversations from your own account." },
    { q: "Does Claude Tag work proactively?", a: "Yes. Anthropic says ambient behavior can proactively surface relevant information and follow up on unresolved work. Pancake is proactive on GTM: it searches every night and posts each new lead to Slack for your approval." },
    { q: "Is Pancake cheaper than Claude Tag?", a: "They are sold differently, so a percentage comparison would be misleading. Claude Tag is attached to eligible Claude Enterprise and Team plans with spend controls. Pancake has a 3-day free trial (card required), then one price for every agent: $99 a month." },
    { q: "Which is better for a small company without a GTM team?", a: "Pancake. Its jobs and Brain are built around winning customers, so you don't design the workflow yourself. You describe who you want to reach in plain English, and Pancake builds the Play with you. Claude Tag is stronger when an existing team wants a flexible Claude collaborator across many functions." },
    { q: "Can I use both?", a: "Yes. Claude Tag covers internal work in Slack while Pancake runs your go-to-market. You can also run Pancake from Claude, ChatGPT, or Codex through its MCP server: create and run Plays, review leads, add them to campaigns, and edit their messages." },
  ],
  related: [{ href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://www.anthropic.com/news/introducing-claude-tag", label: "Anthropic's Claude Tag announcement" }, { href: `${SITE_ORIGIN}/`, label: "Pancake product page" }],
};

export default function ClaudeTagVsPancakePage() { return <GtmComparisonPage config={config} />; }
