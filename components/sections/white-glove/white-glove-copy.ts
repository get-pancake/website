import { BASE_LEVEL, formatDollars } from "@/lib/pricing";
import { WHITE_GLOVE_INITIAL_MONTHS, WHITE_GLOVE_MONTHLY_DOLLARS } from "@/lib/white-glove";

/**
 * /white-glove copy (PAN-2368). Every fact is the owner-confirmed offer of
 * October 18, 2026 (pancake/gtm/white-glove-program): the price and term come
 * from lib/white-glove.ts, the self-serve entry price from lib/pricing.ts.
 * Never add guarantees, capacity, sending volume, Slack, SLAs, integration
 * counts, bespoke terms or results here. Enterprise connectors are a separate
 * offer and are only named to tell the two apart.
 */

export const WG_PRICE = formatDollars(WHITE_GLOVE_MONTHLY_DOLLARS);
export const WG_TERM = `${WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment, then month to month.`;
const SELF_SERVE_FROM = formatDollars(BASE_LEVEL.dollars);

export const WG_META = {
  title: "Pancake White Glove: your outbound machine, built and run with you",
  ogTitle: "Pancake White Glove: we build your outbound. You close.",
  description: `Our team builds your outbound machine and runs it with you: a dedicated GTM engineer, custom GTM Brain setup, unlimited Plays and unlimited credits. ${WG_PRICE} a month.`,
};

export const WG_HERO = {
  badge: "White Glove",
  title: ["We build your outbound.", "You close."],
  lede: "Our team builds your outbound machine and runs it with you, so you can focus on closing deals.",
  primary: "Talk to sales",
  // ≤11 characters: the v3 pills keep the artboard's fixed 136px width (foundation.css)
  secondary: "See pricing",
  price: `${WG_PRICE}/month`,
  term: WG_TERM,
};

/** The machine, bottom-up: the foundation first, the payoff last. */
export const WG_MACHINE = {
  label: "Your outbound machine",
  // set vertically along the stack: keep it shorter than the three plates
  engineer: "Your dedicated GTM engineer",
  officeHour: "Weekly office hour",
  layers: [
    { key: "brain", name: "Custom GTM Brain", note: "Your ICP, buyers and voice" },
    { key: "plays", name: "Unlimited Plays", note: "Signal-based" },
    { key: "sequences", name: "Outreach sequences", note: "Written for your buyers" },
  ],
  close: "You close the deals",
  credits: "Unlimited Pancake credits",
} as const;

export const WG_GET = {
  title: "What you get.",
  lede: "Everything self-serve does, built and run by our team.",
  items: [
    {
      title: "Dedicated GTM engineer",
      body: "One engineer from our team builds your machine and runs it with you.",
    },
    {
      title: "Custom GTM Brain setup",
      body: "Your ICP, personas, competitors and voice, set up for your market.",
    },
    {
      title: "Unlimited Plays",
      body: "Signal-based Plays that act on funding rounds, open roles, tech stacks and posts.",
    },
    {
      title: "Outreach sequences",
      body: "Messages for each Play, written for your buyers in your voice.",
    },
    {
      title: "Unlimited Pancake credits",
      body: "Every search your Plays run is covered. No credit level to pick.",
    },
    {
      title: "Weekly GTM office hour",
      body: "One hour every week with our team to review your Plays.",
    },
  ],
} as const;

export const WG_HOW = {
  title: "How we work together.",
  lede: "We do the building. You stay close to the buyers.",
  us: "Our team",
  you: "You",
  steps: [
    {
      name: "Scope",
      us: "Learns your market, your buyers and your goals.",
      you: "Tell us who you sell to.",
    },
    {
      name: "Build",
      us: "Builds your GTM Brain, Plays and sequences.",
      you: "Review the messages in your voice.",
    },
    {
      name: "Run",
      us: "Runs the machine with you and meets you every week.",
      you: "Take the conversations and close.",
    },
  ],
} as const;

export const WG_PRICE_PANEL = {
  title: "One price. No credit math.",
  name: "White Glove",
  caption: "per month, unlimited Pancake credits included",
  terms: [
    `${WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment`,
    "Then month to month",
    "For companies of any size",
  ],
  cta: "Talk to sales",
  alt: {
    name: "Self-serve",
    price: `From ${SELF_SERVE_FROM}/month`,
    body: "Build and run your Plays yourself, on monthly credits.",
    cta: "Compare plans",
  },
};

export const WG_FAQ = {
  title: "White Glove questions.",
  items: [
    {
      q: "What does White Glove cost?",
      a: `${WG_PRICE} a month, with unlimited Pancake credits. The first ${WHITE_GLOVE_INITIAL_MONTHS} months are an initial commitment. After that it runs month to month.`,
    },
    {
      q: "Can I cancel?",
      a: `Yes, once the ${WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment ends. From then on White Glove is month to month.`,
    },
    {
      q: "Who is White Glove for?",
      a: "Companies of any size that want our team to build their outbound machine and run it with them.",
    },
    {
      q: "Is it the same as Pancake Forward Deployed?",
      a: "Yes. White Glove and Pancake Forward Deployed are two names for the same paid service.",
    },
    {
      q: "How is it different from self-serve?",
      a: `On self-serve you build and run your Plays yourself, from ${SELF_SERVE_FROM} a month on monthly credits. On White Glove a dedicated GTM engineer builds them and runs them with you, on unlimited credits.`,
    },
    {
      q: "How is it different from Enterprise?",
      a: "Enterprise is a separate offer with custom pricing. Beyond the build, it adds Custom Plays for your sales motion, all data providers through one endpoint, custom GTM Brain connectors and a GTM Brain synced with GitHub.",
    },
    {
      q: "How do I start?",
      a: "Talk to sales and answer yes to White Glove. You book a consultation with our team.",
    },
  ],
} as const;

export const WG_CTA = {
  title: "Hand us the build",
  body: "Our team builds your outbound machine. You focus on closing deals.",
  primary: "Talk to sales",
  secondary: "See pricing",
  note: `${WG_PRICE} a month. ${WG_TERM}`,
};
