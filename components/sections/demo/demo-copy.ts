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

import type { DemoBookingDestinationKey } from "@/lib/booking";

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
    is the step-2 pill's busy label. `talk` is the voice path beside the
    submit on both steps (François, 2026-09-16: "choose to directly talk to
    Pancake's AI instead ... next to Let's go ... on both steps of the
    form"): Pancake asks the questions left, fills the form and books. */
export const CARD = {
  title: "Book a demo",
  intro: "Two quick steps, then pick a time.",
  submit: "Let's go",
  talk: "Talk to Pancake",
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
    questions are about. `submit` reads "Pick a time" since 2026-09-16
    (François: "'Request a demo' in step 2 should be called 'Pick a time'"). */
export const STEP2 = {
  title: "Tell us about your team",
  intro: "Three quick answers so we come prepared.",
  back: "Back",
  submit: "Pick a time",
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
    routed Calendly calendar inline, prefilled, then AI sales as the "talk
    now" path. title, frameTitle, the fallback line and aiSalesLine are the
    2026-09-16 booking brief. aiSales was the founder's 2026-09-15 "Chat
    with AI sales"; since 2026-09-16 it reads "Talk to Pancake" (François:
    "I want it to feel like you're talking to the website, not a chatbar",
    then "Don't call it AI sales, call it Pancake"), and the pill opens the
    full-screen call (AI_CALL below). The intro
    (2026-09-16, direct calendar, landing-voice) names the calendar the team
    size routed to: the frame opens compact, with Calendly's own event title
    hidden, so this line is where the visitor learns what they are booking.
    No "Submit" any more (no routing form); name and email are prefilled on
    every calendar. The answers line prefilled into every calendar's prep
    question is built with the URL (lib/booking.ts). slotBefore/slotAfter
    (2026-09-16, landing-voice) replace the intro once the "Talk to Pancake"
    agent opened the time the visitor picked. */
export const BOOKING = {
  title: "Pick a time",
  /** introBefore + calendar[destination key] + introAfter */
  introBefore: "Book your ",
  introAfter: " below. Your name and email are filled in.",
  /** once Pancake opened the time picked on the call: slotBefore + calendar + slotAfter */
  slotBefore: "Confirm your ",
  slotAfter: " below. Pancake filled in your details.",
  /** per lib/booking.ts DEMO_BOOKING_DESTINATIONS key; both group demos read the same */
  calendar: {
    discovery: "discovery call",
    enterprise: "enterprise call",
    groupDemo: "group demo",
    largeGroupDemo: "group demo",
  } satisfies Record<DemoBookingDestinationKey, string>,
  /** the iframe's accessible name (= the retired dialog's frame title) */
  frameTitle: "Book a demo with Pancake",
  /** shown only when the frame has not loaded after a beat */
  fallbackBefore: "Calendar not loading? ",
  fallbackLink: "Open it in a new tab",
  fallbackAfter: ".",
  aiSalesLine: "Rather talk now? Pancake answers right away.",
  aiSales: "Talk to Pancake",
} as const;

/** The full-screen voice call with the ElevenLabs agent (AiSalesCall),
    opened by BOOKING.aiSales (François, 2026-09-16: the agent takes up the
    screen, no chat). The state lines, the controls and the disclosure are
    the 2026-09-16 call brief ("Mute" / "Unmute" included); `muted` and
    `newTab` follow landing-voice.
    The same line is shown under the mascot and announced once per change. */
export const AI_CALL = {
  /** the dialog's accessible name (a visually hidden heading) */
  title: "Talk to Pancake",
  connecting: "Connecting you to Pancake",
  listening: "Listening",
  speaking: "Pancake is speaking",
  /** replaces "Listening" while the visitor's microphone is muted */
  muted: "Your mic is muted",
  ended: "Call ended",
  micDenied: "Allow your microphone to talk to Pancake.",
  failed: "We could not connect. Try again, or pick a time on the calendar.",
  /** `failed` and `back` when the call closes onto a form step */
  failedForm: "We could not connect. Try again, or fill in the form.",
  endCall: "End call",
  /** the mute pill's label: mute while the mic is on, unmute while muted */
  mute: "Mute",
  unmute: "Unmute",
  retry: "Try again",
  back: "Back to the calendar",
  backForm: "Back to the form",
  /** once the agent opened the picked time on the page (it closes by itself) */
  backSlot: "Confirm your time",
  /** disclosureBefore + privacy link + newTab (visually hidden) */
  disclosureBefore: "You are talking to an AI agent. The call is recorded. ",
  privacy: "Privacy",
  newTab: " (opens in a new tab)",
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
