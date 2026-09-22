// lib/verticals/data/corporate-training-companies.ts — paying (a trust-based leadership-programme
// firm, the only payer; not also counted under executive-coaches) + trials (psychology-led sales
// training, an L&D professional body, a sales-training firm). Merged in: L&D providers,
// leadership and sales-training firms.
// Caveat (brief): enterprise cycles. No promises of contracts or meetings: Pancake starts
// conversations with L&D and enablement leaders. Stack is OR and company-level (no "L&D job posts").
// Every person, company, rival firm, expert and workspace below is invented.
import type { VerticalConfig } from "../types";

export const corporateTrainingCompanies: VerticalConfig = {
  slug: "corporate-training-companies",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "corporate training companies",
    title: "Corporate training companies",
    short: "training companies",
    badge: "For training companies",
  },

  meta: { seoTitle: "Pancake for Corporate Training Companies: Reach L&D Leaders" },

  hubLine: "Find L&D leaders posting about manager training.",

  hero: {
    h1: ["You train their teams", "We bring you clients"],
    lede: "Pancake finds L&D leaders posting about manager training, and companies hiring enablement roles. Get in before the RFP.",
  },

  workspace: { name: "Wendover Learning", sender: "Monica Wendover" },

  demo: {
    h2: "Start from the program you sell.",
    prompts: [
      {
        kind: "hiring",
        text: "We run sales training. Find US firms of 500 to 5,000 people hiring a sales enablement manager.",
        reply: "I'll watch job posts for enablement roles at US companies with 500 to 5,000 people.",
        proposal: [
          { kind: "hiring", items: ["Sales enablement manager", "Sales trainer"] },
          { kind: "stack", items: ["Highspot", "Seismic"] },
          { kind: "keyword", items: ["sales onboarding", "ramp time"] },
          { kind: "competitor", items: ["Corbray Training"] },
        ],
        leads: [
          { name: "Warren Ebersole", role: "VP Sales", company: "Norvale Systems", kind: "hiring", signal: "Enablement role open" },
          { name: "Jessamyn Clarke", role: "CRO", company: "Trevanion Cloud", kind: "hiring", signal: "Sales trainer role" },
          { name: "Rahul Menon", role: "Head of Sales", company: "Drumlin Pay", kind: "stack", signal: "Highspot in job posts" },
          { name: "Colleen Brady", role: "VP Sales", company: "Silverfen", kind: "keyword", signal: "Posted on sales ramp" },
          { name: "Mason Trujillo", role: "Enablement Lead", company: "Kilbride", kind: "competitor", signal: "Liked a Corbray post" },
        ],
        featured: {
          why: "Norvale Systems is a 1,400-person US software company hiring a sales enablement manager. Warren runs sales and owns the hire.",
          confidence: 91,
          seniority: "VP",
        },
        message:
          "Hi Warren, saw Norvale is hiring a sales enablement manager. Whoever takes that seat inherits onboarding on day one. We run sales onboarding programs for teams your size, so the new hire starts with a playbook. Worth a short call before they start?",
      },
      {
        kind: "keyword",
        text: "Find US L&D leaders posting about manager training or upskilling. We run those programs.",
        reply: "I'll watch posts on manager training and upskilling from L&D leaders at US companies.",
        proposal: [
          { kind: "keyword", items: ["manager training", "upskilling", "new manager program"] },
          { kind: "influencer", items: ["Josefina Arbuckle", "Anand Venkatraman"] },
          { kind: "competitor", items: ["Foxmere Learning"] },
          { kind: "hiring", items: ["L&D manager"] },
        ],
        leads: [
          { name: "Lauren Pickard", role: "Head of L&D", company: "Meadowmark", kind: "keyword", signal: "Posted on training" },
          { name: "Omari Jefferson", role: "VP Talent", company: "Halverson Mutual", kind: "keyword", signal: "Posted on upskilling" },
          { name: "Marit Tierney", role: "L&D Director", company: "Stallard Retail", kind: "influencer", signal: "Liked an Arbuckle post" },
          { name: "Tomasz Wierzbicki", role: "VP People", company: "Vantmoor Energy", kind: "competitor", signal: "Liked a Foxmere post" },
          { name: "Keiko Asano", role: "CHRO", company: "Ashby Savings Bank", kind: "hiring", signal: "L&D manager role open" },
        ],
        featured: {
          why: "Meadowmark is a 2,100-person US care provider. Lauren leads L&D and posted this week about training new managers.",
          confidence: 89,
          seniority: "Head",
        },
        message:
          "Hi Lauren, saw your post about training new managers at Meadowmark. Most new managers get the title months before they get any training. We run manager programs for care providers your size. Open to a short call on how you train them today?",
      },
      {
        kind: "stack",
        text: "We build courses for Docebo and Cornerstone. Find US companies whose job posts name either.",
        reply: "I'll find US companies whose job posts name Docebo or Cornerstone, then the L&D lead.",
        proposal: [
          { kind: "stack", items: ["Docebo", "Cornerstone"] },
          { kind: "hiring", items: ["Instructional designer", "LMS administrator"] },
          { kind: "keyword", items: ["new LMS", "course library"] },
        ],
        leads: [
          { name: "Cedric Ambrose", role: "Head of Learning", company: "Pettiward", kind: "stack", signal: "Docebo in job posts" },
          { name: "Fiona MacAllister", role: "Head of L&D", company: "Graylock Care", kind: "stack", signal: "Cornerstone in job posts" },
          { name: "Daniel Cho", role: "L&D Manager", company: "Hollowell Foods", kind: "hiring", signal: "Instructional designer" },
          { name: "Adriana Solis", role: "LMS Manager", company: "Lowther Health", kind: "keyword", signal: "Posted on a new LMS" },
          { name: "Grant Holcomb", role: "VP People", company: "Bexley Components", kind: "hiring", signal: "LMS admin role open" },
        ],
        featured: {
          why: "Pettiward is an 850-person US insurer. Its instructional designer job post names Docebo, and Cedric runs learning.",
          confidence: 87,
          seniority: "Head",
        },
        message:
          "Hi Cedric, saw Pettiward is hiring an instructional designer who knows Docebo. One designer can only build so many courses at once. We build Docebo courses for L&D teams, so launches don’t wait on the hire. Want a sample module?",
      },
    ],
  },

  signals: {
    h2: "Programs start with a post or a hire.",
    cards: [
      {
        kind: "keyword",
        title: "L&D leaders naming the gap",
        body: "Pancake finds People and L&D leaders posting about manager training or upskilling, with the post attached.",
        watching: ["manager training", "upskilling"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "Companies building L&D teams",
        body: "Job posts for L&D and enablement roles bring you the People or sales leader behind each hire.",
        watching: ["L&D manager", "Enablement manager"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Learning tools in job posts",
        body: "Companies whose job posts ask for the learning platform you build on come with their L&D lead.",
        watching: ["Docebo", "Cornerstone", "Workday Learning", "Highspot"],
      },
      {
        kind: "competitor",
        title: "L&D leaders on rivals’ posts",
        body: "Pancake watches rival training firms’ pages and keeps the L&D leaders who react or comment.",
        watching: ["Corbray Training", "Foxmere Learning"],
      },
    ],
  },

  faq: [
    {
      q: "Our deals go through procurement. Does this help?",
      a: "Yes, at the start. Pancake finds the L&D leader who scopes the program and opens the conversation. Procurement comes once they want you.",
    },
    {
      q: "Can it tell when a training budget resets?",
      a: "No. Pancake can’t see budgets or fiscal years. It finds leaders posting about training needs or hiring learning roles, and the timing call stays yours.",
    },
    {
      q: "We sell sales training. Can it find sales leaders?",
      a: "Yes. Put VP Sales and enablement leads in your Brain as buyers. Pancake checks every lead against those roles, so sales leaders come through alongside L&D.",
    },
    {
      q: "Can our whole team use it?",
      a: "Yes. Seats are unlimited. Outreach sends from one LinkedIn account per workspace, so pick the name your buyers should see.",
    },
  ],

  related: ["executive-coaches", "hr-consultants", "event-agencies", "consultants"],

  cta: { title: "Meet the L&D lead first." },
};
