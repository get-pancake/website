import type { Metadata, Viewport } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";
import { SITE_ORIGIN } from "@/lib/site-config.mjs";

// Unify facts read on 2026-10-07 from unifygtm.com and unifygtm.com/pricing (audit plan 3.10).
// Re-check both pages before moving FACTS_REVIEWED, and again within 90 days.
const title = "Unify vs Pancake: Per-Seat Pricing vs $99 per Workspace";
const description = "Compare Unify and Pancake: an outbound platform priced per seat plus credits, versus Plays that find your buyers for $99 a month per workspace.";

// Status-bar zone matches the lp cream, as every comparison page. Same value as the
// comparisonViewport export the landing-audit-fixes template adds; switch to it once that lands.
export const viewport: Viewport = { themeColor: "#fbf6f1" };

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_ORIGIN}/unify-vs-pancake` },
  openGraph: {
    type: "website",
    url: `${SITE_ORIGIN}/unify-vs-pancake`,
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Unify vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "unify-vs-pancake",
  competitor: "Unify",
  competitorInitial: "U",
  heroLede: "A sales platform priced per seat versus one plan per workspace.",
  heroSummary: "Unify gives sales reps data, signals, sequences and a dialer, billed per seat with credits. Pancake runs Plays that find your buyers and writes to the ones you approve, for $99 a month per workspace.",
  competitorBody: "An outbound platform for SDRs, AEs and sales leaders. Reps build lists from 1.1B+ people and 40+ data sources, then run multi-channel sequences from one chat.",
  competitorChoose: "Choose it when reps need data, email and a dialer in one place.",
  pancakeBody: "Tell Pancake who to reach. It builds a Play that searches every night. Every lead arrives with why it fits, and you approve each one before Pancake writes to them under your name.",
  pancakeChoose: "Choose it when you do your own sales and want one price for the team.",
  verdictTitle: "Unify equips sales reps. Pancake runs the Play.",
  verdictLede: "Unify is the stronger toolkit once you have reps, mailboxes and a CRM. Pancake fits founders who do their own sales and want buyers found every night.",
  competitorBestFit: "Unify is the better fit when several reps need contact data, email sequences, a dialer and HubSpot or Salesforce sync, and each rep works from their own seat.",
  differencesLede: "Both find people to talk to. They differ in who runs the work and how you pay.",
  differences: [
    {
      n: "01",
      title: "Per seat versus per workspace",
      body: "As of October 2026, Unify's Base plan is $20 per seat a month and Pro is $60, each with credits per seat. Pancake is $99 a month per workspace. Your whole team is included.",
      angle: "Add a teammate and the Pancake price stays the same.",
    },
    {
      n: "02",
      title: "Rep platform versus a Play that runs",
      body: "Unify gives each rep a chat to build lists, research accounts and write sequences. Tell Pancake who to reach, and it builds a Play. The Play searches again every night.",
      angle: "Unify speeds up your reps. Pancake does the searching.",
    },
    {
      n: "03",
      title: "Layered signals versus a reason on every lead",
      body: "Unify layers signals such as job changes, hiring, funding and tech stack. Pancake checks every lead against your ideal customer profile. Each one arrives with one line on why it fits.",
      angle: "You read the reason before you approve the lead.",
    },
    {
      n: "04",
      title: "Unify wins on email and calling",
      body: "Unify runs email, call and social steps in one sequence, with a click-to-call dialer. Business adds managed Gmail and Outlook mailboxes and a power dialer. Pancake sends no email and makes no calls.",
      angle: "Pick Unify when email and phone are your channels.",
    },
    {
      n: "05",
      title: "Unify wins on CRM sync and data",
      body: "Unify's Pro plan reads HubSpot and Salesforce, and Business writes back. Every paid plan adds phone and email enrichment. Pancake doesn't sync to a CRM or look up phone numbers.",
      angle: "Pick Unify when the CRM is your system of record.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Outbound platform for sales reps", mark: "yes" }, pancake: { text: "Plays that find buyers and start the conversation", mark: "yes" } },
    { feature: "Pricing", competitor: { text: "Free, then $20 or $60 per seat a month, plus credits" }, pancake: { text: "$99 a month per workspace", mark: "yes" } },
    { feature: "Seats", competitor: { text: "Paid per seat; Free plan up to 3 seats" }, pancake: { text: "Whole team included", mark: "yes" } },
    { feature: "Contact data", competitor: { text: "1.1B+ people, 65M+ companies, 40+ sources", mark: "yes" }, pancake: { text: "A nightly search for people who fit your ICP", mark: "yes" } },
    { feature: "Lead context", competitor: { text: "Signals, account research and AI copy", mark: "yes" }, pancake: { text: "One line on why each lead fits", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Email, call and social steps in one sequence", mark: "yes" }, pancake: { text: "Direct messages under your name, from the accounts you send from", mark: "yes" } },
    { feature: "Email and calling", competitor: { text: "Managed mailboxes and a dialer", mark: "yes" }, pancake: { text: "No email, no calls", mark: "no" } },
    { feature: "CRM sync", competitor: { text: "HubSpot and Salesforce: read-only on Pro, read-write on Business", mark: "yes" }, pancake: { text: "No CRM sync", mark: "no" } },
    { feature: "AI agents", competitor: { text: "Bulk APIs to analyze data in Claude or Codex", mark: "yes" }, pancake: { text: "Run Plays from Claude, Claude Code or Codex", mark: "yes" } },
    { feature: "Free trial", competitor: { text: "Free plan; 14-day Pro trial, no card", mark: "yes" }, pancake: { text: "3-day free trial, card required", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Sales teams with reps, mailboxes and a CRM" }, pancake: { text: "Founders who do their own sales, and small B2B teams" } },
  ],
  closingTitle: "One workspace. One price. The whole team.",
  closingLede: "Tell Pancake who to reach. It builds the Play, searches every night and writes to the leads you approve.",
  faqs: [
    { q: "What is the main difference between Unify and Pancake?", a: "Unify is an outbound platform that sales reps operate, priced per seat. Pancake runs Plays: it finds the people who fit and writes to the ones you approve. It costs $99 a month per workspace." },
    { q: "How does pricing compare?", a: "As of October 2026, Unify has a Free plan, Base at $20 and Pro at $60 per seat a month, and custom Business plans. Each comes with credits. Pancake is $99 a month per workspace." },
    { q: "What does Unify do that Pancake doesn't?", a: "Email sequences with managed mailboxes, a dialer, phone enrichment, and HubSpot or Salesforce sync. Its Business plan adds website intent and product signals. Pancake doesn't do these." },
    { q: "Does Pancake charge per seat?", a: "No. Pancake is $99 a month per workspace, and your whole team is included. A second company is a second workspace at the same price." },
    { q: "Can I run Pancake from Claude or Codex?", a: "Yes. Claude, Claude Code and Codex connect with a browser sign-in, no API key. You create Plays, review leads and edit messages from the agent. Unify offers bulk export APIs for analysis in Claude or Codex." },
    { q: "Who should choose Pancake over Unify?", a: "Founders who do their own sales, and small B2B teams without reps or a mailbox stack. Tell Pancake who to reach and approve the leads that fit. Pancake writes to them under your name." },
  ],
  related: [
    { href: "/octave-vs-pancake", label: "Octave vs Pancake" },
    { href: "/alta-vs-pancake", label: "Alta vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.unifygtm.com/", label: "Unify product page (October 2026)" },
    { href: "https://www.unifygtm.com/pricing", label: "Unify pricing (October 2026)" },
    { href: `${SITE_ORIGIN}/pricing`, label: "Pancake pricing" },
  ],
};

export default function UnifyVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
