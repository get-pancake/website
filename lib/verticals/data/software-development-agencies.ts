// lib/verticals/data/software-development-agencies.ts — /for/software-development-agencies.
// Merged in: app development agencies, IT outsourcing / nearshore teams.
// Every person, company, rival dev shop, influencer and workspace below is invented.
// Evidence: 2 paying (embedded product teams; AI custom software) + ~10 trials.
// Caveat: Stack = technologies named in job posts, never "companies built on React".
// Flutter, Dart and OpenAI resolve in TheirStack's catalog (checked 2026-09-22).
// Leads are the hiring company's leaders, never candidates.
import type { VerticalConfig } from "../types";

export const softwareDevelopmentAgencies: VerticalConfig = {
  slug: "software-development-agencies",
  status: "approved",
  category: "Tech & build agencies",
  evidence: "paying",
  updated: "2026-09-22",

  name: {
    plural: "software development agencies",
    title: "Software development agencies",
    short: "dev shops",
    badge: "For software agencies",
  },

  meta: { seoTitle: "Pancake for Software Development Agencies: Find Clients" },

  hubLine: "Find startups hiring engineers and meet their founders.",

  hero: {
    title: "Find founders searching for a technical co-founder.",
    lede: "Pancake reads engineering openings, Flutter in job posts and technical co-founder searches. You ship while they interview.",
  },

  workspace: { name: "Anvilry Software", sender: "Idris Fairbanks" },

  demo: {
    h2: "Reach founders while they search.",
    prompts: [
      {
        kind: "hiring",
        text: "We build MVPs. Find US startups with under 50 people hiring a founding engineer.",
        reply: "I’ll watch job posts at US startups that size and bring you the founder or CTO.",
        proposal: [
          { kind: "hiring", items: ["Founding engineer", "Senior full-stack engineer"] },
          { kind: "keyword", items: ["building our MVP", "technical co-founder"] },
          { kind: "stack", items: ["React", "Node.js"] },
          { kind: "competitor", items: ["Loomgate Labs"] },
        ],
        leads: [
          { name: "Ximena Pflueger", role: "CEO & Co-founder", company: "Parrotbill", kind: "hiring", signal: "Founding engineer role" },
          { name: "Cormac Yarborough", role: "CTO", company: "Quenchwork", kind: "hiring", signal: "Full-stack role open" },
          { name: "Anjali Venkataraman", role: "Founder", company: "Loamline", kind: "keyword", signal: "Posted about an MVP" },
          { name: "Thaddeus Okwuosa", role: "Head of Product", company: "Nettlefield", kind: "stack", signal: "React in job posts" },
          { name: "Rosalind Etheridge", role: "COO", company: "Petrelwick", kind: "competitor", signal: "Liked a Loomgate post" },
        ],
        featured: {
          why: "Parrotbill is a 12-person US health software startup with a founding engineer role open. Ximena is the CEO and owns the hire.",
          confidence: 89,
          seniority: "Founder",
        },
        message:
          "Hi Ximena, great to connect. We build MVPs, and early products are my favorite kind of work. What’s the next feature you can’t wait to ship?",
      },
      {
        kind: "stack",
        text: "We’re a Flutter shop. Find US companies whose job posts mention Flutter or Dart.",
        reply: "I’ll watch US job posts that name Flutter or Dart and find who owns the app.",
        proposal: [
          { kind: "stack", items: ["Flutter", "Dart"] },
          { kind: "hiring", items: ["Flutter developer", "Mobile engineer"] },
          { kind: "keyword", items: ["rebuilding our app"] },
        ],
        leads: [
          { name: "Obiageli Umeh", role: "VP Engineering", company: "Kestrelpoint", kind: "stack", signal: "Flutter in job posts" },
          { name: "Soren Gundersen", role: "Head of Mobile", company: "Shalebrook", kind: "stack", signal: "Dart in job posts" },
          { name: "Delphine Abernathy", role: "CTO", company: "Pebblecourt", kind: "hiring", signal: "Flutter developer role" },
          { name: "Tobenna Achike", role: "Founder & CEO", company: "Gristhaven", kind: "keyword", signal: "Posted on app rebuild" },
          { name: "Haruto Iwasaki", role: "Engineering Manager", company: "Stavely", kind: "hiring", signal: "Mobile engineer role" },
        ],
        featured: {
          why: "Kestrelpoint is a 90-person US field-service software company. Two of its open job posts name Flutter, and Obiageli runs engineering.",
          confidence: 87,
          seniority: "VP",
        },
        message:
          "Hi Obiageli, appreciate the connection. We build mobile apps, and no two companies ship on the same rhythm. How often do you put out a new version?",
      },
      {
        kind: "keyword",
        text: "Find US founders posting that they need a technical co-founder. We can be the team.",
        reply: "I’ll watch founders’ posts about co-founder searches and MVP builds.",
        proposal: [
          { kind: "keyword", items: ["technical co-founder", "building our MVP"] },
          { kind: "influencer", items: ["Greer Terwilliger"] },
          { kind: "competitor", items: ["Hexbolt Dev", "Corvid Nearshore"] },
        ],
        leads: [
          { name: "Marguerite Hoekstra", role: "Founder", company: "Brightfen", kind: "keyword", signal: "Asked for a co-founder" },
          { name: "Lachlan Ostrowski", role: "Co-founder & CEO", company: "Wickerbay", kind: "keyword", signal: "Posted on MVP scope" },
          { name: "Ruth Quattlebaum", role: "Founder", company: "Duneweave", kind: "influencer", signal: "Liked a Terwilliger post" },
          { name: "Kai Tuiasosopo", role: "CEO", company: "Cairnwood", kind: "competitor", signal: "Liked a Hexbolt post" },
          { name: "Ulysses Pacheco", role: "Founder & CEO", company: "Juniperline", kind: "competitor", signal: "Commented on a post" },
        ],
        featured: {
          why: "Brightfen is a 5-person US B2B software startup. Marguerite posted this week that she needs a technical co-founder to build the first version.",
          confidence: 85,
          seniority: "Founder",
        },
        message:
          "Hi Marguerite, good luck with the technical co-founder search at Brightfen. What would they build first?",
      },
    ],
  },

  signals: {
    h2: "Their roadmap outruns their hiring.",
    cards: [
      {
        kind: "hiring",
        title: "Startups hiring engineers",
        body: "Pancake reads job posts for the engineering roles your team could cover and brings you the founder or CTO.",
        watching: ["Founding engineer", "Mobile engineer"],
        more: 4,
      },
      {
        kind: "keyword",
        title: "Founders who need a builder",
        body: "Pancake finds founders posting about MVPs, rebuilds and technical co-founders.",
        watching: ["technical co-founder", "MVP", "tech debt"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Your stack in their job posts",
        body: "Pancake finds companies whose job posts name the frameworks your team ships in.",
        watching: ["Flutter", "React Native", "Django", "Node.js"],
        more: 3,
      },
      {
        kind: "competitor",
        title: "Rival dev shops’ audience",
        body: "People who comment on or react to their posts become leads when they fit your buyer.",
        watching: ["Loomgate Labs", "Hexbolt Dev", "Corvid Nearshore"],
      },
    ],
  },

  faq: [
    {
      q: "Can it find startups with no engineers yet?",
      a: "Not directly. Pancake can’t count a team’s engineers. It finds startups hiring them or posting that they need a technical co-founder.",
    },
    {
      q: "Will I reach recruiters instead of CTOs?",
      a: "No. Pancake skips job posts from agencies and checks every lead against the buyer roles in your Brain, like CTO or founder.",
    },
    {
      q: "Our engineers are nearshore. Can we sell to US startups?",
      a: "Yes. Your Brain sets the markets you sell to. Where your team sits doesn’t change who Pancake finds.",
    },
    {
      q: "We build AI features. Can it find teams that want them?",
      a: "Yes, when they say so in public. Watch posts about adding AI to a product, and job posts that name OpenAI or LangChain.",
    },
  ],

  related: ["ai-automation-agencies", "ux-design-agencies", "cloud-consultancies", "saas-startups"],

  cta: { title: "Ship their roadmap." },
};
