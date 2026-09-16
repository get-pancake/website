/**
 * /demo — every visible string. The hero block is VERBATIM from the brain
 * landing (founder copy, brain.getpancake.ai, PR #295) and the card/success
 * strings are the founder's 2026-09-15 brief; new strings (intro, errors,
 * busy line, support line, meta description) follow
 * .claude/skills/landing-voice. One module so a copy tweak is a one-line
 * change; flag deviations in the PR instead of editing here silently.
 */

export const META = {
  // Tab title is EXACTLY "Pancake" on the landings (founder rule, app/page.tsx).
  title: "Pancake",
  ogTitle: "Book a demo with Pancake",
  description: "See Pancake run your go-to-market. Fill out the form and our team will reach out.",
} as const;

/** VERBATIM from the brain hero (ref app_page.tsx) — never edit. */
export const HERO = {
  eyebrow: "Now in early access",
  titleLine1: "Put your GTM on",
  titleLine2: "full autopilot",
  ledeBefore: "Pancake lets your Claude or ChatGPT run your ",
  ledeNowrap: "go-to-market",
  ledeAfter: ". Find people ready to buy and start outreach campaigns from the same conversation.",
} as const;

export const TRUST = { before: "Trusted by dozens of ", ycAlt: "YC", after: " companies" } as const;

export const CARD = {
  title: "Book a demo",
  intro: "Fill out the form and our team will reach out.",
  submit: "Let's go",
  submitting: "Sending…",
  /** visually hidden status line while the request is in flight */
  sending: "Sending your request.",
  helpBefore: "Looking for help? Visit our ",
  helpLink: "support page",
  helpAfter: ".",
} as const;

export const FIELDS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Work email",
  website: "Company website",
  teamSize: "Team size",
  hasAccount: "Do you already have a Pancake account?",
  goal: "What is the #1 thing Pancake can do for you?",
  required: "*",
  /** placeholder option of both selects */
  choose: "Choose one",
  yes: "Yes",
  no: "No",
  /** brain's own placeholder (SignupForm.tsx) */
  emailPlaceholder: "name@company.com",
  websitePlaceholder: "acme.com",
} as const;

export const ERRORS = {
  firstName: "Enter your first name.",
  lastName: "Enter your last name.",
  email: "Enter a valid work email.",
  website: "Enter a website like acme.com.",
  teamSize: "Pick a team size.",
  hasAccount: "Tell us if you have a Pancake account.",
  goal: "Pick one of the options.",
  submissionId: "Check the form and try again.",
  invalid: "Check the form and try again.",
  // The route's window is 10 minutes (landing-voice: real numbers).
  rateLimitedBefore: "Too many tries. Wait 10 minutes, or ",
  rateLimitedLink: "visit our support page",
  rateLimitedAfter: ".",
  unavailableBefore: "We could not send that. Try again in a moment, or ",
  unavailableLink: "visit our support page",
  unavailableAfter: ".",
  network: "We could not reach Pancake. Check your connection and try again.",
} as const;

/** title…restart VERBATIM from the founder's brief. */
export const SUCCESS = {
  title: "Thanks for reaching out!",
  body: "Our team will get back to you soon!",
  faster: "Get contacted faster by choosing to connect with our AI sales",
  aiSales: "Chat with AI sales",
  videoTitle: "Pancake demo",
  videoSrc: "https://www.youtube-nocookie.com/embed/Fk8sqw61NqE?rel=0",
  again: "To submit updated details, start a new submission below:",
  restart: "Start a new submission",
} as const;

export const FOOTER = { line: "2026 Pancake · San Francisco, CA · ", privacy: "Privacy", terms: "Terms", sep: " · " } as const;
export const SUPPORT_HREF = "/support";
