"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import {
  AI_SALES_ENABLED,
  FORM_TOOL_PARAM,
  aiSalesBookingVariables,
  formToolInput,
  type AiSalesFormToolParams,
  type AiSalesFormToolResult,
} from "@/lib/ai-sales";
import { submissionAttemptForEmail, type BrowserSubmissionAttempt } from "@/lib/analytics/submission-id";
import { type DemoBookingAnswers } from "@/lib/booking";
import {
  EMAIL_MAX,
  GOALS,
  HAS_ACCOUNT,
  HONEYPOT_FIELD,
  NAME_MAX,
  TEAM_SIZES,
  WEBSITE_MAX,
  isDemoRequestField,
  parseDemoRequest,
  parsePartialDemoRequest,
  type DemoRequest,
  type DemoRequestField,
  type DemoRequestPartial,
} from "@/lib/demo-request";
import { AiSalesCall } from "./AiSalesCall";
import { BOOKED, BOOKING, CARD, ERRORS, FIELDS, PROGRESS, STEP2, SUPPORT_HREF } from "./demo-copy";
import { DemoBooked } from "./DemoBooked";
import { DemoBooking } from "./DemoBooking";

/**
 * The qualification form (the Calendly routing form's questions) in two steps
 * (François, 2026-09-16: "two steps in the form, just like on ElevenLabs"),
 * then the booking hand-off (François, 2026-09-16: "they're booking
 * straight with us"), and its state machine:
 *
 *   step 1 (identity) ──"Let's go"──▶ step 2 (qualification) ──"Pick a time"──▶ submitting
 *        ▲    ▲                           │         ▲                                   │
 *        │    └──────────── Back ─────────┘         │                    ┌── 200 ok ────┤
 *        │                                          │                    ▼              │
 *        │   error (idle + message, on the step ────┘                 booking           │
 *        │   that owns the failing field) ◀── parse fail / 4xx / 5xx / throw ◀──────────┘
 *        │                                                               │
 *        │                                                  calendly.event_scheduled
 *        │                                                               ▼
 *        └──────────────────────── restart (empty form) ◀───────────  booked
 *
 * booking (DemoBooking): the Calendly calendar the team size routes to,
 * inline and prefilled from the successful submission's answers
 * (lib/booking.ts mirrors the routing form's routes, so Calendly never asks
 * the questions again; François, 2026-09-16), plus "Talk to Pancake" (the
 * full-screen voice call, AiSalesCall). Its own error paths stay inside it:
 * a frame that never loads shows a new-tab link to the same prefilled
 * calendar, and a call that cannot start shows its own failure state with
 * "Try again". booked (DemoBooked): the confirmation, the demo
 * video and "Start a new submission". No state leads back from booking to
 * the form: name and email stay editable on Calendly's booking page, and a
 * different team size means a new visit to /demo.
 *
 * Both step groups stay mounted inside the ONE <form>: every control is
 * uncontrolled, so hiding the inactive group (display:none via `hidden`)
 * keeps the values across Back, and the single POST at the end carries
 * every field. Only the active step's submit button is rendered, so the
 * form's default button (implicit submission on Enter) is always the
 * visible one: on step 1 it advances, on step 2 it sends. Step 2's
 * controls are `required` only while step 2 is shown: Chrome refuses to
 * focus an invalid hidden control and would block step 1's submit. A tap
 * within STEP_SETTLE_MS of a step change is ignored: on phones the other
 * step's button sits under the finger (see `stepJustChanged`).
 *
 * Ported from brain's SignupForm (aria-busy, ids from `id`, inFlight +
 * mounted refs, role=alert error line, "Sending…", LpFxPill submit) with
 * one change: no control is ever `disabled`. Disabling the focused submit
 * drops keyboard focus to <body> (Firefox/Safari) or leaves a phantom focus
 * (Chrome), and WebKit greys disabled inputs on iOS. `inFlight` +
 * aria-busy + aria-disabled on the pill prevent re-entry instead, and
 * focus moves to the failing field or the alert on every error.
 *
 * "Talk to Pancake" (François, 2026-09-16: "choose to directly talk to
 * Pancake's AI instead ... next to Let's go ... on both steps of the
 * form"): beside the submit on both steps, and in the booking state. This
 * component owns the one full-screen call (AiSalesCall), so a call keeps
 * running while the form moves on under it. The call starts with the
 * answers valid so far (parsePartialDemoRequest; the booking state passes
 * the submitted answers). The agent asks for the rest and sends them through
 * its browser tool: `answerByVoice` runs the same parser and the same
 * request as the submit (`sendRequest`), then moves to the booking state
 * behind the call; the agent gets back a field error or the booking values.
 * A booking the agent makes moves the page to "You're booked" when the call
 * closes.
 */

