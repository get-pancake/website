// lib/verticals/data/hr-tech-startups.ts — paying (HR software for small businesses) + design partners
// (workforce analytics sold to CHROs; an HR framework) + a psychometric-assessment trial.
// Caveat (brief): HRIS detection = job-post mentions only (Stack, company-level, OR). No employee,
// headcount-trend or engagement data. Personio swapped for US HR tools (US-only geography).
// Prompt 2 targets hotel and restaurant groups (the brief's medical groups overlap healthtech-startups).
// Every person, company, rival HR tool, expert and workspace below is invented; BambooHR, Paylocity,
// UKG Pro and Workday are real HR systems that appear in job posts (Stack signal).
import type { VerticalConfig } from "../types";

export const hrTechStartups: VerticalConfig = {
  slug: "hr-tech-startups",
  status: "approved",
  category: "Vertical software",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "HR tech startups",
    title: "HR tech startups",
    short: "HR tech founders",
    badge: "For HR tech startups",
  },

  meta: { seoTitle: "Pancake for HR Tech Startups: Reach People Leaders" },

  hubLine: "Find People leaders at firms naming BambooHR in job posts.",

  hero: {
    title: "Find HR leaders whose job posts name a rival suite.",
    lede: "Pancake tracks HR openings, rival HR suites’ pages and turnover talk on LinkedIn. You get the buyer and why they fit.",
  },

  workspace: { name: "Stayforth", sender: "Jonas Aldecoa" },

  demo: {
    h2: "Start with the HRIS they hire for.",
    prompts: [
      {
        kind: "stack",
        text: "Our HRIS replaces BambooHR. Find US employers with 200 to 1,000 staff whose job posts name it.",
        reply: "I’ll track job posts that name BambooHR and bring you the VP People or CHRO.",
        proposal: [
          { kind: "stack", items: ["BambooHR"] },
          { kind: "hiring", items: ["HR generalist", "People operations specialist"] },
          { kind: "keyword", items: ["HRIS migration", "outgrowing our HRIS"] },
        ],
        leads: [
          { name: "Tamika Holbrook", role: "VP People", company: "Fennimore", kind: "stack", signal: "BambooHR in job posts" },
          { name: "Arvind Mehrotra", role: "CHRO", company: "Pennfield", kind: "stack", signal: "BambooHR in job posts" },
          { name: "Bethany Crowe", role: "HR Director", company: "Penhallow", kind: "hiring", signal: "People ops role open" },
          { name: "Julio Marroquín", role: "Head of People", company: "Glenmoor", kind: "keyword", signal: "HRIS migration post" },
          { name: "Keiko Fairchild", role: "HRIS Manager", company: "Tollbrook", kind: "hiring", signal: "HR generalist role open" },
        ],
        featured: {
          why: "Fennimore is a 450-person US property management company whose HR generalist job post names BambooHR. Tamika is the VP People.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Tamika, happy to be connected. My team makes HR software for People teams. What’s the one report you still build by hand?",
      },
      {
        kind: "keyword",
        text: "Find US CHROs at hotel and restaurant groups posting about turnover. That’s our market.",
        reply: "I’ll watch posts about turnover and keep People leaders at US hospitality groups.",
        proposal: [
          { kind: "keyword", items: ["employee turnover", "frontline retention", "stay interviews"] },
          { kind: "influencer", items: ["Winona Taggart", "Ruben Hakobyan"] },
          { kind: "hiring", items: ["HR business partner", "Employee relations manager"] },
        ],
        leads: [
          { name: "Denise Wilburn", role: "CHRO", company: "Larkmead Hotels", kind: "keyword", signal: "Hotel turnover post" },
          { name: "Rashad Coleman", role: "VP People", company: "Elmstead Inns", kind: "keyword", signal: "Stay interviews post" },
          { name: "Lourdes Figueroa", role: "HR Director", company: "Harbison Hotels", kind: "influencer", signal: "Liked a Taggart post" },
          { name: "Martin Esterly", role: "Head of People", company: "Ashbury Stays", kind: "hiring", signal: "HRBP role open" },
          { name: "Naledi Dube", role: "CHRO", company: "Southmere Dining", kind: "keyword", signal: "Posted on retention" },
        ],
        featured: {
          why: "Larkmead Hotels is a 1,800-person US hotel group. Denise is the CHRO and posted this week about front-desk turnover.",
          confidence: 91,
          seniority: "C-level",
        },
        message:
          "Hi Denise, I noticed your post about front-desk turnover at Larkmead Hotels. When do most new hires decide to leave?",
      },
      {
        kind: "hiring",
        text: "Our tool cleans HR data. Find US employers of 500 to 5,000 people hiring HRIS analysts.",
        reply: "I’ll watch HRIS job posts at US employers that size, then find the head of People Ops.",
        proposal: [
          { kind: "hiring", items: ["HRIS analyst", "HRIS manager", "People data analyst"] },
          { kind: "stack", items: ["Workday", "UKG Pro"] },
          { kind: "keyword", items: ["HR data quality", "people analytics"] },
        ],
        leads: [
          { name: "Anand Sethuraman", role: "VP People Ops", company: "Kilbarron", kind: "hiring", signal: "HRIS analyst role open" },
          { name: "Gwen Takeda", role: "HRIS Director", company: "Tidewell Foods", kind: "hiring", signal: "HRIS manager role open" },
          { name: "Malcolm Idowu", role: "CHRO", company: "Beckridge", kind: "stack", signal: "Workday in job posts" },
          { name: "Paola Benavides", role: "HR Director", company: "Scarrow", kind: "keyword", signal: "Posted on HR data" },
          { name: "Stellan Voss", role: "Head of HR", company: "Oakhollow", kind: "hiring", signal: "People data role open" },
        ],
        featured: {
          why: "Kilbarron is a 2,400-person US manufacturer with an HRIS analyst role open. Anand runs People Operations and owns that hire.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Anand, glad we’re connected. We build a tool that cleans up HR data. How confident are you in your headcount numbers today?",
      },
    ],
  },

  signals: {
    h2: "People teams talk shop in public.",
    cards: [
      {
        kind: "stack",
        title: "HR systems named in job posts",
        body: "Job posts that ask for BambooHR or Paylocity bring you the company’s People lead, if it fits your ICP.",
        watching: ["BambooHR", "Paylocity", "UKG Pro", "Workday"],
      },
      {
        kind: "keyword",
        title: "CHROs posting about turnover",
        body: "Pancake keeps People leaders who post about turnover or review season, and quotes the post on each lead.",
        watching: ["turnover", "review cycle", "engagement survey"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "The HR writers CHROs follow",
        body: "People leaders who comment on the HR voices you name become leads, if their company fits.",
        watching: ["Winona Taggart", "Ruben Hakobyan"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Competing HR suites",
        body: "Pancake watches the company pages of the HR suites you compete with and keeps the People leaders who react.",
        watching: ["Workvane", "Rosterbird"],
      },
    ],
  },

  faq: [
    {
      q: "Can it tell which HRIS a company runs?",
      a: "Only when a job post names it. Add each HRIS as a Stack tool, and Pancake finds companies whose job posts name any of them.",
    },
    {
      q: "Do you use employee data?",
      a: "No. Pancake never sees HR systems or employee records, only public LinkedIn posts and job ads.",
    },
    {
      q: "Will it reach employees instead of buyers?",
      a: "Each lead is checked against your buyer roles, like VP People or HRIS manager. Reject a miss with a reason, and the Brain learns.",
    },
    {
      q: "Will staffing agencies show up as leads?",
      a: "Not unless you sell to them. Hiring skips jobs that agencies post for clients, and leads at staffing firms are rejected when your Brain rules them out.",
    },
  ],

  related: ["hr-consultants", "legal-tech-startups", "healthtech-startups", "saas-startups", "corporate-training-companies"],

  cta: { title: "Get in front of the CHRO." },
};
