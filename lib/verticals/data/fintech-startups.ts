// lib/verticals/data/fintech-startups.ts — paying (AI bookkeeping; predictive analytics for insurers and
// advisers; an SME business platform) + churned fraud/AML, embedded-banking and FP&A tools. Merged in: insurtech.
// Caveat (brief): no per-message approval (draft mode unshipped), said plainly for regulated sellers.
// No revenue, credit, banking or funding data. Stack = tools named in job posts (company-level, OR).
// Every person, company, rival fintech, expert and workspace below is invented; SAP Concur, Expensify,
// Bill.com, NetSuite and Coupa are real tools that appear in finance job posts (Stack signal).
import type { VerticalConfig } from "../types";

export const fintechStartups: VerticalConfig = {
  slug: "fintech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "fintech startups",
    title: "Fintech startups",
    short: "fintech founders",
    badge: "For fintech startups",
  },

  meta: { seoTitle: "Pancake for Fintech Startups: Finance Teams, Found Daily" },

  hubLine: "Find finance teams hiring AP staff or posting about the close.",

  hero: {
    h1: ["You build for CFOs", "We bring you customers"],
    lede: "Pancake finds finance teams hiring AP staff or naming your rival tool in job posts. You get the controller who signs.",
  },

  workspace: { name: "Settleworth", sender: "Adrian Mowbray" },

  demo: {
    h2: "Your buyer runs the month-end close.",
    prompts: [
      {
        kind: "hiring",
        text: "We automate AP. Find US companies with 200 to 1,000 people hiring accounts payable staff.",
        reply: "I'll watch AP job posts at US companies that size, then find the finance leader.",
        proposal: [
          { kind: "hiring", items: ["Accounts payable specialist", "AP clerk", "Billing specialist"] },
          { kind: "stack", items: ["Bill.com", "NetSuite"] },
          { kind: "keyword", items: ["invoice processing", "AP backlog"] },
          { kind: "competitor", items: ["Paywharf", "Duebright"] },
        ],
        leads: [
          { name: "Gabriel Nnadi", role: "Controller", company: "Marlowe Foods", kind: "hiring", signal: "AP specialist role open" },
          { name: "Mariko Endo", role: "VP Finance", company: "Bellhaven", kind: "hiring", signal: "2 AP clerk roles open" },
          { name: "Lamar Pettiford", role: "CFO", company: "Grainhouse", kind: "keyword", signal: "Posted on AP backlog" },
          { name: "Radoslaw Pietrzak", role: "Finance Director", company: "Vantress", kind: "stack", signal: "NetSuite in job posts" },
          { name: "Aaliyah Merriweather", role: "CFO", company: "Osterly", kind: "competitor", signal: "Liked a Paywharf post" },
        ],
        featured: {
          why: "Marlowe Foods is a 480-person US food distributor with an AP specialist role open. Gabriel is the controller and oversees payables.",
          confidence: 92,
          seniority: "Director",
        },
        message:
          "Hi Gabriel, saw Marlowe Foods is hiring an AP specialist. We automate invoice capture and approvals for food distributors, so new hires work exceptions instead of keying invoices. Worth a short call?",
      },
      {
        kind: "stack",
        text: "We replace SAP Concur. Find US companies of 100 to 500 people that ask for it in job posts.",
        reply: "I'll flag job posts that ask for Concur or Expensify, then find who runs finance.",
        proposal: [
          { kind: "stack", items: ["SAP Concur", "Expensify"] },
          { kind: "hiring", items: ["Travel and expense analyst", "Staff accountant"] },
          { kind: "keyword", items: ["expense reports", "corporate cards"] },
        ],
        leads: [
          { name: "Leticia Barrow", role: "VP Finance", company: "Pattendale", kind: "stack", signal: "SAP Concur in job posts" },
          { name: "Joon Byun", role: "Controller", company: "Wrightson Labs", kind: "stack", signal: "Expensify in job posts" },
          { name: "Esther Bamgbose", role: "Head of Finance", company: "Cavell", kind: "hiring", signal: "T&E analyst role open" },
          { name: "Ramon Quiroga", role: "CFO", company: "Pelican Ridge", kind: "keyword", signal: "Posted about expenses" },
          { name: "Sigrid Aune", role: "Finance Director", company: "Pendrell", kind: "hiring", signal: "Staff accountant role" },
        ],
        featured: {
          why: "Pattendale is a 260-person US engineering firm. Its staff accountant job post names SAP Concur, and Leticia is the VP Finance.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Leticia, saw Pattendale's staff accountant post asks for SAP Concur. We replace Concur at engineering firms your size, with receipts matched to card spend automatically. Open to a short demo?",
      },
      {
        kind: "keyword",
        text: "Find US controllers and CFOs posting about month-end close. Our software shortens it.",
        reply: "I'll watch posts about month-end close and keep finance leaders at US companies.",
        proposal: [
          { kind: "keyword", items: ["month-end close", "close checklist", "reconciliations"] },
          { kind: "influencer", items: ["Odette Brannock", "Silas Okpara"] },
          { kind: "hiring", items: ["Senior accountant", "Revenue accountant"] },
        ],
        leads: [
          { name: "Keisha Danforth", role: "Controller", company: "Wendling", kind: "keyword", signal: "Posted on month-end" },
          { name: "Emil Bartosz", role: "CFO", company: "Selbourne", kind: "keyword", signal: "Reconciliation post" },
          { name: "Tamara Yusupova", role: "VP Finance", company: "Lanyon", kind: "influencer", signal: "Liked a Brannock post" },
          { name: "Obafemi Lawal", role: "Head of Finance", company: "Quarlton", kind: "hiring", signal: "Revenue accountant role" },
          { name: "Inés Arriaga", role: "Finance Lead", company: "Hatterly", kind: "keyword", signal: "Close checklist post" },
        ],
        featured: {
          why: "Wendling is a 310-person US logistics software company. Keisha is the controller and posted this week about a slow month-end close.",
          confidence: 89,
          seniority: "Director",
        },
        message:
          "Hi Keisha, saw your post about month-end close at Wendling. Reconciliations are usually where the days go. We automate them for finance teams your size. Open to comparing notes on your close?",
      },
    ],
  },

  signals: {
    h2: "Finance teams show their hand.",
    cards: [
      {
        kind: "hiring",
        title: "Companies adding AP staff",
        body: "Pancake reads AP and billing job posts, then finds the controller or CFO at that company.",
        watching: ["AP specialist", "Billing specialist", "Payroll specialist"],
        more: 2,
      },
      {
        kind: "stack",
        title: "The incumbent, in job posts",
        body: "Pancake flags companies that ask for SAP Concur, Expensify or Bill.com in their finance job posts.",
        watching: ["SAP Concur", "Expensify", "Bill.com", "Coupa"],
      },
      {
        kind: "keyword",
        title: "Controllers posting about close",
        body: "A controller's post about a slow close becomes a lead, and the first message starts from it.",
        watching: ["AP backlog", "cash flow", "month-end close"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Commenters on rival fintechs",
        body: "Pancake watches rival fintechs' company pages and keeps the finance leaders who engage.",
        watching: ["Paywharf", "Duebright", "Spendlane"],
      },
    ],
  },

  faq: [
    {
      q: "Will it find the AP clerk instead of the CFO?",
      a: "No. The job post points to the company. Pancake then looks there for your buyer roles, like the controller or CFO.",
    },
    {
      q: "Can we target companies that bank with a rival?",
      a: "No. Banking relationships aren't public. Stack sees only tools named in job posts, like SAP Concur or NetSuite.",
    },
    {
      q: "Can compliance sign off on each message first?",
      a: "No. Messages send on their own once a lead joins the campaign. Have compliance vet your Brain voice first, and pause the campaign whenever they need.",
    },
    {
      q: "Can it find buyers at banks and insurers?",
      a: "Yes, if their people are active on LinkedIn or their job posts match your signals. Name the institution type in your Brain, like US credit unions, and each lead is checked against it.",
    },
  ],

  related: ["fractional-cfos", "saas-startups", "legal-tech-startups", "ai-startups"],

  cta: { title: "Make the CFO's shortlist." },
};
