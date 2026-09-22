// lib/verticals/data/executive-coaches.ts — paying (a leadership coach & speaker) + ~4 trials.
// Merged in: leadership coaches, business coaches. Re-aimed at founders and CEOs (brief review
// #64-70) so it doesn't overlap corporate-training-companies (L&D buyers).
// Caveat (brief): Own brand needs the coach's LinkedIn activity, but no audience is required
// (Keyword, Hiring and Influencer work without posts). No consumer or life-coaching buyers.
// Every person, company, rival firm, author and workspace below is invented.
import type { VerticalConfig } from "../types";

export const executiveCoaches: VerticalConfig = {
  slug: "executive-coaches",
  status: "approved",
  category: "Consultants & advisors",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "executive coaches",
    title: "Executive coaches",
    short: "coaches",
    badge: "For executive coaches",
  },

  meta: { seoTitle: "Pancake for Executive Coaches: Find Coaching Clients" },

  hubLine: "Find CEOs posting about the hard parts of leading.",

  hero: {
    h1: ["You coach leaders", "We bring you clients"],
    lede: "Pancake finds founders and CEOs posting about scaling as a leader, or reacting to your posts. Coach, don’t chase.",
  },

  workspace: { name: "Kovacevic Coaching", sender: "Lydia Kovacevic" },

  demo: {
    h2: "Your practice, in one sentence.",
    prompts: [
      {
        kind: "own_brand",
        text: "I write about founder burnout on LinkedIn. Find the US CEOs who react to those posts.",
        reply: "I'll watch who reacts to your posts and keep founders and CEOs at US companies.",
        proposal: [
          { kind: "own_brand", items: ["Lydia Kovacevic", "Kovacevic Coaching"] },
          { kind: "keyword", items: ["founder burnout", "leading through change"] },
          { kind: "influencer", items: ["Harlan Pettigrew"] },
          { kind: "competitor", items: ["Keelhaven Leadership"] },
        ],
        leads: [
          { name: "Nora Kessling", role: "Founder & CEO", company: "Kellby Health", kind: "own_brand", signal: "Liked your burnout post" },
          { name: "Ahmad Farrokhzad", role: "CEO", company: "Dunmore Analytics", kind: "own_brand", signal: "Commented on a post" },
          { name: "Gwendolyn Sayre", role: "Co-founder & CEO", company: "Moxley Labs", kind: "keyword", signal: "Posted on burnout" },
          { name: "Rodrigo Anzaldúa", role: "COO", company: "Tenmile Robotics", kind: "influencer", signal: "Liked a Pettigrew post" },
          { name: "Kenji Morikawa", role: "CEO", company: "Dunlevy Freight", kind: "competitor", signal: "Liked a Keelhaven post" },
        ],
        featured: {
          why: "Kellby Health is a 110-person US health software company. Nora, its founder and CEO, liked your post on founder burnout this week.",
          confidence: 90,
          seniority: "Founder",
        },
        message:
          "Hi Nora, thanks for the like on my founder burnout post. With the CEOs I coach, it usually shows up once the company outgrows their old calendar. I help them rebuild the week around what only the CEO can do. Want the one-page exercise I start with?",
      },
      {
        kind: "keyword",
        text: "I coach founder-CEOs. Find US startups of 50 to 200 people whose CEO posts about scaling.",
        reply: "I'll watch CEO posts about scaling and keep US startups with 50 to 200 people.",
        proposal: [
          { kind: "keyword", items: ["scaling as a CEO", "first-time CEO", "delegation"] },
          { kind: "influencer", items: ["Sunniva Blake"] },
          { kind: "competitor", items: ["Marchetti Coaching"] },
        ],
        leads: [
          { name: "Bettina Rosenthal", role: "Founder & CEO", company: "Ambrin", kind: "keyword", signal: "Posted on scaling up" },
          { name: "Desmond Kwarteng", role: "CEO", company: "Cindral Data", kind: "keyword", signal: "Posted on delegation" },
          { name: "Heather Quarles", role: "Founder", company: "Ostlund Health", kind: "influencer", signal: "Liked a Blake post" },
          { name: "Sanjay Kothari", role: "CEO", company: "Blueloam Pay", kind: "competitor", signal: "Liked a Marchetti post" },
          { name: "Ruby Anchondo", role: "Founder & CEO", company: "Ivywick", kind: "keyword", signal: "Posted “first-time CEO”" },
        ],
        featured: {
          why: "Ambrin is a 150-person US software startup. Bettina, the founder and CEO, posted this week about scaling as a leader.",
          confidence: 88,
          seniority: "Founder",
        },
        message:
          "Hi Bettina, saw your post about scaling as a CEO at Ambrin. Somewhere past 100 people, the job shifts from doing the work to choosing who does it. I coach founder-CEOs through that shift. Worth a conversation?",
      },
      {
        kind: "hiring",
        text: "I coach new tech leaders. Find US software companies hiring a Head of Engineering or Product.",
        reply: "I'll watch job posts for those leadership roles and find the CEO behind each hire.",
        proposal: [
          { kind: "hiring", items: ["Head of Engineering", "Head of Product", "Director of Operations"] },
          { kind: "keyword", items: ["first 90 days"] },
          { kind: "stack", items: ["Lattice", "Culture Amp"] },
        ],
        leads: [
          { name: "Ibrahim Saleh", role: "CEO", company: "Stonewick Software", kind: "hiring", signal: "Head of Eng role open" },
          { name: "Caroline Vogelsang", role: "VP People", company: "Duskfield Labs", kind: "hiring", signal: "Head of Product role" },
          { name: "Malik Freeman", role: "COO", company: "Gadsden Works", kind: "hiring", signal: "Ops director role open" },
          { name: "Elena Voronova", role: "Chief of Staff", company: "Gildercrest", kind: "keyword", signal: "Posted on first 90 days" },
          { name: "Parker Nakamura", role: "Head of People", company: "Loftridge", kind: "stack", signal: "Lattice in job posts" },
        ],
        featured: {
          why: "Stonewick Software is a 240-person US company hiring a Head of Engineering. Ibrahim is the CEO and owns the hire.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Ibrahim, saw Stonewick is hiring a Head of Engineering. The first 90 days in that seat set the tone for the whole team. I coach new engineering leaders through them. Worth a short call before your hire starts?",
      },
    ],
  },

  signals: {
    h2: "Leaders post about what’s hard.",
    cards: [
      {
        kind: "own_brand",
        title: "CEOs who react to your posts",
        body: "When a founder likes or comments on your post, Pancake checks the fit and adds them as a lead.",
        watching: ["Lydia Kovacevic", "Kovacevic Coaching"],
      },
      {
        kind: "keyword",
        title: "Leaders naming the hard part",
        body: "Pancake finds CEOs posting about burnout, delegation or a first year in the job, and shows you the post.",
        watching: ["founder burnout", "first-time CEO"],
        more: 3,
      },
      {
        kind: "hiring",
        title: "New leaders on the way in",
        body: "When a company posts a senior role, Pancake brings you the CEO or People leader making that hire.",
        watching: ["Head of Engineering", "Head of Product"],
        more: 2,
      },
      {
        kind: "influencer",
        title: "Readers of leadership authors",
        body: "Founders who like or comment on posts by the leadership writers you name land in your leads.",
        watching: ["Harlan Pettigrew", "Sunniva Blake"],
      },
    ],
  },

  faq: [
    {
      q: "I rarely post on LinkedIn. Will this work?",
      a: "Yes. Own brand is one signal of six. Keyword, Hiring and Influencer find leaders whether you post or not.",
    },
    {
      q: "Can it book discovery calls?",
      a: "Not directly. When a lead replies with interest, Pancake answers once with your booking link. After that, the conversation is yours.",
    },
    {
      q: "Can it reach the People leader who pays for coaching?",
      a: "Yes. Add roles like VP People or Chief People Officer to your Brain. Pancake keeps leads in those seats at companies that fit.",
    },
    {
      q: "Can it find people who pay for their own coaching?",
      a: "Only people at companies. Pancake finds leads through LinkedIn activity and job posts, so it fits executive coaching, not life coaching.",
    },
  ],

  related: ["consultants", "corporate-training-companies", "hr-consultants", "executive-search-firms"],

  cta: { title: "Turn readers into clients." },
};
