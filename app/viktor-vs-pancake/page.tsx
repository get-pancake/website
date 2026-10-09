import type { Metadata } from "next";

import {
  comparisonViewport,
  GtmComparisonPage,
  type GtmComparisonConfig,
} from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";
import { social } from "@/lib/social-meta";

const title = "Viktor vs Pancake: General AI Employee vs GTM Platform";
const description = "Compare Viktor and Pancake: a broad AI employee in Slack and Teams versus a GTM platform that finds your buyers and starts conversations from your own account.";

export const viewport = comparisonViewport;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/viktor-vs-pancake` },
  // Share card via lib/social-meta.ts (2026-10-07, audit 8.1/8.4): the shared
  // homepage card, so the alt is its printed text, not this page's name.
  ...social({ path: "/viktor-vs-pancake", title, description }),
};

const config: GtmComparisonConfig = {
  slug: "viktor-vs-pancake",
  competitor: "Viktor",
  competitorInitial: "V",
  heroLede: "A general AI employee versus a GTM platform built to bring you customers.",
  heroSummary: "Viktor works across many company functions from Slack or Microsoft Teams and connects to thousands of tools. Pancake builds a Play for each audience you sell to, finds the people, and starts the conversations from your own account, all from one Brain.",
  competitorBody: "A shared AI employee that lives in Slack and Microsoft Teams. Viktor completes broad tasks across reporting, campaigns, operations, engineering, finance, and internal tools, with 3,200+ advertised integrations and scheduled workflows.",
  competitorChoose: "Choose it when one generalist should work across the company.",
  pancakeBody: "A GTM platform for founders and small B2B companies. Its Plays find leads eight ways, and every lead arrives with why they fit. Once you approve a lead, Pancake opens the conversation from your own account.",
  pancakeChoose: "Choose it when the job is bringing in customers.",
  verdictTitle: "Choose Viktor for breadth. Choose Pancake for GTM depth.",
  verdictLede: "Both products do real work on a schedule. The question is whether you need a general AI employee or Plays that keep working on your pipeline.",
  competitorBestFit: "Viktor is the stronger fit when a team wants one shared AI employee inside Slack or Teams to handle varied work across finance, engineering, operations, reporting, and marketing through a broad integration catalog.",
  differencesLede: "Viktor spreads one AI employee across the whole company. Pancake puts every Play on one outcome: customers.",
  differences: [
    { n: "01", title: "Generalist breadth versus GTM specialization", body: "Viktor accepts a wide range of assignments across the company. Every Pancake Play works toward customers: it finds one audience, qualifies each lead, and starts the conversation.", angle: "Pick the surface area you need, not the largest feature list." },
    { n: "02", title: "Shared workspace memory versus a structured GTM Brain", body: "Viktor remembers company context and prior work. Pancake reads your website and builds a Brain of your ideal customer, personas, competitors, messaging, and voice. Every new Play starts from it.", angle: "One memory, built for winning customers." },
    { n: "03", title: "Tasks across tools versus Plays that find buyers", body: "Viktor can build reports, update tools, create apps, and schedule recurring work. Pancake runs Plays. Each search discovers, enriches, and qualifies leads. Once you approve a lead, Pancake starts the conversation.", angle: "Breadth of tasks versus depth of outcome." },
    { n: "04", title: "Viktor wins on interface and integration breadth", body: "Viktor's Slack and Teams presence, fast install, and 3,200+ advertised integrations make it compelling for organizations that want a shared employee in their existing communication layer. New Pancake leads arrive in Slack for your approval, and you can run it all from Claude, Claude Code or Codex.", angle: "Choose Viktor when the collaboration surface matters most." },
    { n: "05", title: "Different entry prices", body: "Viktor publicly starts at $50 per month after free credits. Pancake is $99 a month per workspace, with everything included, no seats, and no usage billing. Compare what each subscription gets done every month.", angle: "A lower generalist entry price versus one plan built for GTM." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "General AI employee across company functions", mark: "yes" }, pancake: { text: "GTM platform that finds buyers and starts conversations", mark: "yes" } },
    { feature: "Primary interface", competitor: { text: "Slack and Microsoft Teams", mark: "yes" }, pancake: { text: "Pancake app, Slack, email, and Claude, Claude Code or Codex via MCP", mark: "yes" } },
    { feature: "Tool breadth", competitor: { text: "3,200+ advertised integrations", mark: "yes" }, pancake: { text: "Focused on GTM" } },
    { feature: "Recurring work", competitor: { text: "Scheduled tasks and proactive suggestions", mark: "yes" }, pancake: { text: "New leads that keep coming, each with why they fit", mark: "yes" } },
    { feature: "GTM Brain", competitor: { text: "Shared company memory" }, pancake: { text: "Ideal customer, personas, competitors, messaging, and voice, researched from your website", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Can manage workflows across connected tools" }, pancake: { text: "A warm-up, then up to three messages under your name", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$50/month after free credits", mark: "yes" }, pancake: { text: "$99/month per workspace, one plan", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams wanting one broad shared AI employee" }, pancake: { text: "Founders and small B2B teams that need customers" } },
  ],
  closingTitle: "Put Pancake on your pipeline.",
  closingLede: "Add your website. Tell Pancake who you want to reach. It finds them and starts the conversations.",
  faqs: [
    { q: "What is the main difference between Viktor and Pancake?", a: "Viktor is a broad AI employee that works across company functions from Slack or Teams. Pancake is a GTM platform: it builds a Play for each audience you sell to, brings you leads with why they fit, and opens conversations from your own account." },
    { q: "Does Viktor work without prompting?", a: "Yes. Viktor supports scheduled tasks and proactive automations, so it is not prompt-only. Pancake works without prompting too: each Play keeps searching on its own, and every new lead arrives with why it fits." },
    { q: "Which product has more integrations?", a: "Viktor advertises more than 3,200 integrations and wins on breadth. Pancake connects where GTM happens: your own accounts for outreach, Slack for lead approvals, and Claude, Claude Code or Codex through its MCP server." },
    { q: "Which is better for outreach?", a: "Pancake. Finding buyers and starting conversations is its core work, and every Play draws on the same Brain. Viktor fits better when outreach is a small part of a company-wide workload." },
    { q: "How does pricing compare?", a: "At the time of review, Viktor advertised paid plans from $50 per month after free credits. Pancake starts with a 3-day free trial (card required), then costs $99 a month per workspace. Confirm Viktor's current limits before buying." },
  ],
  related: [{ href: "/claude-tag-vs-pancake", label: "Claude Tag vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://viktor.com/", label: "Viktor product page" }, { href: "https://viktor.com/docs/getting-started", label: "Viktor documentation" }, { href: `${SITE_ORIGIN}/`, label: "Pancake product page" }],
};

export default function ViktorVsPancakePage() { return <GtmComparisonPage config={config} />; }
