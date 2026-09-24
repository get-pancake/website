import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Claude Tag vs Pancake: AI Teammate vs AI GTM Team";
const description = "Compare Claude Tag and Pancake: a shared Claude teammate in Slack versus an AI GTM team that finds buyers, starts conversations, and works from Claude.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/claude-tag-vs-pancake" },
  openGraph: { type: "website", url: "https://getpancake.ai/claude-tag-vs-pancake", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Claude Tag vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "claude-tag-vs-pancake",
  competitor: "Claude Tag",
  competitorInitial: "C",
  heroLede: "A shared AI teammate versus an AI GTM team that finds your buyers.",
  heroSummary: "Claude Tag lets a team delegate broad work to Claude inside Slack, with channel context, connected tools, asynchronous tasks, and optional ambient initiative. Pancake's agents find the people showing buying signals, start the conversations, and write for AI search. You can steer them from Claude through Pancake's MCP server.",
  competitorBody: "Anthropic's shared Claude teammate in Slack. Team members tag Claude into work, grant selected channel and tool access, and let it complete asynchronous tasks. Ambient behavior can surface updates and follow up proactively.",
  competitorChoose: "Choose it when your team wants Claude across many collaborative jobs.",
  pancakeBody: "An AI GTM team with the jobs already built. It learns your positioning, buyers, offers, proof, and objections from your website, watches six kinds of buying signals, and opens each conversation with a question tied to the signal.",
  pancakeChoose: "Choose it when you want a GTM function, not another teammate to delegate to.",
  verdictTitle: "Choose Claude Tag for flexible team delegation. Choose Pancake to find customers.",
  verdictLede: "Claude Tag is broader and native to Claude and Slack. Pancake is built for one job, customers, and does the recurring work that brings them in.",
  competitorBestFit: "Claude Tag is the better fit for Enterprise or Team customers that already work in Slack and want one governed Claude teammate across engineering, support, analytics, and other collaborative tasks.",
  differencesLede: "Both products take initiative. Claude Tag spreads it across your team's work. Pancake aims all of it at your pipeline.",
  differences: [
    { n: "01", title: "General delegation versus packaged GTM expertise", body: "Claude Tag can plan and complete many kinds of work from a channel request. Pancake arrives with the GTM jobs built: you pick the signals to watch, approve the leads, and the outreach runs from your own account.", angle: "A capable teammate versus a function already assembled." },
    { n: "02", title: "Channel context versus a GTM Brain", body: "Claude learns from the channels and data sources an administrator permits. Pancake builds its GTM Brain from your website, covering positioning, ideal customers, offers, proof, and objections, and every agent writes from it.", angle: "Workplace context versus purpose-built market memory." },
    { n: "03", title: "Delegated tasks versus a recurring acquisition loop", body: "Claude Tag handles tagged and planned tasks and can proactively follow up. Pancake works a daily loop: new leads each morning, each with the signal behind it, then a first message that asks about that signal instead of pitching.", angle: "The unit of work is a task. The unit of value is the GTM loop." },
    { n: "04", title: "Claude Tag wins on collaborative breadth", body: "Claude Tag is strong when many team members need the same Claude across coding, support, metrics, research, and internal work, with administrator permissions and spend controls. Pancake is built for go-to-market, so it sits next to that collaboration layer instead of replacing it.", angle: "Choose the general teammate when the whole team shares the workload." },
    { n: "05", title: "Different buying models", body: "Claude Tag is available in beta to eligible Claude Enterprise and Team customers and uses organization spend controls. Pancake is a standalone subscription: $99 a month flat, every agent included, no seats.", angle: "An extension of a Claude workspace versus a complete GTM subscription." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Shared Claude teammate for broad work", mark: "yes" }, pancake: { text: "AI GTM team for customer acquisition", mark: "yes" } },
    { feature: "Interface", competitor: { text: "Slack", mark: "yes" }, pancake: { text: "Pancake app, Slack lead approvals, and Claude via MCP", mark: "yes" } },
    { feature: "Initiative", competitor: { text: "Ambient updates and follow-up when enabled", mark: "yes" }, pancake: { text: "New leads every morning, each with its buying signal", mark: "yes" } },
    { feature: "Memory", competitor: { text: "Permitted channel and tool context", mark: "yes" }, pancake: { text: "GTM Brain learned from your website, shared by every agent", mark: "yes" } },
    { feature: "Breadth", competitor: { text: "Engineering, support, analytics, research, and more", mark: "yes" }, pancake: { text: "Focused on GTM" } },
    { feature: "AI-search articles", competitor: { text: "Can assist through connected tools" }, pancake: { text: "Articles for Google and AI search, approved by you", mark: "yes" } },
    { feature: "Outbound system", competitor: { text: "Can complete delegated workflows" }, pancake: { text: "Visit, like, invite, then up to three messages from your account", mark: "yes" } },
    { feature: "Availability", competitor: { text: "Beta for eligible Enterprise and Team customers" }, pancake: { text: "$99/month flat, 3-day free trial", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want Claude across many jobs" }, pancake: { text: "Small B2B companies that need pipeline" } },
  ],
  closingTitle: "Give your go-to-market a team of its own.",
  closingLede: "Pick the signals that matter to you. Pancake's agents do the searching and open the conversations.",
  faqs: [
    { q: "What is the main difference between Claude Tag and Pancake?", a: "Claude Tag is a shared Claude teammate in Slack for broad collaborative work. Pancake is an AI GTM team: its agents watch buying signals, bring you new leads every morning, and start conversations from your own account." },
    { q: "Does Claude Tag work proactively?", a: "Yes. Anthropic says ambient behavior can proactively surface relevant information and follow up on unresolved work. Pancake is proactive on GTM: it watches your signals and posts each new lead to Slack for your approval." },
    { q: "Is Pancake cheaper than Claude Tag?", a: "They are sold differently, so a percentage comparison would be misleading. Claude Tag is attached to eligible Claude Enterprise and Team plans with spend controls. Pancake has a 3-day free trial (card required), then one price for every agent: $99 a month." },
    { q: "Which is better for a small company without a GTM team?", a: "Pancake. Its jobs and GTM Brain are built around winning customers, so you don't design the workflow yourself. Claude Tag is stronger when an existing team wants a flexible Claude collaborator across many functions." },
    { q: "Can I use both?", a: "Yes. Claude Tag covers internal work in Slack while Pancake runs your go-to-market. You can also connect Claude, ChatGPT, or Codex to Pancake through its MCP server to review leads, adjust signals, and start outreach from a conversation." },
  ],
  related: [{ href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://www.anthropic.com/news/introducing-claude-tag", label: "Anthropic's Claude Tag announcement" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function ClaudeTagVsPancakePage() { return <GtmComparisonPage config={config} />; }
