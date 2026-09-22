// lib/verticals/data/legal-tech-startups.ts — paying (a legal-workflow AI that sells to in-house legal teams)
// + design partners selling to law firms (immigration-law AI; workforce analytics for firms).
// Caveat (brief): law firms and legal teams as B2B buyers only, never consumers seeking a lawyer.
// Country-level targeting; no bar-admission or state filter. Stack = tools named in job posts (OR).
// Prompts cover three buyers: immigration firms (intake), mid-size firms on Clio (billing), in-house GCs (contracts).
// Every person, firm, company, expert and workspace below is invented; Clio, Clio Manage, iManage,
// NetDocuments and MyCase are real practice tools that appear in law firm job posts (Stack signal).
import type { VerticalConfig } from "../types";

export const legalTechStartups: VerticalConfig = {
  slug: "legal-tech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "legal tech startups",
    title: "Legal tech startups",
    short: "legal tech founders",
    badge: "For legal tech startups",
  },

  meta: { seoTitle: "Pancake for Legal Tech Startups: Find Law Firm Buyers" },

  hubLine: "Find law firms hiring paralegals and GCs posting on contracts.",

  hero: {
    h1: ["You build for lawyers", "We bring you customers"],
    lede: "Pancake finds law firms hiring paralegals or asking for Clio in job posts. You reach the partner who decides.",
  },

  workspace: { name: "Pleadwell", sender: "Celia Ndiaye" },

  demo: {
    h2: "Describe the firm. Meet the partner.",
    prompts: [
      {
        kind: "hiring",
        text: "Our intake tool serves immigration firms. Find US immigration law firms hiring paralegals.",
        reply: "I'll watch paralegal job posts at US immigration firms, then find the managing partner.",
        proposal: [
          { kind: "hiring", items: ["Immigration paralegal", "Legal intake specialist", "Legal assistant"] },
          { kind: "keyword", items: ["client intake", "immigration practice"] },
          { kind: "competitor", items: ["Visaloop", "Intakery"] },
        ],
        leads: [
          { name: "Farida Kasraei", role: "Managing Partner", company: "Kasraei Law", kind: "hiring", signal: "Paralegal role open" },
          { name: "Graciela Montoya", role: "COO", company: "Arbelo Law", kind: "hiring", signal: "2 paralegal roles open" },
          { name: "Wynn Tabachnik", role: "Partner", company: "Tabachnik Law", kind: "keyword", signal: "Posted on client intake" },
          { name: "Shonda Merriam", role: "Practice Manager", company: "Beckley Law", kind: "competitor", signal: "Liked a Visaloop post" },
          { name: "Ansel Okoro", role: "Managing Attorney", company: "Bloch Rhee", kind: "hiring", signal: "Intake specialist role" },
        ],
        featured: {
          why: "Kasraei Law is a 40-person US immigration firm with a paralegal role open. Farida is the managing partner and runs the practice.",
          confidence: 90,
          seniority: "Founder",
        },
        message:
          "Hi Farida, saw Kasraei Law is hiring a paralegal. In immigration practices, intake calls and forms eat a big share of paralegal time. We automate intake for immigration firms, from first form to case file. Worth a look while you hire?",
      },
      {
        kind: "stack",
        text: "Our billing tool plugs into Clio. Find US law firms of 10 to 100 people whose job posts list it.",
        reply: "I'll find firms whose job posts name Clio, then the partner or COO who runs the firm.",
        proposal: [
          { kind: "stack", items: ["Clio", "Clio Manage"] },
          { kind: "hiring", items: ["Legal billing specialist", "Legal assistant"] },
          { kind: "keyword", items: ["billable hours", "time entry"] },
        ],
        leads: [
          { name: "Meera Thakkar", role: "COO", company: "Pellbrook Legal", kind: "stack", signal: "Clio in job posts" },
          { name: "Dorin Vasilescu", role: "Partner", company: "Vasilescu Law", kind: "stack", signal: "Clio Manage in job posts" },
          { name: "Amara Lindell", role: "Ops Director", company: "Kinnear Law", kind: "hiring", signal: "Billing role open" },
          { name: "Chase Pemberton", role: "Partner", company: "Tarrant Loew", kind: "keyword", signal: "Posted on time entry" },
          { name: "Yesenia Ruelas", role: "Administrator", company: "Galvez Law", kind: "stack", signal: "Clio in job posts" },
        ],
        featured: {
          why: "Pellbrook Legal is a 60-person US litigation firm whose legal assistant job post names Clio. Meera is the COO and owns firm operations.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Meera, saw Pellbrook Legal's legal assistant post lists Clio. Our tool plugs into Clio and turns calendar entries into draft time entries, so fewer hours go unbilled. Worth a short demo for your team?",
      },
      {
        kind: "keyword",
        text: "We speed up contract review. Find US general counsels posting about contract backlogs.",
        reply: "I'll watch posts about contract review and keep in-house legal leaders at US companies.",
        proposal: [
          { kind: "keyword", items: ["contract review", "contract backlog", "legal front door"] },
          { kind: "influencer", items: ["Imelda Strauss", "Rupert Kanagawa"] },
          { kind: "hiring", items: ["Contracts manager", "Legal operations analyst"] },
        ],
        leads: [
          { name: "Sienna Cavendish", role: "General Counsel", company: "Norwick", kind: "keyword", signal: "Contract backlog post" },
          { name: "Andrés Bustamante", role: "Deputy GC", company: "Pallister", kind: "keyword", signal: "Contract review post" },
          { name: "Mai Nguyen-Ross", role: "Legal Ops Lead", company: "Rennick", kind: "influencer", signal: "Liked a Strauss post" },
          { name: "Terrell Blackwood", role: "VP Legal", company: "Brisemont", kind: "hiring", signal: "Contracts manager role" },
          { name: "Liesl Brandvik", role: "Head of Legal", company: "Everbrook", kind: "keyword", signal: "Legal front door post" },
        ],
        featured: {
          why: "Norwick is a 700-person US software company. Sienna is the general counsel and posted this week about a growing contract backlog.",
          confidence: 88,
          seniority: "C-level",
        },
        message:
          "Hi Sienna, saw your post about the contract backlog at Norwick. NDAs and standard sales paper usually fill most of that queue. We review those against your playbook, so your team keeps the hard ones. Open to a short call?",
      },
    ],
  },

  signals: {
    h2: "Busy firms hire in public.",
    cards: [
      {
        kind: "hiring",
        title: "Firms hiring paralegals",
        body: "Paralegal and intake job posts point Pancake to the firm, then to the partner who runs it.",
        watching: ["Paralegal", "Intake specialist", "Legal assistant"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Practice tools in job posts",
        body: "When a firm's job post asks for Clio or iManage, Pancake brings you the firm's COO or managing partner.",
        watching: ["Clio", "iManage", "NetDocuments", "MyCase"],
      },
      {
        kind: "keyword",
        title: "Lawyers posting about intake",
        body: "Partners and legal ops leads who post about intake or billable hours become leads.",
        watching: ["client intake", "billable hours", "contract review"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Voices partners follow",
        body: "Lawyers who react to legal innovation voices become leads when their firm fits your Brain.",
        watching: ["Imelda Strauss", "Rupert Kanagawa"],
        more: 3,
      },
    ],
  },

  faq: [
    {
      q: "Are lawyers even reachable on LinkedIn?",
      a: "Firm leaders who post, engage or hire show up. Solo practitioners who stay quiet on LinkedIn are hard to find.",
    },
    {
      q: "Can we target one practice area?",
      a: "Yes. Describe it in your Brain, like immigration firms with 10 to 50 people, and each lead is checked against it.",
    },
    {
      q: "Do in-house legal teams count, or only law firms?",
      a: "Both. Point your Brain at general counsels and legal ops leads inside companies, and leads come from there.",
    },
    {
      q: "Can I target one state?",
      a: "Not reliably. Country is the filter that holds. Name your state in the Brain, and reject any lead outside it so the Brain learns.",
    },
  ],

  related: ["hr-tech-startups", "fintech-startups", "healthtech-startups", "saas-startups", "ai-startups"],

  cta: { title: "Skip the front desk." },
};
