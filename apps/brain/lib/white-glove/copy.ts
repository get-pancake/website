/**
 * brain.pancake.ai/white-glove copy: the main website's /white-glove copy
 * (components/sections/white-glove/white-glove-copy.ts), cut to the
 * campaign page. Every fact is the owner-confirmed offer of October 18, 2026:
 * $3,000 a month, a 3-month initial commitment, unlimited credits. Never add
 * guarantees, capacity, sending volume, SLAs or results here. The H1 and the
 * lede are François's, verbatim.
 */

export const WG_MONTHLY = "$3,000";
export const WG_MONTHS = 3;
const SELF_SERVE_FROM = "$99";

export const WG_META = {
  title: "Pancake White Glove: we build your outbound machine",
  description: `Our team builds your outbound machine: your custom GTM Brain, unlimited Plays, unlimited Pancake credits and weekly office hours with a dedicated GTM engineer. ${WG_MONTHLY} a month.`,
};

export const WG_PAGE = {
  skip: "Skip to the form",
  eyebrow: "Pancake White Glove",
  title: "We build your outbound machine.",
  lede: "Our team builds your custom GTM Brain and runs your Plays with you, on unlimited credits.",
  navCta: "Book a demo",
  points: [
    { title: "Custom GTM Brain setup", body: "Your ICP, personas, competitors and voice, set up for your market." },
    { title: "Dedicated GTM engineer", body: "One engineer from our team builds your machine and runs it with you." },
    { title: "Unlimited Plays", body: "Signal-based Plays that act on funding rounds, open roles, tech stacks and posts." },
    { title: "Weekly GTM office hour", body: "One hour every week with our team to review your Plays." },
  ],
} as const;

/** The film next to the form (WgVsl.tsx). */
export const WG_VSL = {
  label: "Pancake demo video",
  sound: "Watch with sound",
  play: "Watch the demo",
} as const;

/** The "Book a demo" card (WgBookDemo.tsx): the website's WG_BOOK, no outbound links. */
export const WG_BOOK = {
  title: "Book a demo",
  lede: `45 minutes with our team. White Glove is ${WG_MONTHLY} a month, ${WG_MONTHS} months minimum.`,
  email: { label: "Work email", placeholder: "you@company.com" },
  size: { label: "Company size" },
  country: { label: "Country", list: "Countries", empty: "No country matches. Try another spelling." },
  gtm: { legend: "Do you have a GTM team?", hint: "Sales, growth or GTM engineers.", yes: "Yes", no: "Not yet" },
  /** /demo's White Glove budget question: it gates the calendar */
  budget: {
    label: `Does ${WG_MONTHLY} a month work for you?`,
    yes: "Yes, it works for us",
    approval: "I need internal approval",
    no: "Not in our budget",
  },
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
    /** the budget does not stretch to White Glove */
    budgetTitle: "Start on self-serve.",
    budgetBody: `The same Pancake, from ${SELF_SERVE_FROM} a month. You build and run your Plays.`,
    cta: "Start free",
  },
} as const;
