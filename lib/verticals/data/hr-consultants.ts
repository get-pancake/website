// lib/verticals/data/hr-consultants.ts — trials (HCM consulting & recruiting open; HR consulting
// lost; an HR-advisory design partner's feed targets HR consultants). Merged in: fractional HR,
// outsourced HR / PEO advisors.
// Caveat (brief): no headcount-growth or "crossed 50 staff" events: size is an ICP filter, not a
// signal. Hiring = HR/office roles at direct employers (no "first HR hire" as a Hiring claim;
// "first HR hire" stays a Keyword, i.e. what founders post). Stack = payroll/HR tools named in job posts (OR).
// Every person, company, rival firm, expert and workspace below is invented.
import type { VerticalConfig } from "../types";

export const hrConsultants: VerticalConfig = {
  slug: "hr-consultants",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "HR consultants",
    title: "HR consultants",
    short: "HR consultants",
    badge: "For HR consultants",
  },

  meta: { seoTitle: "Pancake for HR Consultants: Founders Who Need HR Help" },

  hubLine: "Find founders hiring HR roles or posting about handbooks.",

  hero: {
    h1: ["You run people ops", "We bring you clients"],
    lede: "Pancake finds small companies hiring HR generalists, and founders posting about reviews or handbooks. Be their HR team first.",
  },

  workspace: { name: "Farnsworth People", sender: "Joelle Farnsworth" },

  demo: {
    h2: "Name the HR work you take on.",
    prompts: [
      {
        kind: "hiring",
        text: "I do HR part-time. Find US companies with 20 to 100 staff posting an HR manager role.",
        reply: "I'll watch job posts for HR roles at US companies with 20 to 100 people.",
        proposal: [
          { kind: "hiring", items: ["HR manager", "HR generalist", "People ops manager"] },
          { kind: "keyword", items: ["employee handbook", "first HR hire"] },
          { kind: "competitor", items: ["Graftwood HR"] },
        ],
        leads: [
          { name: "Shelby Kincaid", role: "COO", company: "Tollgarth Freight", kind: "hiring", signal: "HR manager role open" },
          { name: "Ramón Iturbide", role: "Principal", company: "Kessick Architects", kind: "hiring", signal: "HR generalist role" },
          { name: "Dawn Pritchard", role: "Head of Ops", company: "Halden Supply", kind: "hiring", signal: "People ops role open" },
          { name: "DeShawn Carter", role: "Founder", company: "Fieldvane", kind: "keyword", signal: "Posted on first HR hire" },
          { name: "Yvonne Castellucci", role: "COO", company: "Ferncastle Clinics", kind: "competitor", signal: "Liked a Graftwood post" },
        ],
        featured: {
          why: "Tollgarth Freight is a 70-person US logistics company with an HR manager role open. Shelby is the COO and owns the hire.",
          confidence: 90,
          seniority: "C-level",
        },
        message:
          "Hi Shelby, saw Tollgarth is hiring an HR manager. I run HR part-time for logistics companies your size. Some clients keep me on while they search, then have me help pick the hire. Worth a quick call this week?",
      },
      {
        kind: "keyword",
        text: "Find US founders posting about performance reviews or an employee handbook. I set those up.",
        reply: "I'll watch founder posts on reviews and handbooks at US companies with 20 to 150 people.",
        proposal: [
          { kind: "keyword", items: ["performance reviews", "employee handbook", "PTO policy"] },
          { kind: "influencer", items: ["Beatrice Lusk"] },
          { kind: "hiring", items: ["Office manager"] },
        ],
        leads: [
          { name: "Gabriel Szymanski", role: "Founder & CEO", company: "Tuckett", kind: "keyword", signal: "Posted on reviews" },
          { name: "Meera Sundaram", role: "CEO", company: "Marlstone Studio", kind: "keyword", signal: "Posted on handbooks" },
          { name: "Connor Healy", role: "Co-founder", company: "Barrowby", kind: "influencer", signal: "Liked a Lusk post" },
          { name: "Cherise Beaumont", role: "COO", company: "Gorrick Roasters", kind: "hiring", signal: "Office manager role" },
          { name: "Hugo Echegaray", role: "Founder", company: "Venable Builders", kind: "keyword", signal: "Posted on PTO policy" },
        ],
        featured: {
          why: "Tuckett is a 45-person US software company. Gabriel, the founder and CEO, posted this week about running performance reviews.",
          confidence: 89,
          seniority: "Founder",
        },
        message:
          "Hi Gabriel, saw your post about performance reviews at Tuckett. Reviews run smoother when every manager uses the same rubric and the same dates. I set up review cycles and handbooks for teams your size. Worth a call before your next round?",
      },
      {
        kind: "stack",
        text: "I run HR for small teams on Gusto or Rippling. Find US companies whose job posts name them.",
        reply: "I'll find companies whose job posts name Gusto or Rippling, then the founder or COO.",
        proposal: [
          { kind: "stack", items: ["Gusto", "Rippling", "Justworks"] },
          { kind: "hiring", items: ["Operations manager", "Payroll specialist"] },
          { kind: "keyword", items: ["multi-state compliance"] },
        ],
        leads: [
          { name: "Rebecca Salcedo", role: "Head of Ops", company: "Pennock Goods", kind: "stack", signal: "Gusto in job posts" },
          { name: "August Lindeman", role: "COO", company: "Zephyrine Labs", kind: "stack", signal: "Rippling in job posts" },
          { name: "Khadija Barre", role: "CFO", company: "Brisco Dental Group", kind: "stack", signal: "Justworks in job posts" },
          { name: "Liam Brosnan", role: "Founder & CEO", company: "Harnwell", kind: "hiring", signal: "Ops manager role open" },
          { name: "Esther Kawabata", role: "COO", company: "Calloway Precision", kind: "keyword", signal: "Posted on compliance" },
        ],
        featured: {
          why: "Pennock Goods is an 80-person US e-commerce company whose office manager job post names Gusto. Rebecca runs operations.",
          confidence: 87,
          seniority: "Head",
        },
        message:
          "Hi Rebecca, saw Pennock’s office manager job post lists Gusto. Gusto runs payroll. The handbook, reviews and leave policy still need an owner. I run HR part-time for Gusto teams your size. Open to a short call?",
      },
    ],
  },

  signals: {
    h2: "HR gaps show up in job posts.",
    cards: [
      {
        kind: "hiring",
        title: "Companies posting HR roles",
        body: "Pancake spots HR and office job posts at companies your size and brings you the founder or COO.",
        watching: ["HR manager", "HR generalist", "Office manager"],
        more: 1,
      },
      {
        kind: "keyword",
        title: "Founders posting about HR",
        body: "Pancake finds founders posting about reviews, handbooks or time-off rules, and keeps the post with the lead.",
        watching: ["performance reviews", "PTO policy"],
        more: 3,
      },
      {
        kind: "stack",
        title: "Payroll tools in job posts",
        body: "Companies whose job posts name the payroll tools you work in show up, each with its founder or COO.",
        watching: ["Gusto", "Rippling", "Justworks", "BambooHR"],
      },
      {
        kind: "influencer",
        title: "Founders on HR experts’ posts",
        body: "Pancake keeps the founders who react to the HR and employment-law writers you name.",
        watching: ["Beatrice Lusk", "Terrell Munroe"],
      },
    ],
  },

  faq: [
    {
      q: "Can it spot companies crossing 50 employees?",
      a: "No. Pancake doesn’t track headcount changes. Your Brain sets a size band, like 20 to 150 people, and each lead is checked against it.",
    },
    {
      q: "Won’t the HR team see me as a threat?",
      a: "Set founders, COOs and heads of operations as your buyers. Pancake keeps leads in those roles, so your message reaches whoever owns HR today.",
    },
    {
      q: "Why pitch a company that’s hiring an HR manager?",
      a: "The work doesn’t wait for the hire. Some founders want cover while they search. Others want the basics in place before that person arrives.",
    },
    {
      q: "I advise on PEOs. Can it find companies using one?",
      a: "Only through job posts. If a company’s job posts name Justworks or TriNet, the Stack signal finds it. Pancake can’t see contracts or benefits plans.",
    },
  ],

  related: ["executive-coaches", "corporate-training-companies", "recruiting-agencies", "hr-tech-startups"],

  cta: { title: "Their HR seat is open." },
};
