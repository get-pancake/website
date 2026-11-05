"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { LpFxLink, LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import {
  CALENDLY_MIN_PAGE_HEIGHT,
  CALENDLY_ORIGIN,
  CALENDLY_TWO_COLUMN_MIN,
  calendlyPageHeight,
  calendlyScheduledUris,
  isCalendlyEventScheduled,
  whiteGloveBookingEmbedUrl,
} from "@/lib/booking";
import { COMMON_COUNTRIES, COUNTRIES } from "@/lib/countries";
import { isPersonalEmail } from "@/lib/personal-email";
import { APP_ORIGIN } from "@/lib/site-config.mjs";
import { WHITE_GLOVE_PRICING_HREF } from "@/lib/white-glove";
import {
  WG_BOOK_ANCHOR,
  WG_EMAIL_MAX,
  WG_GTM_TEAM,
  WG_HONEYPOT,
  WG_SIZES,
  wgContextLine,
  type WgAnswers,
  type WgField,
  type WgResponse,
} from "@/lib/white-glove-demo";
import { WG_BOOK as c } from "./white-glove-copy";

/**
 * The /white-glove "Book a demo" card, the hero's right column (the White
 * Glove campaign's ask, 2026-11-05): a work email and three questions, then one of four states in
 * the same card. POST /api/white-glove/demo decides which
 * (lib/white-glove-demo.ts wgRoute; docs/white-glove-demo.md):
 *   form ──book──▶ calendar ──calendly.event_scheduled──▶ booked
 *        ──review──▶ review (François's queue emails a booking link)
 *        ──self_serve──▶ self-serve (Start free, no meeting)
 * The calendar is the White Glove event as an Inline embed, prefilled with
 * the email and the answers line (lib/booking.ts whiteGloveBookingEmbedUrl);
 * nothing from Calendly loads before a `book` answer. Its booking message
 * sends the signed pass back (POST /api/white-glove/booked, keepalive), which
 * opens the Attio deal; the card says "booked" whatever that call answers.
 * Calendly's messages are trusted only from its origin AND this frame, as in
 * /demo's DemoBooking, whose height and blocked-frame handling this mirrors.
 * No analytics fire here (AGENTS.md: analytics changes need explicit scope).
 * Focus moves to each new state's heading; the page's other "Book a demo"
 * links point at #book-demo, which focuses the email field.
 */

type Draft = { email: string; size: string; country: string; gtmTeam: string };
type View =
  | { kind: "form" }
  | { kind: "calendar"; answers: WgAnswers; booking: string | null }
  | { kind: "booked" }
  | { kind: "review" }
  | { kind: "self_serve" };
type FormError = { field?: WgField; message: string };

const EMPTY: Draft = { email: "", size: "", country: "", gtmTeam: "" };
/** Calendly's first page_height report comes once its app has started: long enough for a slow phone. */
const FRAME_STUCK_MS = 6000;

