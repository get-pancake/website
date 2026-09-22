// lib/verticals/data/ai-automation-agencies.ts — /for/ai-automation-agencies.
// Merged in: AI consultants. Every person, company, rival firm, influencer and workspace below is invented.
// Evidence: 11 trials, 0 paying; an AI-transformation advisory pays (also counted under consultants).
// Caveat: prompts target B2B firms visible on LinkedIn, never local SMBs (dentists, trades, coaches).
// Trial-only evidence: not a flagship, no success stories. "Make" stays out (ambiguous Stack name).
// Angle kept apart from ai-startups (distributors, claims, "busywork"): the agency's buyers are ops
// leaders at property managers, brokerages and accounting firms, and the Zapier / n8n rebuild.
import type { VerticalConfig } from "../types";

export const aiAutomationAgencies: VerticalConfig = {
  slug: "ai-automation-agencies",
  status: "approved",
  category: "Tech & build agencies",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "AI automation agencies",
    title: "AI automation agencies",
    short: "automation agencies",
    badge: "For AI automation agencies",
  },

  meta: { seoTitle: "Pancake for AI Automation Agencies: Find B2B Clients" },

  hubLine: "Find ops leaders with manual work to automate.",

  hero: {
    h1: ["You automate ops work", "We bring you clients"],
    lede: "Pancake finds ops leaders posting about manual work, and firms whose job posts name Zapier. You bring the automation.",
  },

  workspace: { name: "Cogspring Automation", sender: "Dorian Mbatha" },

  demo: {
    h2: "Their manual work is your pipeline.",
    prompts: [
      {
        kind: "hiring",
        text: "We automate admin work. Find US firms with 50 to 500 staff hiring data entry clerks.",
        reply: "I'll watch job posts for data entry and admin roles at US firms that size.",
        proposal: [
          { kind: "hiring", items: ["Data entry clerk", "Administrative assistant"] },
          { kind: "keyword", items: ["manual processes", "too many spreadsheets"] },
          { kind: "competitor", items: ["Gearloft AI"] },
        ],
        leads: [
          { name: "Marisol Etcheverry", role: "Head of Operations", company: "Harrowgate", kind: "hiring", signal: "Data entry clerk role" },
          { name: "Devon Pruett", role: "COO", company: "Tolland", kind: "hiring", signal: "Admin assistant role" },
          { name: "Renata Szczepanik", role: "Operations Manager", company: "Pinfold", kind: "hiring", signal: "2 data entry roles open" },
          { name: "Harold Nakashima", role: "Finance Director", company: "Wexmoor", kind: "keyword", signal: "Posted on spreadsheets" },
          { name: "Moira Coulter", role: "VP Operations", company: "Sturbridge", kind: "competitor", signal: "Liked a Gearloft post" },
        ],
        featured: {
          why: "Harrowgate is a 180-person US commercial property manager with a data entry clerk role open. Marisol runs operations and owns that team.",
          confidence: 90,
          seniority: "Head",
        },
        message:
          "Hi Marisol, saw Harrowgate is hiring a data entry clerk. In property management, that role often means retyping leases and vendor invoices. We build AI workflows that read those documents and fill in the fields. Want to see one run on a sample lease?",
      },
      {
        kind: "stack",
        text: "Find US firms whose job posts mention Zapier or n8n. We rebuild those workflows with AI.",
        reply: "I'll watch job posts that name Zapier or n8n and find the ops lead at each firm.",
        proposal: [
          { kind: "stack", items: ["Zapier", "n8n", "Airtable"] },
          { kind: "hiring", items: ["Automation specialist", "Operations analyst"] },
          { kind: "keyword", items: ["AI adoption"] },
        ],
        leads: [
          { name: "Georgina Henshaw", role: "COO", company: "Tallisford", kind: "stack", signal: "Zapier in job posts" },
          { name: "Pradeep Chakravarti", role: "Operations Manager", company: "Ironvale", kind: "stack", signal: "n8n in job posts" },
          { name: "Corinne Haverkamp", role: "Head of Operations", company: "Mossgrove", kind: "hiring", signal: "Automation role open" },
          { name: "Mateo Carrizales", role: "Finance Director", company: "Brackwater", kind: "stack", signal: "Airtable in job posts" },
          { name: "Augustin Pereyra", role: "Founder & CEO", company: "Farrowdale", kind: "keyword", signal: "Posted on AI adoption" },
        ],
        featured: {
          why: "Tallisford is a 240-person US insurance brokerage. Its open job posts name Zapier, and Georgina runs operations as COO.",
          confidence: 88,
          seniority: "C-level",
        },
        message:
          "Hi Georgina, saw Tallisford's open roles ask for Zapier experience. Zaps tend to multiply as a brokerage grows. We rebuild them with AI steps, like reading a policy PDF and routing it to the right team. Open to a quick walkthrough?",
      },
      {
        kind: "keyword",
        text: "Find COOs at US B2B services firms posting about manual processes. I'm an AI consultant.",
        reply: "I'll watch posts about manual processes and keep COOs at B2B services firms.",
        proposal: [
          { kind: "keyword", items: ["manual processes", "client onboarding"] },
          { kind: "influencer", items: ["Rhea Montaño", "Tobin Iredale"] },
          { kind: "hiring", items: ["Operations coordinator"] },
        ],
        leads: [
          { name: "Fatima Ghorbani", role: "COO", company: "Quinlan Hart", kind: "keyword", signal: "Posted on onboarding" },
          { name: "Brent Vandermolen", role: "COO", company: "Lockridge", kind: "influencer", signal: "Liked a Montaño post" },
          { name: "Lorna Quigley", role: "Managing Partner", company: "Stanbury", kind: "keyword", signal: "Posted on manual work" },
          { name: "Ekow Danquah", role: "VP Operations", company: "Kettleby", kind: "influencer", signal: "Commented on Iredale" },
          { name: "Ezekiel Hargrove", role: "COO", company: "Gatwood", kind: "hiring", signal: "Ops coordinator role" },
        ],
        featured: {
          why: "Quinlan Hart is a 70-person US accounting firm. Fatima is COO and posted this week about the manual steps in client onboarding.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Fatima, saw your post about the manual steps in client onboarding at Quinlan Hart. Chasing documents by hand adds up fast. I help accounting firms your size automate intake and follow-ups with AI. Worth 20 minutes to compare notes?",
      },
    ],
  },

  signals: {
    h2: "Copy-paste work is hard to hide.",
    cards: [
      {
        kind: "keyword",
        title: "Posts about manual work",
        body: "Pancake finds ops and finance leaders who post about manual processes, spreadsheets or client onboarding.",
        watching: ["manual processes", "spreadsheets"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Firms hiring for admin roles",
        body: "Pancake reads job posts for clerical and ops roles, the work your automations take off a team.",
        watching: ["Data entry clerk", "Admin assistant"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Automation tools in job posts",
        body: "Pancake finds firms whose job posts name the tools you rebuild or extend.",
        watching: ["Zapier", "n8n", "Airtable", "UiPath"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "The ops voices COOs read",
        body: "Ops leaders who comment on or react to their posts become your leads.",
        watching: ["Rhea Montaño", "Tobin Iredale"],
        more: 3,
      },
    ],
  },

  faq: [
    {
      q: "I automate for dentists and contractors. Will Pancake find them?",
      a: "Rarely. Pancake finds people on LinkedIn, where dentists and contractors seldom post. Firms with an ops team show up far more often.",
    },
    {
      q: "I build in Claude all day. Can Pancake run from there?",
      a: "Yes. Pancake connects to Claude Code and Codex over MCP. Review leads and edit your Brain from there.",
    },
    {
      q: "My offer changes every month. Can Pancake keep up?",
      a: "Yes. Edit the ICP in your Brain any time. The next morning's leads follow the new version.",
    },
    {
      q: "Can it find leaders asking where to start with AI?",
      a: "Yes, when they post about it. Watch phrases like “AI adoption” or “AI roadmap”, and Pancake brings you the authors and the people who comment.",
    },
  ],

  related: ["software-development-agencies", "consultants", "gtm-agencies", "data-consultancies"],

  cta: { title: "Retire a spreadsheet." },
};
