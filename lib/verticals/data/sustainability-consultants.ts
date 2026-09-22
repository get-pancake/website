// lib/verticals/data/sustainability-consultants.ts — /for/sustainability-consultants.
// Sustainability, ESG and carbon-accounting consultants selling to CFOs and sustainability leads
// at 250 to 5,000-person US companies. Merged in: ESG and carbon-accounting consultants.
// Every person, company, rival advisory, influencer and workspace below is invented.
// Evidence: trials (a cost & net-zero consultancy; closest payer is an adjacent climate/real-estate advisory).
// Caveat: no emissions, ESG-rating or regulatory-scope data. Which rules apply is the reader's call,
// so no dated regulatory claims (scope and deadlines keep moving). US geography only (CSRD prompt moved to scope 3).
import type { VerticalConfig } from "../types";

export const sustainabilityConsultants: VerticalConfig = {
  slug: "sustainability-consultants",
  status: "approved",
  category: "Energy & industry",
  evidence: "trials",
  updated: "2026-09-22",

  name: {
    plural: "sustainability consultants",
    title: "Sustainability consultants",
    short: "sustainability firms",
    badge: "For sustainability firms",
  },

  meta: { seoTitle: "Pancake for Sustainability Consultants: Find ESG Clients" },

  hubLine: "Find companies hiring for climate reporting.",

  hero: {
    h1: ["You cut carbon", "We bring you clients"],
    lede: "Pancake finds CFOs posting about scope 3 and companies hiring sustainability managers. You reach them before the RFP.",
  },

  workspace: { name: "Eskerline Climate", sender: "Leonie Barrera" },

  demo: {
    h2: "Find the team behind the report.",
    prompts: [
      {
        kind: "keyword",
        text: "I do carbon accounting. Find CFOs at US firms with 250 to 1,000 staff posting about scope 3.",
        reply: "I'll watch scope 3 posts and keep CFOs and finance heads at US companies that size.",
        proposal: [
          { kind: "keyword", items: ["scope 3", "supplier emissions", "carbon inventory"] },
          { kind: "influencer", items: ["Wanjiru Kamau", "Miriam Hollenbeck"] },
          { kind: "hiring", items: ["Carbon accountant"] },
          { kind: "stack", items: ["Persefoni", "Workiva"] },
        ],
        leads: [
          { name: "Sunil Chaudhry", role: "CFO", company: "Glenfinch Foods", kind: "keyword", signal: "Posted on scope 3" },
          { name: "Rosa Villaverde", role: "Controller", company: "Hapsworth", kind: "keyword", signal: "Posted on emissions" },
          { name: "Ethan Brightman", role: "VP Finance", company: "Catalpa Home", kind: "influencer", signal: "Commented on Kamau" },
          { name: "Folake Adeniran", role: "Finance Director", company: "Gorsefield", kind: "hiring", signal: "Carbon accountant role" },
          { name: "Owen Takahashi", role: "CFO", company: "Yarrowby", kind: "stack", signal: "Persefoni in job posts" },
        ],
        featured: {
          why: "Glenfinch Foods is a 640-person US food company. Sunil is the CFO and posted this week about getting scope 3 data from suppliers.",
          confidence: 88,
          seniority: "C-level",
        },
        message:
          "Hi Sunil, saw your post about getting scope 3 data out of suppliers. That’s where most first inventories stall. We build carbon inventories for food companies, supplier data included. Want to compare notes on where yours stands?",
      },
      {
        kind: "hiring",
        text: "Find US companies hiring a sustainability manager. We run the program until they start.",
        reply: "I'll watch sustainability job posts and find the finance or ops leader at each company.",
        proposal: [
          { kind: "hiring", items: ["Sustainability manager", "Head of Sustainability", "ESG reporting analyst"] },
          { kind: "keyword", items: ["net zero target", "climate disclosure"] },
          { kind: "competitor", items: ["Greyfield Climate"] },
        ],
        leads: [
          { name: "Aaliyah Bosworth", role: "COO", company: "Tidebrook", kind: "hiring", signal: "Sustainability role open" },
          { name: "Mitchell Garza", role: "VP Operations", company: "Tupelo Brands", kind: "hiring", signal: "ESG analyst role open" },
          { name: "Frances Adebowale", role: "CFO", company: "Whinstead", kind: "keyword", signal: "Posted on net zero" },
          { name: "Reid Halloway", role: "General Counsel", company: "Buckthorn", kind: "hiring", signal: "Sustainability head role" },
          { name: "Anika Bhatt", role: "COO", company: "Dunlin Apparel", kind: "competitor", signal: "Liked a Greyfield post" },
        ],
        featured: {
          why: "Tidebrook, a 520-person US packaging company, is hiring a sustainability manager. Aaliyah runs operations as COO.",
          confidence: 86,
          seniority: "C-level",
        },
        message:
          "Hi Aaliyah, saw Tidebrook is hiring a sustainability manager. Customer questionnaires don’t pause while that search runs. We run sustainability programs for packaging companies until the new hire starts. Want a hand covering the gap?",
      },
      {
        kind: "stack",
        text: "We improve supplier ratings. Find US manufacturers whose job posts mention EcoVadis.",
        reply: "I'll track job posts naming EcoVadis and keep quality and sustainability leads.",
        proposal: [
          { kind: "stack", items: ["EcoVadis", "Sphera"] },
          { kind: "keyword", items: ["EcoVadis rating", "supplier questionnaire"] },
          { kind: "hiring", items: ["Sustainability analyst", "EHS manager"] },
        ],
        leads: [
          { name: "Jorge Arellano", role: "Head of Quality", company: "Wirebrook", kind: "stack", signal: "EcoVadis in job posts" },
          { name: "Hilary Nussbaum", role: "COO", company: "Castorline", kind: "stack", signal: "Sphera in job posts" },
          { name: "Musa Kanneh", role: "VP Sales", company: "Plexmoor", kind: "keyword", signal: "Posted on EcoVadis" },
          { name: "Paige Dorrance", role: "ESG Manager", company: "Kestwick", kind: "hiring", signal: "Sustainability analyst" },
          { name: "Rafael Ontiveros", role: "VP Operations", company: "Tannerly", kind: "hiring", signal: "EHS manager role open" },
        ],
        featured: {
          why: "Wirebrook is a 310-person US wire and cable maker whose job posts name EcoVadis. Jorge leads quality there.",
          confidence: 90,
          seniority: "Head",
        },
        message:
          "Hi Jorge, saw Wirebrook’s job posts name EcoVadis. Large buyers keep raising the score they ask suppliers for. We help manufacturers lift their EcoVadis rating, from policies to evidence. Worth a look before your next assessment?",
      },
    ],
  },

  signals: {
    h2: "Scope 3 pressure goes public.",
    cards: [
      {
        kind: "keyword",
        title: "Leaders posting on scope 3",
        body: "Supplier data, net zero targets and disclosure posts all count, and each lead arrives with the post.",
        watching: ["scope 3", "net zero", "climate disclosure"],
        more: 2,
      },
      {
        kind: "hiring",
        title: "Companies hiring ESG roles",
        body: "Each sustainability or carbon opening leads Pancake to the CFO or COO who owns the hire.",
        watching: ["Sustainability manager", "Carbon accountant", "ESG analyst"],
        more: 2,
      },
      {
        kind: "stack",
        title: "Reporting tools in job posts",
        body: "When a job post asks for Workiva or EcoVadis, you know the team already reports on sustainability.",
        watching: ["EcoVadis", "Workiva", "Persefoni", "Watershed"],
      },
      {
        kind: "influencer",
        title: "Fans of disclosure experts",
        body: "Pancake keeps the CFOs and sustainability leads who comment on their posts.",
        watching: ["Wanjiru Kamau", "Miriam Hollenbeck"],
      },
    ],
  },

  faq: [
    {
      q: "Can Pancake tell which companies must report?",
      a: "No. Pancake has no data on who falls under a climate rule. Set company size and industry in your Brain, then watch who posts about disclosure or hires for it.",
    },
    {
      q: "Do you have emissions data on prospects?",
      a: "No. Emissions and ratings aren’t in Pancake. It finds the people posting about them and the companies hiring to manage them.",
    },
    {
      q: "Can I reach both the CFO and the sustainability lead?",
      a: "Yes. Add both to your Brain’s personas, and leads can come in as either role.",
    },
    {
      q: "Some buyers avoid the word ESG. Can I change the wording?",
      a: "Yes. You choose the keywords Pancake watches and the voice it writes in, both in your Brain. Say carbon, climate or cost, whichever your buyers use.",
    },
  ],

  related: ["solar-companies", "industrial-tech-startups", "consultants", "fractional-cfos"],

  cta: { title: "Net zero needs a plan." },
};