export function WgBookDemo() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [view, setView] = useState<View>({ kind: "form" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const inFlight = useRef(false);
  const submissionId = useRef("");
  const emailRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const firstView = useRef(true);

  // Each new state's heading takes the focus (not on the first paint).
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [view.kind]);

  // #book-demo (the page's other "Book a demo" links): the email field takes the focus.
  useEffect(() => {
    const focusForm = () => {
      if (window.location.hash === `#${WG_BOOK_ANCHOR}`) emailRef.current?.focus({ preventScroll: true });
    };
    focusForm();
    window.addEventListener("hashchange", focusForm);
    return () => window.removeEventListener("hashchange", focusForm);
  }, []);

  const set = (key: keyof Draft) => (value: string) => {
    submissionId.current = ""; // a changed answer is a new request
    setError((current) => (current?.field === key || !current?.field ? null : current));
    setDraft((d) => ({ ...d, [key]: value }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    if (isPersonalEmail(draft.email.trim())) {
      setError({ field: "email", message: c.errors.personal });
      emailRef.current?.focus();
      return;
    }
    inFlight.current = true;
    setPending(true);
    setError(null);
    if (!submissionId.current) submissionId.current = crypto.randomUUID();
    try {
      const response = await fetch("/api/white-glove/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          email: draft.email.trim(),
          submissionId: submissionId.current,
          [WG_HONEYPOT]: new FormData(form).get(WG_HONEYPOT) ?? "",
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const result = (await response.json().catch(() => null)) as WgResponse | null;
      if (!result) throw new Error(c.errors.failed);
      if (!result.ok) {
        setError({ field: result.field === "submissionId" ? undefined : result.field, message: result.error });
        if (result.field === "email") emailRef.current?.focus();
        return;
      }
      if (result.route === "book") {
        setView({ kind: "calendar", answers: { ...(draft as WgAnswers), email: draft.email.trim().toLowerCase() }, booking: result.booking });
      } else {
        setView({ kind: result.route });
      }
    } catch (err) {
      setError({ message: err instanceof Error && err.name === "TimeoutError" ? c.errors.timeout : c.errors.failed });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const fieldError = (field: WgField) =>
    error?.field === field ? (
      <p id={`wg-${field}-error`} className="wg-field__error" role="alert">
        {error.message}
      </p>
    ) : null;
  const describedBy = (field: WgField) => (error?.field === field ? `wg-${field}-error` : undefined);
  const onBooked = useCallback(() => setView({ kind: "booked" }), []);

  return (
    <section id={WG_BOOK_ANCHOR} className="wg-book" aria-labelledby="wg-book-title" data-view={view.kind}>
      {view.kind === "form" ? (
        <form className="wg-book__form" onSubmit={submit}>
          {/* never a real field: bots fill it, humans never see it */}
          <div className="lp-sr-only" aria-hidden="true">
            <label>
              Nickname
              <input name={WG_HONEYPOT} tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
          </div>
          <h2 id="wg-book-title" ref={titleRef} tabIndex={-1} className="wg-book__title">
            {c.title}
          </h2>
          <p className="wg-book__lede">{c.lede}</p>
          <fieldset className="wg-book__fields" disabled={pending}>
            <div className="wg-field">
              <label className="wg-field__label" htmlFor="wg-email">
                {c.email.label}
              </label>
              <input
                ref={emailRef}
                id="wg-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={WG_EMAIL_MAX}
                placeholder={c.email.placeholder}
                className="wg-field__input"
                value={draft.email}
                onChange={(e) => set("email")(e.target.value)}
                aria-invalid={error?.field === "email" || undefined}
                aria-describedby={describedBy("email")}
              />
              {fieldError("email")}
            </div>
            <div className="wg-field__pair">
              <div className="wg-field">
                <label className="wg-field__label" htmlFor="wg-size">
                  {c.size.label}
                </label>
                <select
                  id="wg-size"
                  name="size"
                  required
                  className="wg-field__input wg-field__select"
                  value={draft.size}
                  onChange={(e) => set("size")(e.target.value)}
                  aria-invalid={error?.field === "size" || undefined}
                  aria-describedby={describedBy("size")}
                >
                  <option value="" disabled>
                    {c.select}
                  </option>
                  {WG_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                {fieldError("size")}
              </div>
              <div className="wg-field">
                <label className="wg-field__label" htmlFor="wg-country">
                  {c.country.label}
                </label>
                <select
                  id="wg-country"
                  name="country"
                  required
                  autoComplete="country-name"
                  className="wg-field__input wg-field__select"
                  value={draft.country}
                  onChange={(e) => set("country")(e.target.value)}
                  aria-invalid={error?.field === "country" || undefined}
                  aria-describedby={describedBy("country")}
                >
                  <option value="" disabled>
                    {c.select}
                  </option>
                  <optgroup label={c.country.common}>
                    {COMMON_COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={c.country.all}>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {fieldError("country")}
              </div>
            </div>
            <fieldset className="wg-field wg-choice" aria-describedby={describedBy("gtmTeam") ?? "wg-gtm-hint"}>
              <legend className="wg-field__label">{c.gtm.legend}</legend>
              <div className="wg-choice__options">
                {WG_GTM_TEAM.map((value) => (
                  <label key={value} className="wg-choice__option">
                    <input
                      type="radio"
                      name="gtmTeam"
                      value={value}
                      required
                      checked={draft.gtmTeam === value}
                      onChange={(e) => set("gtmTeam")(e.target.value)}
                    />
                    <span>{value === "yes" ? c.gtm.yes : c.gtm.no}</span>
                  </label>
                ))}
              </div>
              <p id="wg-gtm-hint" className="wg-field__hint">
                {c.gtm.hint}
              </p>
              {fieldError("gtmTeam")}
            </fieldset>
          </fieldset>
          {error && !error.field ? (
            <p className="wg-book__error" role="alert">
              {error.message}
            </p>
          ) : null}
          <div className="wg-book__actions">
            <LpFxPill type="submit" className="wg-book__submit" disabled={pending} aria-busy={pending || undefined}>
              {pending ? c.sending : c.submit}
            </LpFxPill>
          </div>
          <p className="wg-book__fine">{c.fine}</p>
        </form>
      ) : view.kind === "calendar" ? (
        <div className="wg-book__state wg-book__state--calendar">
          <h2 id="wg-book-title" ref={titleRef} tabIndex={-1} className="wg-book__title">
            {c.booking.title}
          </h2>
          <p className="wg-book__lede">{c.booking.lede}</p>
          <WgCalendar answers={view.answers} booking={view.booking} onBooked={onBooked} />
        </div>
      ) : (
        <div className="wg-book__state">
          <h2 id="wg-book-title" ref={titleRef} tabIndex={-1} className="wg-book__title">
            {view.kind === "booked" ? c.booked.title : view.kind === "review" ? c.review.title : c.selfServe.title}
          </h2>
          <p className="wg-book__lede">
            {view.kind === "booked" ? c.booked.body : view.kind === "review" ? c.review.body : c.selfServe.body}
          </p>
          {view.kind === "self_serve" ? (
            <div className="wg-book__actions">
              <LpFxLink href={APP_ORIGIN}>{c.selfServe.cta}</LpFxLink>
              <a className="wg-link" href={WHITE_GLOVE_PRICING_HREF}>
                {c.selfServe.alt}
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

/** The White Glove calendar, prefilled; reports the booking once. */
function WgCalendar({
  answers,
  booking,
  onBooked,
}: {
  answers: WgAnswers;
  booking: string | null;
  onBooked: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const loaded = useRef(false);
  const booked = useRef(false);
  const onBookedRef = useRef(onBooked);
  const bookingRef = useRef(booking);
  useEffect(() => {
    onBookedRef.current = onBooked;
    bookingRef.current = booking;
  }, [onBooked, booking]);

  // Built after mount: the card's own colors (Calendly cannot take a
  // transparent page) and the compact layout, calendar first, because the
  // card is narrower than Calendly's two-column page.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const card = wrap.closest<HTMLElement>(".wg-book") ?? wrap;
    const cardStyle = getComputedStyle(card);
    loaded.current = false;
    setStuck(false);
    setSrc(
      whiteGloveBookingEmbedUrl(answers.email, wgContextLine(answers), {
        compact: wrap.clientWidth < CALENDLY_TWO_COLUMN_MIN,
        colors: {
          background: cardStyle.backgroundColor,
          text: cardStyle.color,
          primary: getComputedStyle(wrap).getPropertyValue("--wg-cal-primary"),
        },
      }),
    );
  }, [answers]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CALENDLY_ORIGIN) return;
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      if (isCalendlyEventScheduled(event.data)) {
        if (booked.current) return;
        booked.current = true;
        const pass = bookingRef.current;
        if (pass) {
          const uris = calendlyScheduledUris(event.data);
          // keepalive: the deal is opened even if the visitor leaves at once
          fetch("/api/white-glove/booked", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking: pass, event: uris.event, invitee: uris.invitee }),
            keepalive: true,
          }).catch(() => {});
        }
        onBookedRef.current();
        return;
      }
      const height = calendlyPageHeight(event.data);
      if (height === null || height < CALENDLY_MIN_PAGE_HEIGHT) return;
      loaded.current = true;
      setStuck(false);
      wrapRef.current?.style.setProperty("--wg-cal-h", `${height}px`);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // A frame that never reports a real page height (blocked third-party
  // storage, an extension): after a beat, the same calendar in a new tab.
  useEffect(() => {
    if (!src) return;
    const timer = window.setTimeout(() => {
      if (!loaded.current) setStuck(true);
    }, FRAME_STUCK_MS);
    return () => window.clearTimeout(timer);
  }, [src]);

  return (
    <div className="wg-cal">
      <div ref={wrapRef} className="wg-cal__frame">
        {src ? (
          <iframe
            ref={frameRef}
            src={src}
            title={c.booking.frameTitle}
            allow="clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : null}
      </div>
      <p className="wg-cal__fallback" role="status">
        {stuck && src ? (
          <>
            {c.booking.stuckBefore}
            <a href={src} target="_blank" rel="noopener noreferrer">
              {c.booking.stuckLink}
            </a>
            {c.booking.stuckAfter}
          </>
        ) : null}
      </p>
    </div>
  );
}
