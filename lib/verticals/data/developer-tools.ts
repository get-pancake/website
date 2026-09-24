// lib/verticals/data/developer-tools.ts — developer tools companies (merged: AI infra startups, open-source companies).
// Every person, company, rival vendor, writer and workspace below is invented.
// Caveat (brief): no GitHub, npm or product-usage data. One sender account per workspace.
import type { VerticalConfig } from "../types";

export const developerTools: VerticalConfig = {
  slug: "developer-tools",
  status: "approved",
  category: "Startups & solo founders",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "devtools startups",
    title: "Devtools startups",
    short: "devtools founders",
    badge: "For devtools startups",
  },

  meta: { seoTitle: "Pancake for Devtools Startups: Reach Engineering Leads" },

  hubLine: "Find engineering teams naming the tool you replace.",

  hero: {
    title: "Find engineering leads who name your rival when hiring.",
    lede: "Pancake reads posts on flaky tests and LLM bills, plus comments on rival vendors’ pages. Your first message starts from their post.",
  },

  workspace: { name: "Runwarden", sender: "Ivar Rask" },

  demo: {
    h2: "Name the bottleneck. Find the team.",
    prompts: [
      {
        kind: "stack",
        text: "Our CI replaces Jenkins. Find US companies with 100 to 1,000 employees whose job posts name it.",
        reply: "I’ll watch job posts that name Jenkins and keep companies with 100 to 1,000 employees.",
        proposal: [
          { kind: "stack", items: ["Jenkins", "CircleCI", "Travis CI"] },
          { kind: "keyword", items: ["slow CI", "flaky tests"] },
          { kind: "hiring", items: ["Build engineer", "DevOps engineer"] },
          { kind: "competitor", items: ["Relaywright CI"] },
        ],
        leads: [
          { name: "Signe Madsen", role: "VP Engineering", company: "Waybright", kind: "stack", signal: "Jenkins in job posts" },
          { name: "Obinna Egwu", role: "Head of Platform", company: "Pinecask", kind: "stack", signal: "CircleCI in job posts" },
          { name: "Magdalena Wojcik", role: "Eng Manager", company: "Quillfeather", kind: "keyword", signal: "Posted on flaky tests" },
          { name: "Cyrus Farahani", role: "CTO", company: "Driftmark", kind: "hiring", signal: "Build engineer role" },
          { name: "Makana Palakiko", role: "Staff Engineer", company: "Wickstone", kind: "competitor", signal: "Liked a Relaywright post" },
        ],
        featured: {
          why: "Waybright is a 340-person US logistics software company whose job posts name Jenkins. Signe leads engineering there.",
          confidence: 90,
          seniority: "VP",
        },
        message:
          "Hi Signe, thanks for the connect. I work on a CI service built for large test suites. How long does a full build take on your team these days?",
      },
      {
        kind: "keyword",
        text: "We route LLM calls. Find AI engineers at US startups posting about LLM costs or rate limits.",
        reply: "I’ll watch posts about LLM costs and rate limits and keep engineers at US startups.",
        proposal: [
          { kind: "keyword", items: ["LLM costs", "rate limits", "model fallback"] },
          { kind: "influencer", items: ["Beatrix Kallio", "Tunde Ashiru"] },
          { kind: "stack", items: ["OpenAI API", "LangChain"] },
          { kind: "competitor", items: ["Throttlebay"] },
        ],
        leads: [
          { name: "Chidinma Uzor", role: "Head of AI", company: "Loomtide", kind: "keyword", signal: "Posted about LLM costs" },
          { name: "Viktor Lazarev", role: "AI Engineer", company: "Lumenkeel", kind: "keyword", signal: "Posted on rate limits" },
          { name: "Soo-ah Baek", role: "ML Engineer", company: "Runnelwood", kind: "influencer", signal: "Liked a Kallio post" },
          { name: "Wendell Bratton", role: "CTO", company: "Mossbank", kind: "stack", signal: "OpenAI API in job posts" },
          { name: "Ximena Sepulveda", role: "Eng Manager", company: "Mintwater", kind: "competitor", signal: "Liked a Throttlebay post" },
        ],
        featured: {
          why: "Loomtide, a 90-person US startup, builds on LLMs. Chidinma leads AI and posted this week about rising LLM costs.",
          confidence: 88,
          seniority: "Head",
        },
        message:
          "Hi Chidinma, you posted about rising LLM costs at Loomtide. What’s driving most of the spend, volume or model choice?",
      },
      {
        kind: "hiring",
        text: "We build an internal developer platform. Find US software companies hiring platform engineers.",
        reply: "I’ll watch US job posts for platform engineers and skip listings from staffing agencies.",
        proposal: [
          { kind: "hiring", items: ["Platform engineer", "DevEx engineer"] },
          { kind: "stack", items: ["Kubernetes", "Terraform", "Backstage"] },
          { kind: "keyword", items: ["developer productivity", "golden paths"] },
          { kind: "influencer", items: ["Tereza Vashenko"] },
        ],
        leads: [
          { name: "Quentin Aldous", role: "VP Engineering", company: "Oxbowline", kind: "hiring", signal: "2 platform roles open" },
          { name: "Nadira Hussain", role: "Head of Infra", company: "Millrace", kind: "hiring", signal: "Platform engineer role" },
          { name: "Marlon Espinoza", role: "Platform Lead", company: "Arcwright", kind: "stack", signal: "Terraform in job posts" },
          { name: "Evangeline Tran", role: "Eng Manager", company: "Spoolhaven", kind: "keyword", signal: "Posted on golden paths" },
          { name: "Rowan Blackstock", role: "Tech Lead", company: "Kindlewood", kind: "influencer", signal: "Liked a Vashenko post" },
        ],
        featured: {
          why: "Oxbowline, a 450-person US fintech, has two platform engineer roles open. Quentin is its VP of Engineering.",
          confidence: 89,
          seniority: "VP",
        },
        message:
          "Hi Quentin, glad we’re connected. We build internal developer platforms. How long does a new engineer take to ship a first change?",
      },
    ],
  },

  signals: {
    h2: "The stack is in the job post.",
    cards: [
      {
        kind: "stack",
        title: "Teams still asking for Jenkins",
        body: "An engineering job post that asks for Jenkins or CircleCI puts the company on your list.",
        watching: ["Jenkins", "CircleCI", "Travis CI"],
        more: 2,
      },
      {
        kind: "keyword",
        title: "Engineers who post the pain",
        body: "A post about flaky tests or a surprise LLM bill puts its author in your leads.",
        watching: ["flaky tests", "slow CI", "LLM costs"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "New platform teams",
        body: "A platform or DevEx opening points to the company itself, never to a staffing agency.",
        watching: ["Platform engineer", "DevEx engineer"],
        more: 2,
      },
      {
        kind: "competitor",
        title: "Engineers on rivals’ posts",
        body: "Engineers who like or comment on a rival vendor’s post become leads once they fit your ICP.",
        watching: ["Relaywright CI", "Throttlebay"],
      },
    ],
  },

  faq: [
    {
      q: "Developers ignore sales outreach. Will this work?",
      a: "Pancake reaches the roles you pick, like engineering managers or heads of platform. It connects without a pitch. When an engineer posted about the problem, the message starts from that post.",
    },
    {
      q: "We’re open source. Can it find our GitHub users?",
      a: "No. Pancake reads posts, comments and job posts, not GitHub, npm or product usage. Point it at your own posts and the problems your users write about instead.",
    },
    {
      q: "Does a job post naming Jenkins mean they still run it?",
      a: "Not always. A job post lists the tools a team wants candidates to know. Pancake can’t see what a team has installed.",
    },
    {
      q: "Can each founder send from their own account?",
      a: "Not from one workspace. Each workspace has one sender, so pick the founder whose profile engineers trust.",
    },
  ],

  related: ["ai-startups", "saas-startups", "cloud-consultancies", "cybersecurity-firms", "solopreneurs"],

  cta: { title: "Your next buyer is on call." },
};
