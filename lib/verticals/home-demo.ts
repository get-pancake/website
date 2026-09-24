// lib/verticals/home-demo.ts — the homepage's product demo (LpDemoTour, founder 2026-09-23: "blown
// away by this part, should probably be on the normal landing page"). SERVER ONLY, like the configs.
//
// Not a /for page: no slug, not in the registry, the sitemap, the hub or the nav. It is a DemoSource
// (the demo fields of a VerticalConfig) and passes the same rules: lib/verticals/index.ts hands it
// to validateVerticals() as a `demos` entry, so its people, companies and workspace stay unique
// against all 40 pages, and the build fails on a banned claim, a platform name, a non-US place.
// scripts/verticals-budget.mjs measures its strings with the demo's pixel budgets ("homepage").
//
// Story: Studio Pelican, the homepage's own fictional customer (LpSteps types studio-pelican.com
// and its Brain reads "SaaS launch videos" for "B2B SaaS teams"; LpFeatures' AI answer recommends
// it), so the page reads as one company from the demo to the features. One workspace per demo
// (the rail, "Sends as", Slack), so three prompts from one business, three different signals:
// people posting about a launch (Keyword), people engaging with rival studios (Competitor),
// companies hiring for the launch team (Hiring). US targets only (outreach is in English).
// Every person, company, rival studio and storyteller below is invented.
import type { DemoSource } from "./types";

export const HOME_DEMO: DemoSource = {
  workspace: { name: "Studio Pelican", sender: "Maren Lindell" },

  demo: {
    /** Rendered VISIBLY on the homepage: the demo section's H2 (LpDemoTour). */
    h2: "One prompt in. Warm leads out.",
    prompts: [
      {
        kind: "keyword",
        text: "We make SaaS launch videos. Find US product marketers posting about an upcoming release.",
        reply: "I’ll watch release and launch day posts from product marketers at US SaaS companies.",
        proposal: [
          { kind: "keyword", items: ["new release", "launch day", "product demo"] },
          { kind: "influencer", items: ["Dara Ellwood"] },
          { kind: "competitor", items: ["Bramble Reels"] },
        ],
        leads: [
          { name: "Tamsin Okafor", role: "Director of PMM", company: "Quillfern", kind: "keyword", signal: "Posted about a release" },
          { name: "Wes Pomeroy", role: "VP Marketing", company: "Stackhollow", kind: "keyword", signal: "Posted on launch day" },
          { name: "Imani Coldwell", role: "CMO", company: "Ferngate", kind: "influencer", signal: "Liked an Ellwood post" },
          { name: "Anders Nakamura", role: "PMM Lead", company: "Loomwise", kind: "competitor", signal: "Liked a Bramble post" },
          { name: "Rosa Delacroix", role: "Founder & CEO", company: "Pixelmoor", kind: "keyword", signal: "Posted a product demo" },
        ],
        featured: {
          why: "Quillfern is a 140-person US SaaS company. Tamsin runs product marketing and posted this week about an upcoming release.",
          confidence: 90,
          seniority: "Director",
        },
        message:
          "Hi Tamsin, saw the release you teased this week. Launch videos are all we make at Studio Pelican. What should a buyer understand in the first ten seconds of yours?",
      },
      {
        kind: "competitor",
        text: "Find marketing leads at US SaaS companies who engage with rival video studios’ posts.",
        reply: "I’ll find SaaS marketers who like or comment on rival studios’ posts.",
        proposal: [
          { kind: "competitor", items: ["Bramble Reels", "Ferrow Motion"] },
          { kind: "keyword", items: ["explainer video", "customer story"] },
          { kind: "influencer", items: ["Dara Ellwood", "Owen Pascoe"] },
        ],
        leads: [
          { name: "Nate Abernathy", role: "Head of Content", company: "Quorra Labs", kind: "competitor", signal: "Liked a Bramble post" },
          { name: "Chloe Vandermeer", role: "Brand Director", company: "Hexfield", kind: "competitor", signal: "Liked a Ferrow post" },
          { name: "Omar Tessaro", role: "VP Marketing", company: "Gridwell", kind: "keyword", signal: "Posted a customer story" },
          { name: "Bea Soriano", role: "CMO", company: "Cloudnook", kind: "influencer", signal: "Liked a Pascoe post" },
          { name: "Jonah Pritchard", role: "Content Lead", company: "Signalry", kind: "competitor", signal: "Liked a Bramble post" },
        ],
        featured: {
          why: "Quorra Labs is a 90-person US SaaS company. Nate leads content and liked a Bramble Reels post about explainer videos.",
          confidence: 86,
          seniority: "Head",
        },
        message:
          "Hi Nate, saw you liked Bramble Reels’ post on explainer videos. We make them for SaaS teams too. Which one made you want to try the product it was selling?",
      },
      {
        kind: "hiring",
        text: "Find US SaaS companies of 50 to 500 people hiring a product marketing manager.",
        reply: "I’ll find SaaS companies of 50 to 500 people with an open product marketing role.",
        proposal: [
          { kind: "hiring", items: ["Product marketing manager", "Head of product marketing"] },
          { kind: "stack", items: ["Wistia", "Vidyard"] },
          { kind: "keyword", items: ["release notes"] },
        ],
        leads: [
          { name: "Elena Marchetti", role: "VP Marketing", company: "Tidewell", kind: "hiring", signal: "PMM role open" },
          { name: "Theo Brandvold", role: "CMO", company: "Parcelry", kind: "hiring", signal: "Head of PMM role" },
          { name: "Ruth Adeyinka", role: "Head of Growth", company: "Brimstack", kind: "stack", signal: "Wistia in job posts" },
          { name: "Marco Villaseñor", role: "PMM Director", company: "Oakhatch", kind: "hiring", signal: "PMM role open" },
          { name: "Sienna Hollis", role: "VP Marketing", company: "Tallowby", kind: "keyword", signal: "Posted release notes" },
        ],
        featured: {
          why: "Tidewell is a 210-person US SaaS company with a product marketing role open. Elena runs marketing and owns that hire.",
          confidence: 88,
          seniority: "VP",
        },
        message:
          "Hi Elena, we make the 60-second launch videos SaaS teams put on their pricing page. What does a new visitor watch on yours today?",
      },
    ],
  },
};
