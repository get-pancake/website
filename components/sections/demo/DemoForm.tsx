"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { submissionAttemptForEmail, type BrowserSubmissionAttempt } from "@/lib/analytics/submission-id";
import {
  EMAIL_MAX,
  GOALS,
  HAS_ACCOUNT,
  HONEYPOT_FIELD,
  NAME_MAX,
  TEAM_SIZES,
  WEBSITE_MAX,
  isDemoRequestField,
  isDemoRequestOk,
  parseDemoRequest,
  type DemoRequestField,
} from "@/lib/demo-request";
import { CARD, ERRORS, FIELDS, SUCCESS, SUPPORT_HREF } from "./demo-copy";
import { DemoSuccess } from "./DemoSuccess";

/**
 * The qualification form (the Calendly routing questions) and its state
 * machine:
 *
 *   idle ──submit──▶ submitting ──200 ok──▶ success ──restart──▶ idle
 *     ▲                  │
 *     │                  └──parse fail / 4xx / 5xx / throw──▶ error ──submit──▶ submitting
 *     └── (error is idle + message; every control stays enabled)
 *
 * Ported from brain's SignupForm (aria-busy, ids from `id`, inFlight +
 * mounted refs, role=alert error line, "Sending…", LpFxPill submit) with
 * one change: no control is ever `disabled`. Disabling the focused submit
 * drops keyboard focus to <body> (Firefox/Safari) or leaves a phantom focus
 * (Chrome), and WebKit greys disabled inputs on iOS. `inFlight` +
 * aria-busy + aria-disabled on the pill prevent re-entry instead, and
 * focus moves to the failing field or the alert on every error.
 */

type Status = "idle" | "submitting" | "error" | "success";
type ErrorKind =
  | { code: "field"; field: DemoRequestField }
  | { code: "invalid" | "rateLimited" | "unavailable" | "network" };

// Cold start + two 5s upstream timeouts, with margin; past that the user
// retries with the form intact.
const FETCH_TIMEOUT_MS = 15000;

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

function fieldOf(body: unknown): unknown {
  return typeof body === "object" && body !== null && "field" in body ? (body as { field?: unknown }).field : undefined;
}

function errorMessage(kind: ErrorKind): ReactNode {
  if (kind.code === "field") return ERRORS[kind.field];
  if (kind.code === "invalid") return ERRORS.invalid;
  if (kind.code === "network") return ERRORS.network;
  // Locked out or nothing landed: the visitor keeps a path to sales (no invented email).
  const rateLimited = kind.code === "rateLimited";
  return (
    <>
      {rateLimited ? ERRORS.rateLimitedBefore : ERRORS.unavailableBefore}
      <a href={SUPPORT_HREF}>{rateLimited ? ERRORS.rateLimitedLink : ERRORS.unavailableLink}</a>
      {rateLimited ? ERRORS.rateLimitedAfter : ERRORS.unavailableAfter}
    </>
  );
}

