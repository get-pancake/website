// lib/verticals/data/consultants.ts — flagship page (paying: product-analytics, e-commerce data and
// AI-transformation consultancies). Merged in: management consultants, boutique advisory firms.
// Caveat (brief): every example names a specialty and a buyer. No referral-replacement promises.
// Stack = company-level (tools named in the company's job posts), so no "why" or message cites one post.
// Every person, company, rival firm, expert and workspace below is invented.
import type { VerticalConfig } from "../types";

export const consultants: VerticalConfig = {
  slug: "consultants",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "consultants",
    title: "Consultants",
    short: "consultants",
    badge: "For consultants",
  },

  meta: { seoTitle: "Pancake for Consultants: Execs Posting Your Problem" },

  hubLine: "Find executives posting about the problem you solve.",

  hero: {
    title: "Find executives writing about the problem you fix.",
    lede: "Pancake reads comments under your posts and job openings in your niche. Each lead arrives with its reason, so you open warm.",
  },

  workspace: { name: "Halloran Advisory", sender: "Claire Halloran" },

  demo: {
    h2: "Tell Pancake what you fix.",
    prompts: [
      {
        kind: "keyword",
        text: "I fix ops at scale-ups. Find US COOs at 50-300-person firms posting about scaling pains.",
        reply: "I’ll watch COO posts about scaling pains and keep companies with 50 to 300 people.",
        proposal: [
          { kind: "keyword", items: ["scaling pains", "process improvement", "ops bottlenecks"] },
          { kind: "hiring", items: ["Operations manager", "Program manager"] },
          { kind: "influencer", items: ["Ruth Ambler", "Garrett Solano"] },
        ],
        leads: [
          { name: "Lorraine Ogunbiyi", role: "COO", company: "Quarrystone", kind: "keyword", signal: "Posted on scaling pains" },
          { name: "Wesley Abernethy", role: "VP Operations", company: "Brightkiln", kind: "keyword", signal: "Posted on bottlenecks" },
          { name: "Farah Qureshi", role: "COO", company: "Fenwright Care", kind: "hiring", signal: "Operations manager role" },
          { name: "Declan Ruzicka", role: "Chief of Staff", company: "Hobnail Works", kind: "influencer", signal: "Liked an Ambler post" },
          { name: "Imani Rowe", role: "Founder & CEO", company: "Clayridge", kind: "hiring", signal: "Program manager role" },
        ],
        featured: {
          why: "Quarrystone is a 140-person US logistics software company. Lorraine runs operations and posted this week about scaling pains.",
          confidence: 89,
          seniority: "C-level",
        },
        message:
          "Hi Lorraine, your post on scaling pains at Quarrystone stuck with me. Which handoff is slipping first?",
      },
      {
        kind: "stack",
        text: "I set up product analytics. Find US startups whose job posts mention Mixpanel or Amplitude.",
        reply: "I’ll find startups whose job posts name those tools, then the product leader at each.",
        proposal: [
          { kind: "stack", items: ["Mixpanel", "Amplitude"] },
          { kind: "hiring", items: ["Product analyst", "Growth product manager"] },
          { kind: "keyword", items: ["product analytics", "tracking plan"] },
        ],
        leads: [
          { name: "Kwabena Adjei", role: "Head of Product", company: "Fablewick", kind: "stack", signal: "Mixpanel in job posts" },
          { name: "Colette Ravenscroft", role: "VP Product", company: "Glimmerdeck", kind: "stack", signal: "Amplitude in job posts" },
          { name: "Rohan Deshpande", role: "Head of Growth", company: "Pinecroft Labs", kind: "hiring", signal: "Product analyst role" },
          { name: "Tamsin Brzezinski", role: "CPO", company: "Veldtmark", kind: "keyword", signal: "Posted on analytics" },
          { name: "Eliot Furukawa", role: "VP Growth", company: "Kestrelbay", kind: "hiring", signal: "Growth PM role open" },
        ],
        featured: {
          why: "Fablewick is a 70-person US software startup whose job posts name Mixpanel. Kwabena leads the product team.",
          confidence: 87,
          seniority: "Head",
        },
        message:
          "Hi Kwabena, good to be connected. I set up product analytics for startups, and every team swears by a different number. Which one do you check first each morning?",
      },
      {
        kind: "own_brand",
        text: "Founders comment on my pricing posts. Turn the ones at US B2B software companies into leads.",
        reply: "I’ll watch who engages with your posts and keep founders at US B2B software companies.",
        proposal: [
          { kind: "own_brand", items: ["Claire Halloran", "Halloran Advisory"] },
          { kind: "keyword", items: ["usage-based pricing", "pricing page"] },
          { kind: "influencer", items: ["Nadine Kovac"] },
          { kind: "competitor", items: ["Marrowby Pricing"] },
        ],
        leads: [
          { name: "Benedict Oduya", role: "Founder & CEO", company: "Graniteleaf", kind: "own_brand", signal: "Commented on a post" },
          { name: "Priscilla Yuen", role: "CEO", company: "Shoalworks", kind: "own_brand", signal: "Liked a Halloran post" },
          { name: "Mateo Galarza", role: "Head of Revenue", company: "Coldspire", kind: "keyword", signal: "Posted on usage pricing" },
          { name: "Hollis Vandermeer", role: "CRO", company: "Moorbeck", kind: "influencer", signal: "Liked a Kovac post" },
          { name: "Yara Nassif", role: "COO", company: "Lanternfield", kind: "competitor", signal: "Liked a Marrowby post" },
        ],
        featured: {
          why: "Graniteleaf is a 60-person US B2B software company. Benedict is the CEO and commented on your pricing post this week.",
          confidence: 92,
          seniority: "Founder",
        },
        message:
          "Hi Benedict, good to see your comment on my pricing post. How does Graniteleaf price today, per seat or by usage?",
      },
    ],
  },

  signals: {
    h2: "Your buyers post the problem first.",
    cards: [
      {
        kind: "keyword",
        title: "Executives naming your problem",
        body: "Pancake finds executives who post about the problem you fix, and each lead shows the post.",
        watching: ["scaling pains", "pricing page", "tracking plan"],
        more: 3,
      },
      {
        kind: "own_brand",
        title: "Buyers in your comments",
        body: "Pancake reads who reacts to your posts and keeps the executives at companies your practice serves.",
        watching: ["Claire Halloran", "Halloran Advisory"],
      },
      {
        kind: "hiring",
        title: "Job posts that signal the need",
        body: "Pancake reads job posts for roles tied to your specialty, then finds the executive you’d pitch.",
        watching: ["Operations manager", "Head of Strategy", "Business analyst"],
        more: 1,
      },
      {
        kind: "stack",
        title: "Tools you know, in job posts",
        body: "Name the tools you consult on, and Pancake finds companies whose job posts ask for them.",
        watching: ["Mixpanel", "Amplitude", "Salesforce"],
      },
    ],
  },

  faq: [
    {
      q: "I run a one-person practice. Is this too much?",
      a: "No. New leads arrive each morning, and you pick which ones join your campaign. Approve three a week or thirty.",
    },
    {
      q: "Won’t outreach hurt a reputation built on referrals?",
      a: "Not when it reads like a peer. Each message is short, in your Brain voice, and never a pitch. Nobody hears from you until you approve them.",
    },
    {
      q: "Can it stick to my niche?",
      a: "Yes. Your Brain holds the industries, company sizes and roles you serve. Pancake checks each lead against it and shows why it fits.",
    },
    {
      q: "My specialty has no job title. Which signals fit?",
      a: "Start with Keyword and Competitor. They find executives posting about your problem or engaging with firms like yours. Hiring is opt-in, so you can leave it off.",
    },
  ],

  related: ["fractional-cmos", "fractional-cfos", "hr-consultants", "data-consultancies", "executive-coaches"],

  cta: { title: "Someone needs your fix." },
};
