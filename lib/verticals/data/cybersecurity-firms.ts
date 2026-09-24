// lib/verticals/data/cybersecurity-firms.ts — /for/cybersecurity-firms.
// Merged in: MSSPs, penetration testing firms, GRC consultancies. One prompt per merged trade:
// SOC 2 readiness (Keyword), a managed SOC (Hiring), pentests for SOC 2 (Stack).
// Every person, company, rival firm and workspace below is invented.
// Evidence: trials (managed IT & security, financial-crime compliance advisory); adjacent paying
// security SaaS confirms the buyer pattern.
// Caveat: no breach, vulnerability or news signal, no scanning. "SOC 2" is a keyword people post,
// not a compliance database. Stack = tools named in job posts.
import type { VerticalConfig } from "../types";

export const cybersecurityFirms: VerticalConfig = {
  slug: "cybersecurity-firms",
  status: "approved",
  category: "IT, cloud & security",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "cybersecurity firms",
    title: "Cybersecurity firms",
    short: "security firms",
    badge: "For cybersecurity firms",
  },

  meta: { seoTitle: "Pancake for Cybersecurity Firms: Find Security Clients" },

  hubLine: "Find companies facing audits or hiring security staff.",

  hero: {
    title: "Find CTOs preparing for their first SOC 2 audit.",
    lede: "Pancake reads GRC openings, job posts naming Vanta, and rival MSSPs’ pages. You scope the work before another firm does.",
  },

  workspace: { name: "Varnholt Security", sender: "Keira Varnholt" },

  demo: {
    h2: "Reach the person who owns security.",
    prompts: [
      {
        kind: "keyword",
        text: "We run SOC 2 readiness. Find CTOs at US SaaS companies posting about their first SOC 2 audit.",
        reply: "I’ll watch posts about SOC 2 audits and keep CTOs at US SaaS companies.",
        proposal: [
          { kind: "keyword", items: ["first SOC 2 audit", "SOC 2 Type II", "security questionnaire"] },
          { kind: "hiring", items: ["Compliance manager", "GRC analyst"] },
          { kind: "stack", items: ["Vanta", "Drata"] },
          { kind: "competitor", items: ["Ironwake Security"] },
        ],
        leads: [
          { name: "Delaney Hsu", role: "CTO", company: "Gantrywise", kind: "keyword", signal: "Posted on SOC 2 audit" },
          { name: "Nikolai Pavlicek", role: "VP Engineering", company: "Heronfield", kind: "keyword", signal: "Posted on SOC 2 Type II" },
          { name: "Shanice Colquitt", role: "Head of Security", company: "Lanyardly", kind: "hiring", signal: "GRC analyst role open" },
          { name: "Hugo Villanueva", role: "CTO & Co-founder", company: "Pikestaff", kind: "stack", signal: "Vanta in job posts" },
          { name: "Tamika Brashear", role: "Compliance Manager", company: "Tessaline", kind: "competitor", signal: "Liked an Ironwake post" },
        ],
        featured: {
          why: "Gantrywise is a 60-person US SaaS company. Delaney is the CTO and posted this week about preparing for a first SOC 2 audit.",
          confidence: 90,
          seniority: "C-level",
        },
        message:
          "Hi Delaney, I saw you’re preparing Gantrywise for its first SOC 2 audit. Which part of the prep is taking the most time?",
      },
      {
        kind: "hiring",
        text: "We run a 24/7 SOC. Find US companies with 200 to 2,000 staff hiring their own SOC analysts.",
        reply: "I’ll watch US job posts for SOC analyst roles and find who leads security there.",
        proposal: [
          { kind: "hiring", items: ["SOC analyst", "Security analyst", "Detection engineer"] },
          { kind: "stack", items: ["CrowdStrike", "SentinelOne", "Splunk"] },
          { kind: "keyword", items: ["alert fatigue", "24/7 monitoring"] },
          { kind: "competitor", items: ["Tallwater Cyber"] },
        ],
        leads: [
          { name: "Octavia Thackeray", role: "CISO", company: "Coppervane Health", kind: "hiring", signal: "SOC analyst role open" },
          { name: "Rohit Ravindran", role: "Head of IT", company: "Stonecrop Freight", kind: "hiring", signal: "Detection engineer role" },
          { name: "Svetlana Sokolova", role: "VP IT", company: "Kettlewell Bank", kind: "stack", signal: "SentinelOne in job posts" },
          { name: "Clement Fairbrother", role: "IT Director", company: "Shorewick", kind: "keyword", signal: "Posted on alert fatigue" },
          { name: "Pilar Castañeda", role: "COO", company: "Marrowgate Title", kind: "competitor", signal: "Liked a Tallwater post" },
        ],
        featured: {
          why: "Coppervane Health is a 420-person US healthcare company with a SOC analyst role open. Octavia is the CISO and owns the hire.",
          confidence: 89,
          seniority: "C-level",
        },
        message:
          "Hi Octavia, thanks for accepting. I run a 24/7 security operations center. How does your team handle alerts that land overnight?",
      },
      {
        kind: "stack",
        text: "We run pentests for SOC 2 audits. Find US SaaS companies whose job posts name Vanta or Drata.",
        reply: "I’ll watch US job posts that name Vanta or Drata and find who owns security.",
        proposal: [
          { kind: "stack", items: ["Vanta", "Drata", "Secureframe"] },
          { kind: "keyword", items: ["penetration test", "pentest report"] },
          { kind: "competitor", items: ["Scarpline Security"] },
        ],
        leads: [
          { name: "Rosario Villaseñor", role: "Head of GRC", company: "Quellstone", kind: "stack", signal: "Vanta in job posts" },
          { name: "Kenji Amundsen", role: "CISO", company: "Glintwork", kind: "stack", signal: "Drata in job posts" },
          { name: "Ayodele Brisco", role: "VP Engineering", company: "Harborvault", kind: "keyword", signal: "Posted on a pentest" },
          { name: "Travis Okimoto", role: "CTO", company: "Fennoscope", kind: "competitor", signal: "Liked a Scarpline post" },
          { name: "Lorena Quijada", role: "Head of IT", company: "Lumbergate", kind: "keyword", signal: "Pentest report post" },
        ],
        featured: {
          why: "Quellstone is a 220-person US SaaS company whose security job posts name Vanta. Rosario leads GRC there.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Rosario, good to connect. We run pentests timed to SOC 2 audits. How far ahead do you usually book yours?",
      },
    ],
  },

  signals: {
    h2: "Security work leaves a trail.",
    cards: [
      {
        kind: "keyword",
        title: "CTOs posting about audits",
        body: "CTOs and compliance leads who post about SOC 2, ISO 27001 or a pentest arrive with their post quoted.",
        watching: ["SOC 2 audit", "ISO 27001", "pentest"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Teams hiring security staff",
        body: "Pancake reads job posts for SOC, GRC and security engineering roles, then finds who leads security.",
        watching: ["SOC analyst", "GRC analyst", "Security engineer"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Tools they hire for",
        body: "Pancake finds companies whose job posts name the compliance and security platforms you work in.",
        watching: ["Vanta", "Drata", "CrowdStrike", "SentinelOne"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Rival security firms’ audience",
        body: "IT and security leaders who comment on or like a rival MSSP or pentest firm’s posts become your leads.",
        watching: ["Ironwake Security", "Tallwater Cyber"],
        more: 1,
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake tell me which companies got breached?",
      a: "No. Breaches and news aren’t signals. Pancake finds people posting about audits and companies hiring security roles.",
    },
    {
      q: "Can messages mention what’s exposed on their domain?",
      a: "No. Pancake never scans or probes a prospect’s systems. Messages start from the lead’s own post when there is one, and from your Brain.",
    },
    {
      q: "Security leaders ignore vendor pitches. Will this read like one?",
      a: "The invite has no note, so there’s no pitch to ignore. When a lead posted or commented, the message starts from that post. Leads you don’t approve never hear from you.",
    },
    {
      q: "Can it find companies that need a pentest?",
      a: "Only from public clues: posts about a pentest or security review, and job posts that name Vanta or Drata. It can’t see audit results or failed controls.",
    },
  ],

  related: ["msps", "cloud-consultancies", "developer-tools", "fintech-startups"],

  cta: { title: "Audit season never ends." },
};