export function DemoForm({ id = "demo-form" }: { id?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorKind | null>(null);
  const inFlight = useRef(false); // the double-submit guard: controls stay enabled
  const mounted = useRef(false);
  // One UUID per email retry chain (Airtable upserts on it); null after a restart.
  const submission = useRef<BrowserSubmissionAttempt | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const focusFirstOnIdle = useRef(false);

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

  // After a failed submit: the failing control (focusing scrolls it into
  // view; the red border marks it and aria-describedby links the message),
  // otherwise the alert itself (tabIndex -1; on phones this brings the
  // message up from under the fold edge). Each setError is a new object, so
  // this runs on every failure.
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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // a second click or Enter while busy
    const data = new FormData(event.currentTarget);
    // Native required/email validation ran first, so in practice only the
    // website can fail here.
    const parsed = parseDemoRequest(Object.fromEntries(data));
    if (!parsed.ok) {
      setError({ code: "field", field: parsed.field });
      setStatus("error");
      return;
    }
    submission.current = submissionAttemptForEmail(submission.current, parsed.value.email);
    inFlight.current = true;
    setStatus("submitting");
    setError(null);

    let succeeded = false;
    let failure: ErrorKind | null = null;
    try {
      // Same-origin: the attribution cookie travels automatically. The
      // honeypot is posted explicitly because parsed.value drops unknown keys.
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.value,
          submissionId: submission.current.id,
          [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
        }),
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(FETCH_TIMEOUT_MS) : undefined,
      });
      const body: unknown = await response.json().catch(() => null);
      const field = fieldOf(body);
      if (response.ok && isDemoRequestOk(body)) {
        succeeded = true;
      } else if (response.status === 400 && isDemoRequestField(field)) {
        failure = { code: "field", field };
      } else if (response.status === 400 || response.status === 413) {
        // A proxy error page or a future server field name never reaches ERRORS[…] or the focus map.
        failure = { code: "invalid" };
      } else if (response.status === 429) {
        failure = { code: "rateLimited" };
      } else {
        failure = { code: "unavailable" };
      }
    } catch {
      // Includes TimeoutError / AbortError from the 15s signal: the copy says
      // to check the connection and retry, form intact.
      failure = { code: "network" };
    } finally {
      inFlight.current = false;
    }

    if (!mounted.current) return;
    if (succeeded) {
      setStatus("success");
    } else if (failure) {
      setError(failure);
      setStatus("error");
    }
  }

  // The form subtree remounts empty (unmounted in the success state; every control is uncontrolled).
  function restart() {
    submission.current = null;
    focusFirstOnIdle.current = true;
    setError(null);
    setStatus("idle");
  }

  return (
    <div id={id} className="demo-form">
      {/* Persistent, outside the swapped subtree, so its text CHANGES rather
          than mounts: "Sending your request." (the pill's label change may be
          missed) and the thank-you title (the brief's status role); the H2
          focus in DemoSuccess is the second, reliable channel. */}
      <p className="lp-sr-only" role="status">
        {busy ? CARD.sending : status === "success" ? SUCCESS.title : ""}
      </p>
      {status === "success" ? (
        <DemoSuccess onReset={restart} />
      ) : (
        <>
          <h2 id="demo-card-title" className="lp-display demo-card__title">{CARD.title}</h2>
          <p className="demo-card__intro">{CARD.intro}</p>
          {/* NO noValidate: native required/email checks give :user-invalid.
              method="post": before hydration (or with JS off) the browser
              submits natively; the HTML default is a GET that would put the
              name, email and website in the /demo URL, history and request
              logs. A POST to /demo lands nowhere useful either, but nothing
              lands in a URL (brief: never put form values in URLs).
              aria-busy sits here, on the subtree being modified, not on the
              wrapper: assistive tech may defer everything inside a busy
              subtree, which would swallow the "Sending" status above. */}
          <form className="demo-form__fields" method="post" onSubmit={onSubmit} aria-busy={busy}>
            {/* Honeypot: off-screen and out of the AT tree; bots fill it, humans never see it. */}
            <div className="lp-sr-only" aria-hidden="true">
              <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>
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
                required
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
                required
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
                required
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
                required
                maxLength={WEBSITE_MAX}
                {...invalid("website")}
              />
            </div>
            <div className="demo-form__field">
              <label className="demo-form__label" htmlFor={teamSizeId}>
                {FIELDS.teamSize}<span aria-hidden="true">{FIELDS.required}</span>
              </label>
              <div className="demo-form__select-wrap">
                <select
                  id={teamSizeId}
                  className="demo-form__input demo-form__select"
                  name="teamSize"
                  required
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
                      required
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
            {error ? (
              <p ref={errorRef} id={errorId} className="demo-form__error" role="alert" tabIndex={-1}>
                {errorMessage(error)}
              </p>
            ) : null}
            <LpFxPill type="submit" className="demo-form__submit" aria-disabled={busy}>
              {busy ? CARD.submitting : CARD.submit}
            </LpFxPill>
          </form>
          <p id={helpId} className="demo-form__help">
            {CARD.helpBefore}<a href={SUPPORT_HREF}>{CARD.helpLink}</a>{CARD.helpAfter}
          </p>
        </>
      )}
    </div>
  );
}
