import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

const title = "OpenClaw vs Pancake: Agent Runtime vs Managed AI GTM Team";
const description = "Compare OpenClaw and Pancake: an open-source agent runtime you configure versus a managed AI GTM team that finds leads, runs outreach, and writes articles.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${SITE_ORIGIN}/openclaw-vs-pancake` },
  openGraph: { type: "website", url: `${SITE_ORIGIN}/openclaw-vs-pancake`, title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OpenClaw vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "openclaw-vs-pancake", competitor: "OpenClaw", competitorInitial: "O",
  heroLede: "An agent runtime you assemble versus a GTM team you hire.",
  heroSummary: "OpenClaw is open-source infrastructure for configuring agents, models, tools, channels, memory, and schedules. Pancake is a managed AI GTM team: its agents watch buying signals, bring you new leads every morning, start the conversations, and write articles for AI search, all from one GTM Brain.",
  competitorBody: "An open-source agent runtime for technical users who want control over providers, models, channels, tools, skills, workspaces, schedules, and deployment. You decide what the agent should do and maintain the system that does it.",
  competitorChoose: "Choose it when you want to build and own the agent stack.",
  pancakeBody: "A finished AI GTM team for founders and small B2B companies. Add your website and Pancake builds the GTM Brain, runs the agents, and starts finding your buyers. There is no runtime, model, or server to manage.",
  pancakeChoose: "Choose it when you want customer acquisition running, not an agent project.",
  verdictTitle: "Choose OpenClaw to build. Choose Pancake to run GTM.",
  verdictLede: "OpenClaw offers flexibility and infrastructure ownership. Pancake packages the GTM expertise, runs it for you, and aims every agent at finding customers.",
  competitorBestFit: "OpenClaw is the better fit for developers who want to self-host, select models and runtimes, create custom skills, control channels, and maintain an agent system for use cases beyond GTM.",
  differencesLede: "The useful comparison is infrastructure versus application, not two versions of the same product.",
  differences: [
    { n: "01", title: "Runtime versus finished job", body: "OpenClaw supplies primitives for an agent loop and its environment. Pancake supplies a GTM Brain and ready-made jobs: watch the signals, pick the leads, start the conversations, write the articles.", angle: "The engine versus the GTM vehicle." },
    { n: "02", title: "You configure the expertise", body: "With OpenClaw, you write or install the instructions, skills, schedules, integrations, and policies. Pancake arrives with the GTM playbook built in, down to the first message: one light question about the signal, no pitch.", angle: "Maximum control versus an opinionated operating system." },
    { n: "03", title: "General memory versus a GTM Brain", body: "OpenClaw workspaces can persist instructions and memory files. Pancake learns your positioning, ideal customers, offers, proof, and objections from your website, and every agent shares that memory.", angle: "A flexible workspace versus a purpose-built knowledge graph." },
    { n: "04", title: "OpenClaw wins on extensibility", body: "OpenClaw supports multiple model providers, agent runtimes, messaging channels, plugins, and custom code. Pancake is built for go-to-market, and you can steer it from Claude, ChatGPT, or Codex through its MCP server.", angle: "Choose OpenClaw when the unique workflow is the point." },
    { n: "05", title: "Free software still has an operating cost", body: "OpenClaw is open source, but hosting, model usage, data providers, maintenance, debugging, and your time remain. Pancake is $99 a month flat, every agent included, with no model or hosting bills on top.", angle: "Compare total ownership cost with the cost of a finished outcome." },
  ],
  rows: [
    { feature: "Product layer", competitor: { text: "Open-source agent runtime", mark: "yes" }, pancake: { text: "Ready-to-run AI GTM team", mark: "yes" } },
    { feature: "Setup", competitor: { text: "Install, configure, connect, and maintain" }, pancake: { text: "Your website URL, nothing to install", mark: "yes" } },
    { feature: "Customization", competitor: { text: "Models, runtimes, channels, skills, and code", mark: "yes" }, pancake: { text: "Pick your signals, approve leads and articles" } },
    { feature: "GTM Brain", competitor: { text: "General workspace instructions and memory" }, pancake: { text: "Positioning, buyers, offers, proof, and objections", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "You build or install the outreach workflow" }, pancake: { text: "Six kinds of signals, daily leads, outreach from your account", mark: "yes" } },
    { feature: "AI-search content", competitor: { text: "You build or install the content workflow" }, pancake: { text: "Articles for Google and AI search, written for you", mark: "yes" } },
    { feature: "Infrastructure ownership", competitor: { text: "Self-hosted and developer-controlled", mark: "yes" }, pancake: { text: "Managed by Pancake" } },
    { feature: "Pricing", competitor: { text: "Open source plus hosting, models, data, and labor" }, pancake: { text: "$99/month flat, nothing to host", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Developers building custom agent systems" }, pancake: { text: "Small companies that need customers without a GTM team" } },
  ],
  closingTitle: "Skip the agent infrastructure project.",
  closingLede: "Start with the GTM Brain, agents, and recurring workflows already assembled around bringing customers.",
  faqs: [
    { q: "What is the main difference between OpenClaw and Pancake?", a: "OpenClaw is open-source agent infrastructure that a technical user configures and maintains. Pancake is an AI GTM team you use, not a system you build: its agents already know how to pick leads from buying signals and open conversations from your own account." },
    { q: "Is Pancake managed OpenClaw hosting?", a: "No. Pancake is an AI GTM team, not a hosting service. The infrastructure is Pancake's job. Yours is approving the leads and articles its agents bring you." },
    { q: "Is OpenClaw free?", a: "The software is open source. Running it still creates hosting, model, data-provider, maintenance, and engineering costs. Pancake folds all of that into one flat price: $99 a month." },
    { q: "Which gives me more control?", a: "OpenClaw. It is the better choice when you need to select runtimes, modify agent code, self-host, or build use cases outside GTM. Pancake leaves the GTM decisions with you: you pick the signals and approve leads and articles." },
    { q: "Can I use both?", a: "Yes. A developer can run custom internal agents on OpenClaw while using Pancake for managed GTM. The systems solve different layers of the problem." },
  ],
  related: [{ href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/pancake-vs-paperclips", label: "Paperclip vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://github.com/openclaw/openclaw", label: "OpenClaw repository" }, { href: "https://github.com/openclaw/openclaw/blob/main/docs/concepts/agent-runtimes.md", label: "OpenClaw runtime documentation" }, { href: `${SITE_ORIGIN}/`, label: "Pancake product page" }],
};

export default function OpenClawVsPancakePage() { return <GtmComparisonPage config={config} />; }
