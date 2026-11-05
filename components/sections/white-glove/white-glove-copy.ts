import { BASE_LEVEL, formatDollars } from "@/lib/pricing";
import { WHITE_GLOVE_INITIAL_MONTHS, WHITE_GLOVE_MONTHLY_DOLLARS } from "@/lib/white-glove";

/**
 * /white-glove copy (PAN-2368). Every fact is the owner-confirmed offer of
 * October 18, 2026 (pancake/gtm/white-glove-program): the price and term come
 * from lib/white-glove.ts, the self-serve entry price from lib/pricing.ts.
 * Never add guarantees, capacity, sending volume, Slack, SLAs, integration
 * counts, bespoke terms or results here. Enterprise connectors are a separate
 * offer and are only named to tell the two apart. The hero H1 is François's,
 * verbatim (October 18, 2026). Since November 5, 2026 the hero holds the demo
 * film and the "Book a demo" card (WG_BOOK, the White Glove campaign's ask)
 * where the order ticket was. The offer always leads with the
 * Custom GTM Brain.
 */

export const WG_PRICE = formatDollars(WHITE_GLOVE_MONTHLY_DOLLARS);
export const WG_TERM = `${WHITE_GLOVE_INITIAL_MONTHS}-month initial commitment, then month to month.`;
const SELF_SERVE_FROM = formatDollars(BASE_LEVEL.dollars);

export const WG_META = {
  title: "Pancake White Glove: we build your outbound machine",
  ogTitle: "Pancake White Glove: we build your outbound machine.",
  description: `Our team builds your outbound machine: your custom GTM Brain, unlimited Plays, unlimited Pancake credits and weekly office hours with a dedicated GTM engineer. ${WG_PRICE} a month.`,
};

export const WG_HERO = {
  title: "We build your outbound machine.",
  /** the same title in two lines, broken where the homepage H1 breaks */
  lines: ["We build your", "outbound machine."],
  lede: "Our team builds your custom GTM Brain and runs your Plays with you, on unlimited credits.",
};

/**
 * The hero's "Book a demo" card (WgBookDemo.tsx): a work email and three
 * questions (the campaign's ask, 2026-11-05), then the White Glove calendar, François's
 * review queue or self-serve (lib/white-glove-demo.ts says who goes where).
 * The price and term sit in the lede: the card books a paid service.
 */
export const WG_BOOK = {
  title: "Book a demo",
  lede: `45 minutes with our team. White Glove is ${WG_PRICE} a month, ${WHITE_GLOVE_INITIAL_MONTHS} months minimum.`,
  email: { label: "Work email", placeholder: "you@company.com" },
  size: { label: "Company size" },
  country: { label: "Country", common: "Most common", all: "All countries" },
  gtm: { legend: "Do you have a GTM team?", hint: "Sales, growth or GTM engineers.", yes: "Yes", no: "Not yet" },
  select: "Select",
  submit: "Book a demo",
  sending: "Sending…",
  fine: "Work email only. Your answers prepare the call.",
  errors: {
    personal: "Use your work email. Personal addresses can't book a demo.",
    failed: "Something went wrong. Please try again.",
    timeout: "That took too long. Please try again.",
  },
  booking: {
    title: "Pick a time",
    lede: "45 minutes on video with our team.",
    frameTitle: "White Glove demo calendar",
    stuckBefore: "Calendar not loading? ",
    stuckLink: "Open it in a new tab",
    stuckAfter: ".",
  },
  booked: { title: "You're booked.", body: "The invite is in your inbox. See you on the call." },
  review: {
    title: "Thanks. We'll be in touch.",
    body: "Our team reads every request and emails you a booking link if White Glove fits.",
  },
  selfServe: {
    title: "White Glove is built for teams.",
    body: `Start on self-serve: the same Pancake, from ${SELF_SERVE_FROM} a month.`,
    cta: "Start free",
    alt: "Compare plans",
  },
} as const;

export const WG_GET = {
  title: "What you get.",
  lede: "Everything self-serve does, built and run by our team.",
  items: [
    {
      tone: "brain",
      title: "Custom GTM Brain setup",
      body: "Your ICP, personas, competitors and voice, set up for your market.",
    },
    {
      tone: "engineer",
      title: "Dedicated GTM engineer",
      body: "One engineer from our team builds your machine and runs it with you.",
    },
    {
      tone: "plays",
      title: "Unlimited Plays",
      body: "Signal-based Plays that act on funding rounds, open roles, tech stacks and posts.",
    },
    {
      tone: "sequences",
      title: "Outreach sequences",
      body: "Messages for each Play, written for your buyers in your voice.",
    },
    {
      tone: "credits",
      title: "Unlimited Pancake credits",
      body: "Every search your Plays run is covered. No credit level to pick.",
    },
    {
      tone: "office",
      title: "Weekly GTM office hour",
      body: "One hour every week with our team to review your Plays.",
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
  cta: "Book a demo",
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
      a: "Book a demo at the top of this page: your work email and three questions. If White Glove fits, you pick a time with our team.",
    },
  ],
} as const;

export const WG_CTA = {
  title: "Hand us the build",
  body: "Our team builds your custom GTM Brain and your Plays, and meets you every week.",
  primary: "Book a demo",
  secondary: "See pricing",
  note: `${WG_PRICE} a month. ${WG_TERM}`,
};
