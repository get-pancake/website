/**
 * /demo — every visible string. The hero block is VERBATIM from the brain
 * landing (founder copy, brain.getpancake.ai, PR #295) and the card strings
 * are the founder's 2026-09-15 brief; new strings (errors, busy line,
 * support line, the step-2 card and the progress text of the 2026-09-16
 * two-step split) follow .claude/skills/landing-voice. 2026-09-16, booking
 * hand-off (François: "they're booking straight with us"): no string
 * promises outreach any more; the card intro, the meta
 * description and the BOOKING / BOOKED states were set in that brief. One
 * module so a copy tweak is a one-line change; flag deviations in the PR
 * instead of editing here silently.
 */

export const META = {
  // Tab title is EXACTLY "Pancake" on the landings (founder rule, app/page.tsx).
  title: "Pancake",
  ogTitle: "Book a demo with Pancake",
  description: "See Pancake run your go-to-market. Two quick steps, then book your demo.",
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

/** Step 1 of the card (identity). `submit` advances to step 2; `submitting`
    is the step-2 pill's busy label. */
export const CARD = {
  title: "Book a demo",
  intro: "Two quick steps, then pick a time.",
  submit: "Let's go",
  submitting: "Sending…",
  /** visually hidden status line while the request is in flight */
  sending: "Sending your request.",
  helpBefore: "Looking for help? Visit our ",
  helpLink: "support page",
  helpAfter: ".",
} as const;

/** Step 2 of the card (qualification). Founder 2026-09-16: "two steps in
    the form, just like on ElevenLabs" (their step 2 is "Tell us about
    yourself" with a Back button); the title names the team the three
    questions are about. */
export const STEP2 = {
  title: "Tell us about your team",
  intro: "Three quick answers so we come prepared.",
  back: "Back",
  submit: "Request a demo",
} as const;

/** Visually hidden text of the two-segment progress bar; the bar itself is aria-hidden. */
export const PROGRESS = {
  step1: "Step 1 of 2",
  step2: "Step 2 of 2",
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
} as const;

/** The booking state, right after the request lands (DemoBooking): the
    Calendly routing form inline, prefilled, then AI sales as the "talk now"
    path. title, intro, frameTitle, the fallback line and aiSalesLine are
    the 2026-09-16 booking brief; aiSales is the founder's 2026-09-15 label.
    The aiSales* state strings (2026-09-16, the ElevenLabs agent wired to
    the pill) follow landing-voice: the widget opens at the bottom right and
    its first control reads "Start the call" (lib/ai-sales.ts). */
export const BOOKING = {
  title: "Pick a time",
  intro: "Your answers are filled in. Press Submit, then choose a slot.",
  /** the iframe's accessible name (= the retired dialog's frame title) */
  frameTitle: "Book a demo with Pancake",
  /** shown only when the frame has not loaded after a beat */
  fallbackBefore: "Calendar not loading? ",
  fallbackLink: "Open it in a new tab",
  fallbackAfter: ".",
  aiSalesLine: "Rather talk now? AI sales answers right away.",
  aiSales: "Chat with AI sales",
  /** the pill while the widget script loads, then once the widget is open (one widget, one click) */
  aiSalesOpening: "Opening AI sales…",
  aiSalesReady: "AI sales is ready",
  /** visually hidden status once the widget is open */
  aiSalesOpened: "AI sales opened at the bottom right of the page. Press Start the call.",
  /** inline alert when the script cannot load; the pill reads "Chat with AI sales" again */
  aiSalesErrorBefore: "We could not open AI sales. Try again, or ",
  aiSalesErrorLink: "visit our support page",
  aiSalesErrorAfter: ".",
} as const;

/** The booked state, once Calendly reports the booking (DemoBooked). title
    and body are the 2026-09-16 booking brief; again and restart are VERBATIM
    from the founder's 2026-09-15 brief. */
export const BOOKED = {
  title: "You're booked",
  body: "Check your inbox for the calendar invite.",
  videoTitle: "Pancake demo",
  videoSrc: "https://www.youtube-nocookie.com/embed/Fk8sqw61NqE?rel=0",
  again: "To submit updated details, start a new submission below:",
  restart: "Start a new submission",
} as const;

export const FOOTER = { line: "2026 Pancake · San Francisco, CA · ", privacy: "Privacy", terms: "Terms", sep: " · " } as const;
export const SUPPORT_HREF = "/support";
