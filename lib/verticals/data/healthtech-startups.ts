// lib/verticals/data/healthtech-startups.ts — /for/healthtech-startups.
// Buyers: patient-access, revenue-cycle, operations and IT leaders at hospitals, specialty clinic
// groups and senior-living operators. Prompts map to the trial evidence: scheduling for hospitals
// (Epic), front-office automation for clinic groups, staffing for senior-living operators.
// Caveat (brief): B2B health organisations only, never patients. No patient-data, HIPAA or
// clinical claims. Small practices rarely post or keep active profiles. Every person, company, rival vendor,
// influencer and workspace below is invented; Epic, Epic Cadence, Cerner, athenahealth and
// ModMed are real EHR names that appear in job posts (Stack signal).
// FAQ "buying committee": company signals collect only the top `personasPerCompany` (default 2)
// buyer-fit people per company (product ADR 0040), hence "one or two people".
import type { VerticalConfig } from "../types";

export const healthtechStartups: VerticalConfig = {
  slug: "healthtech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "healthtech startups",
    title: "Healthtech startups",
    short: "healthtech founders",
    badge: "For healthtech startups",
  },

  meta: { seoTitle: "Pancake for Healthtech Startups: Health System Buyers" },

  hubLine: "Find hospitals and clinic groups whose job posts name Epic.",

  hero: {
    title: "Find revenue cycle VPs adding prior auth staff.",
    lede: "Pancake reads hospital job posts naming Epic, prior auth openings and health leaders’ posts. You reach the budget holder.",
  },

  workspace: { name: "Wardwise", sender: "Temitope Oyinlola" },

  demo: {
    h2: "Find who buys inside the hospital.",
    prompts: [
      {
        kind: "stack",
        text: "Our scheduling tool plugs into Epic. Find US hospitals whose job posts name it.",
        reply: "I’ll watch hospital job posts that name Epic and find who runs patient access.",
        proposal: [
          { kind: "stack", items: ["Epic", "Epic Cadence"] },
          { kind: "hiring", items: ["Medical scheduler", "Patient access specialist"] },
          { kind: "keyword", items: ["patient no-shows", "appointment backlog"] },
          { kind: "competitor", items: ["Queuemark Health"] },
        ],
        leads: [
          { name: "Loretta Szczepanski", role: "VP Patient Access", company: "Ivers Health", kind: "stack", signal: "Cadence in job posts" },
          { name: "Cornelius Mabry", role: "CIO", company: "Tessmer Regional", kind: "stack", signal: "Epic in job posts" },
          { name: "Noreen Donnellan", role: "COO", company: "Wilmarth Health", kind: "hiring", signal: "Medical scheduler role" },
          { name: "Jun Watanabe", role: "Ops Director", company: "Sutterby Health", kind: "keyword", signal: "Posted about no-shows" },
          { name: "Adrienne Boudreaux", role: "CMIO", company: "Ruddock Health", kind: "competitor", signal: "Liked a Queuemark post" },
        ],
        featured: {
          why: "Ivers Health is a 3,800-person US health system. Its scheduler job posts name Epic Cadence, and Loretta runs patient access.",
          confidence: 89,
          seniority: "VP",
        },
        message:
          "Hi Loretta, appreciate the connect. I work on patient scheduling software. What happens to a slot when a patient cancels the day before?",
      },
      {
        kind: "hiring",
        text: "We automate prior auth. Find US specialty clinic groups hiring prior auth specialists.",
        reply: "I’ll watch prior auth job posts at US specialty groups and find who runs revenue cycle.",
        proposal: [
          { kind: "hiring", items: ["Prior auth specialist", "Authorization coordinator"] },
          { kind: "keyword", items: ["prior authorization", "claim denials"] },
          { kind: "stack", items: ["athenahealth", "ModMed"] },
        ],
        leads: [
          { name: "Rosalyn Obermeyer", role: "VP Revenue Cycle", company: "Alcott Ortho", kind: "hiring", signal: "2 prior auth roles open" },
          { name: "Anselmo Rutkowski", role: "Administrator", company: "Averill GI", kind: "hiring", signal: "Auth coordinator role" },
          { name: "Mirabel Onwudiwe", role: "CFO", company: "Linwood Derm", kind: "stack", signal: "ModMed in job posts" },
          { name: "Julius Beresford", role: "COO", company: "Brayfield Heart", kind: "keyword", signal: "Posted about denials" },
          { name: "Rhiannon Tate", role: "RCM Lead", company: "Corrado Oncology", kind: "keyword", signal: "Posted on prior auth" },
        ],
        featured: {
          why: "Alcott Ortho is a 260-person US orthopedic group with two prior auth roles open. Rosalyn runs the revenue cycle and owns those hires.",
          confidence: 92,
          seniority: "VP",
        },
        message:
          "Hi Rosalyn, glad to connect. We build software that automates prior authorizations. How long does a typical auth take to come back?",
      },
      {
        kind: "keyword",
        text: "Our shift app fills caregiver gaps. Find US senior-living leaders posting about staffing.",
        reply: "I’ll watch posts from senior-living leaders about caregiver staffing and turnover.",
        proposal: [
          { kind: "keyword", items: ["caregiver shortage", "staff turnover"] },
          { kind: "hiring", items: ["Caregiver", "Certified nursing assistant"] },
          { kind: "influencer", items: ["Winslow Tregear"] },
        ],
        leads: [
          { name: "Ingrid Haugland", role: "VP Operations", company: "Stillhollow Living", kind: "keyword", signal: "Posted about staffing" },
          { name: "Kwame Osei-Bonsu", role: "COO", company: "Quailridge Living", kind: "hiring", signal: "4 caregiver roles open" },
          { name: "Deepa Venugopal", role: "VP Clinical Ops", company: "Vessey Living", kind: "influencer", signal: "Liked a Tregear post" },
          { name: "Khalid Mansoori", role: "CEO", company: "Parrish Care", kind: "keyword", signal: "Posted on turnover" },
          { name: "Cordelia Grummond", role: "VP People", company: "Caldicott Senior", kind: "hiring", signal: "CNA roles open" },
        ],
        featured: {
          why: "Stillhollow Living is a 900-person US senior-living operator. Ingrid runs operations and posted about caregiver shortages this week.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Ingrid, I read your post about caregiver shortages at Stillhollow Living. How are open shifts getting filled right now?",
      },
    ],
  },

  signals: {
    h2: "Hospitals signal the gaps you fill.",
    cards: [
      {
        kind: "stack",
        title: "EHRs named in job posts",
        body: "Pancake finds hospitals and clinics whose job posts name the EHR your product plugs into.",
        watching: ["Epic", "Cerner", "athenahealth"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Clinics hiring admin roles",
        body: "Scheduler, coder and prior auth job posts lead Pancake to the clinic, never to a staffing agency.",
        watching: ["Medical scheduler", "Prior auth specialist"],
        more: 3,
      },
      {
        kind: "keyword",
        title: "Leaders posting about no-shows",
        body: "Operations and nursing leaders arrive with the post that flagged them.",
        watching: ["patient no-shows", "prior authorization"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Voices health leaders follow",
        body: "Pancake keeps the operations and IT leaders who engage with health-system voices.",
        watching: ["Winslow Tregear", "Imogen Faircloth"],
        more: 2,
      },
    ],
  },

  faq: [
    {
      q: "Does Pancake touch patient data?",
      a: "No. Pancake never sees patient records. It works from what health leaders post and the roles their teams open.",
    },
    {
      q: "Can it find single-doctor practices?",
      a: "Rarely. Solo practitioners seldom post or keep an active profile. Hospitals, clinic groups and senior-living operators show up far more often.",
    },
    {
      q: "Will it reach clinicians who can’t buy?",
      a: "Not if you name your buyers. Put roles like CIO or VP Patient Access in your Brain, and Pancake judges every lead against them. Your rejections sharpen it.",
    },
    {
      q: "Can it map a hospital’s whole buying committee?",
      a: "No. When a hospital matches on Hiring or Stack, Pancake brings the one or two people who best fit your buyer roles. People signals bring whoever posted or engaged.",
    },
  ],

  related: ["saas-startups", "ai-startups", "legal-tech-startups", "hr-tech-startups"],

  cta: { title: "Reach the hospital buyer." },
};
