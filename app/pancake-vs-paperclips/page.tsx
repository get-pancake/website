import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

const title = "Paperclip vs Pancake: AI Company Control Plane vs GTM Platform";
const description = "Compare Paperclip and Pancake: a self-hosted control plane for AI companies versus a managed GTM platform that finds your buyers and starts conversations.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${SITE_ORIGIN}/pancake-vs-paperclips` },
  openGraph: { type: "website", url: `${SITE_ORIGIN}/pancake-vs-paperclips`, title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Paperclip vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "pancake-vs-paperclips", competitor: "Paperclip", competitorInitial: "P",
  heroLede: "An AI company control plane versus a managed GTM platform.",
  heroSummary: "Paperclip lets technical founders create a company, set goals, hire AI agents into an org chart, assign budgets, and monitor work. Pancake arrives finished: a Brain researched from your website, and Plays that find your buyers and start the conversations.",
  competitorBody: "An open-source control plane for autonomous AI companies. You create goals, a CEO agent, reporting lines, tasks, heartbeats, budgets, and approvals, then connect and operate the agent runtimes yourself.",
  competitorChoose: "Choose it when you want to design and govern an AI organization.",
  pancakeBody: "A managed GTM platform. Pancake builds the Brain from your website, finds leads with a reason on each one, and starts the conversations from your own account.",
  pancakeChoose: "Choose it when you want GTM work completed without building the org chart.",
  verdictTitle: "Choose Paperclip to orchestrate agents. Choose Pancake to bring customers.",
  verdictLede: "Paperclip is broad infrastructure for a developer-operated AI company. Pancake is a GTM platform built for one job: bringing a small company its customers.",
  competitorBestFit: "Paperclip is the stronger fit for developers who want to self-host a multi-agent organization, choose agent adapters, define a hierarchy, control budgets, and apply the system across functions beyond GTM.",
  differencesLede: "Both use multiple agents and recurring work, but the buyer assembles Paperclip while Pancake arrives with the GTM function assembled.",
  differences: [
    { n: "01", title: "Control plane versus managed function", body: "Paperclip models companies, goals, agents, managers, tasks, and budgets. Pancake models your market: your ideal customer, personas, competitors, messaging, and the leads its Plays find.", angle: "Organize any agents or hire one finished GTM team." },
    { n: "02", title: "You design the organization", body: "Paperclip asks you to create the CEO, reporting tree, adapter configuration, prompts, goals, and budgets. Pancake asks for your website and who you want to reach. It turns them into a Brain and a Play.", angle: "Maximum organizational control versus fast time to outcome." },
    { n: "03", title: "General goals versus market learning", body: "Paperclip traces work through company goals and an org hierarchy. Pancake gives every lead one line on why they fit. Reject a lead with a reason, and Pancake suggests Brain changes you accept or ignore.", angle: "A company graph versus a market knowledge graph." },
    { n: "04", title: "Paperclip wins on breadth and governance", body: "Paperclip supports multiple companies, arbitrary agent roles, adapter choices, per-agent budgets, approvals, and board-level control. Pancake puts its controls where GTM needs them: you approve every lead and can pause any Play.", angle: "Choose Paperclip when the structure itself is the product." },
    { n: "05", title: "Open source versus subscription", body: "Paperclip is open source and self-hosted, with separate runtime, model, infrastructure, and maintenance costs. Pancake is one $99 monthly subscription that already covers the runtime, models, and hosting.", angle: "Build cost and control versus a predictable managed outcome." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Control plane for an autonomous AI company", mark: "yes" }, pancake: { text: "Managed GTM platform", mark: "yes" } },
    { feature: "Primary model", competitor: { text: "Companies, goals, org chart, tasks, and budgets" }, pancake: { text: "Brain, Plays, leads, and outreach" } },
    { feature: "Setup", competitor: { text: "Self-host and configure agents and adapters" }, pancake: { text: "Add your website, get a GTM Brain", mark: "yes" } },
    { feature: "Customization", competitor: { text: "Arbitrary roles, runtimes, hierarchy, and plugins", mark: "yes" }, pancake: { text: "Six ways a Play finds leads" } },
    { feature: "Outbound", competitor: { text: "You create the outreach agents and workflow" }, pancake: { text: "A warm-up, then up to three messages", mark: "yes" } },
    { feature: "Visibility", competitor: { text: "Monitor agent work across the org", mark: "yes" }, pancake: { text: "Every step of each search, and why people were set aside", mark: "yes" } },
    { feature: "Governance", competitor: { text: "Budgets, approvals, board control, and hierarchy", mark: "yes" }, pancake: { text: "You approve every lead and can pause any Play", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "Open source plus runtime, hosting, models, and labor" }, pancake: { text: "$99/month flat, all agents, no seats", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Developers building AI organizations" }, pancake: { text: "Small companies that need customers" } },
  ],
  closingTitle: "Hire the GTM team instead of designing one.",
  closingLede: "Tell Pancake who you want to reach. It builds a Play to find them, and every lead arrives with why they fit.",
  faqs: [
    { q: "What is the main difference between Paperclip and Pancake?", a: "Paperclip is an open-source control plane for creating and governing AI-agent organizations. Pancake is a managed GTM platform: instead of an org chart, you get Plays that already know how to find your buyers and start the conversations." },
    { q: "Which product is more customizable?", a: "Paperclip. Developers can define companies, roles, hierarchies, adapters, prompts, budgets, and plugins. Pancake's GTM jobs come ready-made, and you configure what matters for selling: who to reach, how to find them, and which leads you approve." },
    { q: "Is Paperclip free?", a: "Paperclip is open source, but users still pay for hosting, agent runtimes, models, data, and maintenance. Pancake has none of those line items: one flat $99 a month." },
    { q: "Which is faster to deploy for sales and marketing?", a: "Pancake. Its agents come built around finding customers, so setup is your website and a plain-English description of who you want to reach. Paperclip requires the user to design and configure those agents and workflows." },
    { q: "Can I use both?", a: "Yes. A technical team can use Paperclip as a broader company control plane and Pancake as the managed GTM function, though it should evaluate overlapping costs and responsibilities." },
  ],
  related: [{ href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://docs.paperclip.ing/guides/welcome/what-is-paperclip/", label: "Paperclip documentation" }, { href: "https://github.com/paperclipai/paperclip", label: "Paperclip repository" }, { href: `${SITE_ORIGIN}/`, label: "Pancake product page" }],
};

export default function PaperclipVsPancakePage() { return <GtmComparisonPage config={config} />; }