type Status = "idle" | "submitting" | "error" | "booking" | "booked";
type Step = 1 | 2;
type ErrorKind =
  | { code: "field"; field: DemoRequestField }
  | { code: "invalid" };

// Cold start + two 5s upstream timeouts, with margin; past that the user
// retries with the form intact.
const FETCH_TIMEOUT_MS = 15000;
// The phone double-tap guard (see stepJustChanged). Longer than any
// double-tap, shorter than the time a human needs to reach the other
// step's button: the second tap of a double-tap arrives within ~300ms.
const STEP_SETTLE_MS = 400;

/** Explicit control ids, never the form's named-element lookup: for
    hasAccount that returns a RadioNodeList, which has no focus().
    submissionId has no control and is handled like a non-field error. */
function controlIdFor(id: string, field: DemoRequestField): string | undefined {
  switch (field) {
    case "firstName": return `${id}-first-name`;
    case "lastName": return `${id}-last-name`;
    case "email": return `${id}-email`;
    case "website": return `${id}-website`;
    case "teamSize": return `${id}-team-size`;
    case "hasAccount": return `${id}-has-account-yes`;
    case "goal": return `${id}-goal`;
    default: return undefined;
  }
}

/** The step that shows a field's control; null for submissionId (no control). */
function stepOf(field: DemoRequestField): Step | null {
  switch (field) {
    case "firstName":
    case "lastName":
    case "email":
    case "website":
      return 1;
    case "teamSize":
    case "hasAccount":
    case "goal":
      return 2;
    default:
      return null;
  }
}

function fieldOf(body: unknown): unknown {
  return typeof body === "object" && body !== null && "field" in body ? (body as { field?: unknown }).field : undefined;
}

// Only the visitor's own input can block the flow: a server-side delivery
// problem never does (see onSubmit).
function errorMessage(kind: ErrorKind): ReactNode {
  return kind.code === "field" ? ERRORS[kind.field] : ERRORS.invalid;
}

