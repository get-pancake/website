// lib/verticals/data/gtm-agencies.ts
// Every person, company, rival agency, creator and workspace below is invented.
// Caveat (brief): Pancake overlaps the reader's own service, so the page leads with
// "fill your own pipeline" and puts clients second. One workspace and one sending
// account per client ($99 each); no multi-client dashboard, no custom sequences, no email.
import type { VerticalConfig } from "../types";

export const gtmAgencies: VerticalConfig = {
  slug: "gtm-agencies",
  status: "approved",
  category: "Sales, GTM & recruiting",
  evidence: "founder",
  updated: "2026-09-22",

  name: {
    plural: "GTM agencies",
    title: "GTM agencies",
    short: "GTM agencies",
    badge: "For GTM agencies",
  },

  meta: { seoTitle: "Pancake for GTM Agencies: Fill Your Own Pipeline First" },

  hubLine: "Find B2B founders who are building outbound.",

  hero: {
    title: "Find founders hiring SDRs to build outbound.",
    lede: "Pancake reads sales job posts, the tools they name and comments on GTM creators’ posts. Your own pipeline fills every morning.",
  },

  workspace: { name: "Quillon Outbound", sender: "Reuben Castile" },

  demo: {
    h2: "Outbound for the outbound agency.",
    prompts: [
      {
        kind: "hiring",
        text: "I run outbound for startups. Find US B2B companies with 10 to 50 people hiring an SDR.",
        reply: "I’ll watch SDR and BDR job posts at US startups that size, then find who runs sales.",
        proposal: [
          { kind: "hiring", items: ["SDR", "BDR", "Founding account executive"] },
          { kind: "keyword", items: ["building outbound", "first sales hire"] },
          { kind: "competitor", items: ["Pipeforge Growth"] },
        ],
        leads: [
          { name: "Priyanka Raghunathan", role: "Founder & CEO", company: "Sorrelwork", kind: "hiring", signal: "SDR role posted" },
          { name: "Colin Treadway", role: "Head of Sales", company: "Bollard Data", kind: "hiring", signal: "BDR role open" },
          { name: "Serena Radovanovic", role: "Co-founder", company: "Trundlebay", kind: "keyword", signal: "Posted on outbound" },
          { name: "Darnell Hightower", role: "CEO", company: "Cantlewick HR", kind: "competitor", signal: "Liked a Pipeforge post" },
          { name: "Wen Zhao", role: "VP Growth", company: "Gusset Pay", kind: "hiring", signal: "Founding AE role open" },
        ],
        featured: {
          why: "Sorrelwork, a 24-person US B2B software company, posted an SDR role this week. Priyanka is the founder and CEO.",
          confidence: 90,
          seniority: "Founder",
        },
        message:
          "Hi Priyanka, thanks for accepting. I work on outbound with startups, and each one finds its first deals a different way. Where have your best ones come from so far?",
      },
      {
        kind: "stack",
        text: "Find US B2B companies whose job posts name Clay or Apollo. We run that stack for them.",
        reply: "I’ll track job posts that ask for Clay or Apollo and keep the growth and sales leaders.",
        proposal: [
          { kind: "stack", items: ["Clay", "Apollo"] },
          { kind: "hiring", items: ["GTM engineer", "Growth operations manager"] },
          { kind: "keyword", items: ["signal-based selling", "Clay workflows"] },
        ],
        leads: [
          { name: "Marcus Delacroix", role: "Head of Growth", company: "Lucarne Labs", kind: "stack", signal: "Clay in job posts" },
          { name: "Beatriz Almeida", role: "VP Sales", company: "Lintel Data", kind: "stack", signal: "Apollo in job posts" },
          { name: "Yaw Adomako", role: "CRO", company: "Soffitworks", kind: "hiring", signal: "GTM engineer role open" },
          { name: "Lucia Ferraro", role: "Founder", company: "Purlinworks", kind: "keyword", signal: "Posted about Clay" },
          { name: "Ethan Morrow", role: "Head of Revenue", company: "Joistware", kind: "hiring", signal: "Growth ops role open" },
        ],
        featured: {
          why: "Lucarne Labs is a 60-person US B2B software company. Its job posts name Clay, and Marcus is its head of growth.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Marcus, good to be connected. My team builds and runs outbound stacks all day. Is prospecting still mostly manual on your side?",
      },
      {
        kind: "influencer",
        text: "Find US SaaS founders who engage with outbound creators’ posts. We work with teams under 50.",
        reply: "I’ll watch fans of the outbound creators you name and keep SaaS teams under 50.",
        proposal: [
          { kind: "influencer", items: ["Tessa Brightwell", "Rafael Sousa"] },
          { kind: "keyword", items: ["founder-led sales", "SDR ramp"] },
          { kind: "own_brand", items: ["Quillon Outbound"] },
        ],
        leads: [
          { name: "Hana Kobayashi", role: "Founder & CEO", company: "Oriellane", kind: "influencer", signal: "Liked a Brightwell post" },
          { name: "Isaac Feldman", role: "Co-founder", company: "Spindlebird", kind: "influencer", signal: "Commented on a post" },
          { name: "Renata Oliveira", role: "CEO", company: "Mortisebay", kind: "keyword", signal: "Posted on SDR ramp" },
          { name: "Tyrone Beasley", role: "Founder", company: "Grommetry", kind: "own_brand", signal: "Liked a Quillon post" },
          { name: "Mira Castellane", role: "Head of Sales", company: "Plinthwise", kind: "influencer", signal: "Liked a Sousa post" },
        ],
        featured: {
          why: "Oriellane is a 35-person US SaaS company. Hana, its founder and CEO, liked a Tessa Brightwell post about founder-led sales.",
          confidence: 85,
          seniority: "Founder",
        },
        message:
          "Hi Hana, saw you liked Tessa Brightwell’s post on founder-led sales. Are you still running most of Oriellane’s sales calls yourself?",
      },
    ],
  },

  signals: {
    h2: "Founders hiring SDRs need pipeline now.",
    cards: [
      {
        kind: "hiring",
        title: "Startups hiring SDRs",
        body: "Pancake reads job posts for SDR, BDR and founding sales roles at the company sizes you serve.",
        watching: ["SDR", "BDR", "Founding AE", "Head of Growth"],
        more: 1,
      },
      {
        kind: "stack",
        title: "Teams naming your tools",
        body: "Clay or Apollo in a job post means the team already runs outbound on your stack.",
        watching: ["Clay", "Apollo", "HubSpot", "Salesloft"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Fans of outbound creators",
        body: "Pancake tracks who likes and comments on the outbound creators you name, and keeps the founders.",
        watching: ["Tessa Brightwell", "Rafael Sousa"],
        more: 3,
      },
      {
        kind: "competitor",
        title: "Followers of rival agencies",
        body: "Founders who like or comment on a rival agency’s posts show up in your morning leads.",
        watching: ["Pipeforge Growth", "Meridell Demand"],
      },
    ],
  },

  faq: [
    {
      q: "Can I run Pancake for my clients?",
      a: "Yes. Open one workspace per client at $99 a month each. Each client gets its own Brain and needs its own account to send from.",
    },
    {
      q: "Isn’t Pancake a rival to my agency?",
      a: "It does part of what you sell: finding leads and opening conversations. Use it to fill your own pipeline, or run it as one piece of a client engagement.",
    },
    {
      q: "Won’t a team hiring a GTM engineer build its Clay setup in-house?",
      a: "Some will. The post still shows outbound is a priority now. Pitch the build while they hire, or support for the new engineer.",
    },
    {
      q: "Can I change the sequence steps?",
      a: "No. Every workspace runs one fixed sequence. What changes per lead is the message: it starts from the lead’s own post when there is one, always in your Brain voice.",
    },
  ],

  related: ["revops-consultants", "marketing-agencies", "saas-startups", "ai-automation-agencies"],

  cta: { title: "Be your own best client." },
};