export function DemoForm({ id = "demo-form" }: { id?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState<Step>(1);
  // Step 1's "Let's go" is a real submit, and a submit attempt makes every
  // invalid control match :user-invalid from then on (spec: "user
  // interacted" includes a submit). The step-2 controls only become
  // `required` on step 2, so on arrival the empty Team size select would
  // already wear the red border before the visitor touched anything. The
  // step-2 group is marked fresh until its first change or its own submit
  // attempt (the `invalid` event fires per control on a blocked submit).
  const [step2Touched, setStep2Touched] = useState(false);
  const [error, setError] = useState<ErrorKind | null>(null);
  // What the SUCCESSFUL submission hands on, and a restart clears: the
  // answers the Calendly event URL uses (the team size picks the calendar;
  // name, email and the answers line prefill it) and the "Talk to Pancake"
  // agent books with, both in DemoBooking. The submission id goes to
  // /api/demo-request only, never to DemoBooking (Calendly or the agent).
  const [answers, setAnswers] = useState<DemoBookingAnswers | null>(null);
  const inFlight = useRef(false); // the double-submit guard: controls stay enabled
  const mounted = useRef(false);
  // One UUID per email retry chain (Airtable upserts on it); null after a restart.
  const submission = useRef<BrowserSubmissionAttempt | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const focusFirstOnIdle = useRef(false);
  const focusTitleOnStep = useRef(false);
  const stepChangedAt = useRef(0); // set by goTo; read by stepJustChanged
  const formRef = useRef<HTMLFormElement>(null);
  // The call: open with the answers known at the click. `statusRef` lets the
  // agent's tool, which runs outside React's render, see the live state.
  const [call, setCall] = useState<{ known: DemoRequestPartial; sent: boolean } | null>(null);
  const bookedInCall = useRef(false);
  const callOpen = useRef(false); // read by a booking reported after the call closed
  const statusRef = useRef<Status>("idle");
  statusRef.current = status;

  const firstNameId = `${id}-first-name`;
  const lastNameId = `${id}-last-name`;
  const emailId = `${id}-email`;
  const websiteId = `${id}-website`;
  const teamSizeId = `${id}-team-size`;
  const hasAccountId = `${id}-has-account`;
  const goalId = `${id}-goal`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const busy = status === "submitting";
  const invalidField = error?.code === "field" ? error.field : null;
  const invalid = (field: DemoRequestField) =>
    invalidField === field ? { "aria-invalid": true as const, "aria-describedby": errorId } : {};

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // After "Let's go" or Back: the step's title (tabIndex -1, no ring; the
  // booking and booked H2s get the same treatment). One channel for the step
  // change: the heading announces the new step and, on phones, brings the
  // card top back into view. Never on first load, never on restart (First name) and
  // never on a server error that flips the step (the failing control wins:
  // this effect is declared first so the error effect below focuses last).
  useEffect(() => {
    if (!focusTitleOnStep.current) return;
    focusTitleOnStep.current = false;
    titleRef.current?.focus();
  }, [step]);

  // After a failed submit: the failing control (focusing scrolls it into
  // view; the red border marks it and aria-describedby links the message),
  // otherwise the alert itself (tabIndex -1; on phones this brings the
  // message up from under the fold edge). Each setError is a new object, so
  // this runs on every failure. `fail` has already switched to the step
  // that shows the control, in the same commit, so it is displayed here.
  useEffect(() => {
    if (!error) return;
    const controlId = error.code === "field" ? controlIdFor(id, error.field) : undefined;
    if (controlId) {
      document.getElementById(controlId)?.focus();
      return;
    }
    errorRef.current?.focus();
  }, [error, id]);

  // Never autofocus on first load: only after "Start a new submission".
  useEffect(() => {
    if (status === "idle" && focusFirstOnIdle.current) {
      focusFirstOnIdle.current = false;
      firstNameRef.current?.focus();
    }
  }, [status]);

  /** Show the error on the step that owns the failing control (a server 400
      naming a step-1 field arrives while step 2 is shown). */
  function fail(kind: ErrorKind) {
    if (kind.code === "field") {
      const owner = stepOf(kind.field);
      if (owner) setStep(owner);
    }
    setError(kind);
    setStatus("error");
  }

  function goTo(next: Step) {
    focusTitleOnStep.current = true;
    stepChangedAt.current = Date.now();
    setError(null);
    setStatus("idle");
    setStep(next);
  }

  /** The phone double-tap guard. A click flushes the new step before the
      second tap of a double-tap lands, and at ≤767px the top half of
      "Let's go" sits where Back renders on step 2 (and Back's lower half
      where "Let's go" renders on step 1), so that second tap would bounce
      the visitor straight back with no error to explain it. Ignore it, the
      way the kit's pill FX ignores touch pointerenter. A keyboard user
      cannot reach the other step's button in STEP_SETTLE_MS. */
  function stepJustChanged(): boolean {
    return Date.now() - stepChangedAt.current < STEP_SETTLE_MS;
  }

  function goBack() {
    if (inFlight.current) return; // the request keeps its step
    if (stepJustChanged()) return; // the second tap of a double-tap on "Let's go"
    goTo(1);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // a second click or Enter while busy
    if (stepJustChanged()) return; // the second tap of a double-tap on Back
    const data = new FormData(event.currentTarget);
    // Native required/email validation ran first on the visible step. The
    // shared parser reports the first failing field in form order, so on
    // step 1 it judges the identity fields (a whitespace name, "a@b", a
    // website that is not one) before it can reach the untouched
    // qualification fields; on step 2 it checks everything.
    const parsed = parseDemoRequest(Object.fromEntries(data));
    if (step === 1) {
      if (!parsed.ok && stepOf(parsed.field) === 1) {
        fail({ code: "field", field: parsed.field });
        return;
      }
      goTo(2); // never a request from step 1
      return;
    }
    if (!parsed.ok) {
      fail({ code: "field", field: parsed.field });
      return;
    }
    await sendRequest(parsed.value, String(data.get(HONEYPOT_FIELD) ?? ""));
  }

  /**
   * The request both paths send (the submit, and the agent's browser tool),
   * then the booking state. Returns the answers when the calendar opened,
   * or the failure it showed.
   */
  async function sendRequest(
    value: DemoRequest,
    honeypot: string,
  ): Promise<{ answers: DemoBookingAnswers } | { failure: ErrorKind } | null> {
    submission.current = submissionAttemptForEmail(submission.current, value.email);
    inFlight.current = true;
    setStatus("submitting");
    setError(null);

    // The booking is the conversion (founder 2026-09-16: "they're booking
    // straight with us"), and Calendly records it and feeds Attio. The POST
    // only notifies the team (Slack / Airtable), so it is best effort: only a
    // 400 about the visitor's own input stops them. A 403, 429, 5xx
    // (including "no delivery configured"), timeout or network error still
    // opens the calendar; the route logs every delivery failure server side
    // (without form values). QA 2026-09-16: an unconfigured Preview blocked
    // every visitor from booking.
    let proceed = false;
    let failure: ErrorKind | null = null;
    try {
      // Same-origin: the attribution cookie travels automatically. The
      // honeypot is posted explicitly because the parsed value drops unknown keys.
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...value,
          submissionId: submission.current.id,
          [HONEYPOT_FIELD]: honeypot,
        }),
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(FETCH_TIMEOUT_MS) : undefined,
      });
      const body: unknown = await response.json().catch(() => null);
      const field = fieldOf(body);
      if (response.status === 400 && isDemoRequestField(field)) {
        failure = { code: "field", field };
      } else if (response.status === 400 || response.status === 413) {
        // A proxy error page or a future server field name never reaches ERRORS[…] or the focus map.
        failure = { code: "invalid" };
      } else {
        // 200, or a delivery-side refusal: the calendar opens either way.
        proceed = true;
      }
    } catch {
      // TimeoutError / AbortError from the 15s signal or a network error:
      // the notification is lost, the booking is not.
      proceed = true;
    } finally {
      inFlight.current = false;
    }

    // Unmounted, or the call closed on a booking while this was in flight:
    // "You're booked" stays.
    if (!mounted.current || statusRef.current === "booked") return null;
    if (proceed) {
      const { firstName, lastName, email, website, teamSize, hasAccount, goal } = value;
      const next: DemoBookingAnswers = { firstName, lastName, email, website, teamSize, hasAccount, ...(goal ? { goal } : {}) };
      setAnswers(next);
      setStatus("booking");
      return { answers: next };
    }
    if (failure) {
      fail(failure);
      return { failure };
    }
    return null;
  }

  /** The call, from a form step (the answers valid so far) or the booking
      state (the submitted answers). */
  function openCall() {
    if (!AI_SALES_ENABLED || call) return;
    if (inFlight.current) return; // the request decides the state first
    if (stepJustChanged()) return; // the second tap of a double-tap on the step's button
    const sent = statusRef.current === "booking" && answers !== null;
    const known: DemoRequestPartial =
      sent && answers
        ? parsePartialDemoRequest(answers)
        : formRef.current
          ? parsePartialDemoRequest(Object.fromEntries(new FormData(formRef.current)))
          : {};
    callOpen.current = true;
    setCall({ known, sent });
  }

  /** The agent's browser tool: the answers it collected, sent like the form. */
  async function answerByVoice(params: AiSalesFormToolParams): Promise<AiSalesFormToolResult> {
    if (!mounted.current) return { ok: false, field: "", message: "The page is closed." };
    if (statusRef.current === "booked" || bookedInCall.current) {
      return { ok: false, field: "", message: "The visitor is already booked. Do not book again." };
    }
    if (inFlight.current) {
      return { ok: false, field: "", message: "The form is still sending. Wait a moment, then try once more." };
    }
    const input = formToolInput(params);
    // The email the form already has wins: the agent never sees it, so any
    // address it sends in its place would be a guess.
    if (call?.known.email) input.email = call.known.email;
    const parsed = parseDemoRequest(input);
    if (!parsed.ok) {
      return { ok: false, field: FORM_TOOL_PARAM[parsed.field], message: ERRORS[parsed.field] };
    }
    const outcome = await sendRequest(parsed.value, "");
    if (outcome && "answers" in outcome) {
      const sentAnswers = outcome.answers;
      // A retry of this call (Try again) starts from the sent request.
      setCall((open) => (open ? { known: parsePartialDemoRequest(sentAnswers), sent: true } : open));
      const booking = aiSalesBookingVariables(sentAnswers, BOOKING.calendar);
      return {
        ok: true,
        message: `Sent. The ${booking.booking_meeting_name} calendar is now on the page behind the call, with their name and email filled in.`,
        first_name: sentAnswers.firstName,
        last_name: sentAnswers.lastName,
        email: sentAnswers.email,
        email_known: "yes",
        company_website: sentAnswers.website,
        team_size: sentAnswers.teamSize,
        has_pancake_account: sentAnswers.hasAccount === "yes" ? "Yes" : "No",
        goal: sentAnswers.goal ?? "",
        ...booking,
      };
    }
    const failed = outcome?.failure;
    return failed?.code === "field"
      ? { ok: false, field: FORM_TOOL_PARAM[failed.field], message: ERRORS[failed.field] }
      : { ok: false, field: "", message: ERRORS.invalid };
  }

  function closeCall() {
    callOpen.current = false;
    setCall(null);
    if (bookedInCall.current) {
      bookedInCall.current = false;
      if (mounted.current) setStatus("booked");
    }
  }

  /** DemoBooking calls it once: on Calendly's calendly.event_scheduled, or
      when a call in which the agent booked closes. */
  function onBooked() {
    setStatus("booked");
  }

  // The form subtree remounts empty on step 1 (unmounted in the booking and
  // booked states; every control is uncontrolled).
  function restart() {
    submission.current = null;
    bookedInCall.current = false;
    focusFirstOnIdle.current = true;
    setAnswers(null);
    setError(null);
    setStatus("idle");
    setStep(1);
    setStep2Touched(false);
  }

  return (
    <div id={id} className="demo-form">
      {call ? (
        <AiSalesCall
          known={call.known}
          sent={call.sent}
          returnsTo={status === "booking" || status === "booked" ? "calendar" : "form"}
          onFormAnswers={answerByVoice}
          onBooked={() => {
            if (callOpen.current) {
              bookedInCall.current = true;
              return;
            }
            // Reported while the call was already closing (Escape): show it now.
            if (mounted.current && statusRef.current === "booking") setStatus("booked");
          }}
          onClose={closeCall}
        />
      ) : null}
      {/* Persistent, outside the swapped subtree, so its text CHANGES rather
          than mounts: "Sending your request." (the pill's label change may be
          missed), then the booking and booked titles (the brief's status
          role); the H2 focus in DemoBooking / DemoBooked is the second,
          reliable channel. Step changes are not announced here: the focused
          step title is their channel. */}
      <p className="lp-sr-only" role="status">
        {busy ? CARD.sending : status === "booking" ? BOOKING.title : status === "booked" ? BOOKED.title : ""}
      </p>
      {status === "booking" && answers ? (
        <DemoBooking answers={answers} onBooked={onBooked} onTalk={openCall} />
      ) : status === "booked" ? (
        <DemoBooked onReset={restart} />
      ) : (
        <>
          <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
            {step === 1 ? CARD.title : STEP2.title}
          </h2>
          <p className="demo-card__intro">{step === 1 ? CARD.intro : STEP2.intro}</p>
          {/* NO noValidate: native required/email checks give :user-invalid.
              method="post": before hydration (or with JS off) the browser
              submits natively; the HTML default is a GET that would put the
              name, email and website in the /demo URL, history and request
              logs. A POST to /demo lands nowhere useful either, but nothing
              lands in a URL (brief: never put form values in URLs).
              aria-busy sits here, on the subtree being modified, not on the
              wrapper: assistive tech may defer everything inside a busy
              subtree, which would swallow the "Sending" status above. */}
          <form ref={formRef} className="demo-form__fields" method="post" onSubmit={onSubmit} aria-busy={busy}>
            {/* Honeypot: off-screen and out of the AT tree; bots fill it, humans never see it. */}
            <div className="lp-sr-only" aria-hidden="true">
              <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>
            {/* Step 1: identity. `required` only while shown, like step 2:
                a hidden control the browser cannot focus must never block
                the visible step's submit; the parser catches it instead. */}
            <div className="demo-form__step" data-step="1" hidden={step !== 1}>
              <div className="demo-form__field">
                <label className="demo-form__label" htmlFor={firstNameId}>
                  {FIELDS.firstName}<span aria-hidden="true">{FIELDS.required}</span>
                </label>
                <input
                  ref={firstNameRef}
                  id={firstNameId}
                  className="demo-form__input"
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  required={step === 1}
                  maxLength={NAME_MAX}
                  {...invalid("firstName")}
                />
              </div>
              <div className="demo-form__field">
                <label className="demo-form__label" htmlFor={lastNameId}>
                  {FIELDS.lastName}<span aria-hidden="true">{FIELDS.required}</span>
                </label>
                <input
                  id={lastNameId}
                  className="demo-form__input"
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  required={step === 1}
                  maxLength={NAME_MAX}
                  {...invalid("lastName")}
                />
              </div>
              <div className="demo-form__field">
                <label className="demo-form__label" htmlFor={emailId}>
                  {FIELDS.email}<span aria-hidden="true">{FIELDS.required}</span>
                </label>
                <input
                  id={emailId}
                  className="demo-form__input"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={FIELDS.emailPlaceholder}
                  required={step === 1}
                  maxLength={EMAIL_MAX}
                  {...invalid("email")}
                />
              </div>
              <div className="demo-form__field">
                <label className="demo-form__label" htmlFor={websiteId}>
                  {FIELDS.website}<span aria-hidden="true">{FIELDS.required}</span>
                </label>
                {/* type=text, not url: "acme.com" must pass (the route adds the scheme). */}
                <input
                  id={websiteId}
                  className="demo-form__input"
                  type="text"
                  name="website"
                  autoComplete="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={FIELDS.websitePlaceholder}
                  required={step === 1}
                  maxLength={WEBSITE_MAX}
                  {...invalid("website")}
                />
              </div>
            </div>
            {/* Step 2: qualification. */}
            <div
              className="demo-form__step"
              data-step="2"
              data-fresh={step === 2 && !step2Touched ? "" : undefined}
              hidden={step !== 2}
              onChangeCapture={() => setStep2Touched(true)}
              onInvalidCapture={() => setStep2Touched(true)}
            >
              <div className="demo-form__field">
                <label className="demo-form__label" htmlFor={teamSizeId}>
                  {FIELDS.teamSize}<span aria-hidden="true">{FIELDS.required}</span>
                </label>
                <div className="demo-form__select-wrap">
                  <select
                    id={teamSizeId}
                    className="demo-form__input demo-form__select"
                    name="teamSize"
                    required={step === 2}
                    defaultValue=""
                    {...invalid("teamSize")}
                  >
                    <option value="" disabled>{FIELDS.choose}</option>
                    {TEAM_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>
              </div>
              {/* The fieldset is not a control: it carries the description, both radios the invalid flag. */}
              <fieldset
                id={hasAccountId}
                className="demo-form__group"
                aria-describedby={invalidField === "hasAccount" ? errorId : undefined}
              >
                <legend className="demo-form__legend">
                  {FIELDS.hasAccount}<span aria-hidden="true">{FIELDS.required}</span>
                </legend>
                <div className="demo-form__radios">
                  {HAS_ACCOUNT.map((value) => (
                    <label key={value} className="demo-form__radio" htmlFor={`${hasAccountId}-${value}`}>
                      <input
                        id={`${hasAccountId}-${value}`}
                        type="radio"
                        name="hasAccount"
                        value={value}
                        required={step === 2}
                        aria-invalid={invalidField === "hasAccount" ? true : undefined}
                      />
                      {value === "yes" ? FIELDS.yes : FIELDS.no}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="demo-form__field">
                {/* No star: optional. */}
                <label className="demo-form__label" htmlFor={goalId}>{FIELDS.goal}</label>
                <div className="demo-form__select-wrap">
                  <select
                    id={goalId}
                    className="demo-form__input demo-form__select"
                    name="goal"
                    defaultValue=""
                    {...invalid("goal")}
                  >
                    <option value="">{FIELDS.choose}</option>
                    {GOALS.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* One alert for both steps, under the visible group: `fail`
                shows the step that owns the field, so it is never about a
                hidden control. */}
            {error ? (
              <p ref={errorRef} id={errorId} className="demo-form__error" role="alert" tabIndex={-1}>
                {errorMessage(error)}
              </p>
            ) : null}
            {/* Only the active step's submit exists (see the header note on
                implicit submission). Step 1 is never busy: no request leaves
                it. Back is a plain button; while a request is in flight it
                looks busy like the submit and goBack early-returns. */}
            {/* "Talk to Pancake" is a plain button beside the submit (never
                the form's default button: it follows the submit in DOM
                order). Not rendered without an agent id. */}
            {step === 1 ? (
              <div className="demo-form__actions demo-form__actions--start">
                <LpFxPill type="submit" className="demo-form__submit">
                  {CARD.submit}
                </LpFxPill>
                {AI_SALES_ENABLED ? (
                  <LpFxPill
                    type="button"
                    className="lp-btn--outline demo-form__talk"
                    data-ai-sales-trigger=""
                    aria-haspopup="dialog"
                    onClick={openCall}
                  >
                    {CARD.talk}
                  </LpFxPill>
                ) : null}
              </div>
            ) : (
              <div className="demo-form__actions">
                {/* DOM order = visual order: the submit pair first, Back under
                    it when the row wraps (and last in the tab order). */}
                <div className="demo-form__actions-end">
                  <LpFxPill
                    type="submit"
                    className="demo-form__submit"
                    aria-disabled={busy}
                    onClick={(event) => {
                      // A double-click on "Let's go" lands here on desktop:
                      // cancel it before the browser validates step 2.
                      if (stepJustChanged()) event.preventDefault();
                    }}
                  >
                    {busy ? CARD.submitting : STEP2.submit}
                  </LpFxPill>
                  {AI_SALES_ENABLED ? (
                    <LpFxPill
                      type="button"
                      className="lp-btn--outline demo-form__talk"
                      data-ai-sales-trigger=""
                      aria-haspopup="dialog"
                      aria-disabled={busy}
                      onClick={openCall}
                    >
                      {CARD.talk}
                    </LpFxPill>
                  ) : null}
                </div>
                <LpFxPill type="button" className="lp-btn--outline demo-form__back" aria-disabled={busy} onClick={goBack}>
                  {STEP2.back}
                </LpFxPill>
              </div>
            )}
          </form>
          {/* Help line left, the two-segment progress bar right (ElevenLabs);
              stacked on phones. The bar is decoration; "Step n of 2" is the
              text. Not after a successful submission. */}
          <div className="demo-form__foot">
            <p id={helpId} className="demo-form__help">
              {CARD.helpBefore}<a href={SUPPORT_HREF}>{CARD.helpLink}</a>{CARD.helpAfter}
            </p>
            <div className="demo-form__progress">
              <span className="lp-sr-only">{step === 1 ? PROGRESS.step1 : PROGRESS.step2}</span>
              <span className="demo-form__progress-bar" aria-hidden="true">
                <span className="demo-form__progress-seg" data-filled="" />
                <span className="demo-form__progress-seg" data-filled={step === 2 ? "" : undefined} />
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
