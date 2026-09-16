"use client";

import { useEffect, useRef, useState } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { AI_SALES_ENABLED, type AiSalesVisitor } from "@/lib/ai-sales";
import {
  CALENDLY_MIN_PAGE_HEIGHT,
  CALENDLY_ORIGIN,
  CALENDLY_TWO_COLUMN_MIN,
  calendlyPageHeight,
  demoBookingDestination,
  demoBookingEventUrl,
  isCalendlyEventScheduled,
  type DemoBookingAnswers,
} from "@/lib/booking";
import { AiSalesCall } from "./AiSalesCall";
import { BOOKING } from "./demo-copy";

/**
 * The booking state that replaces the form in the card once
 * /api/demo-request answers 200 (François, 2026-09-16: "they're booking
 * straight with us"). DemoForm's state machine: … submitting ──200──▶
 * booking (this) ──calendly.event_scheduled──▶ booked (DemoBooked).
 *
 * The card holds the Calendly calendar the successful submission's team
 * size routes to (`answers`; lib/booking.ts demoBookingDestination mirrors
 * the live routing form's routes: François, 2026-09-16, "route you to the
 * right calendar"), as an Inline embed. The routing form itself is not
 * embedded: it would ask the same questions again. The intro names the
 * routed calendar (BOOKING.calendar). The embed is prefilled with name,
 * email and a one-line summary of the answers (team size, account, goal,
 * website; the group demos show it in their one booking question, the other
 * calls ignore it). Nothing else about the visitor goes to Calendly: the
 * frame gets the browser's default referrer policy, so only the site's
 * origin travels, and no camera or microphone permission. The visitor picks
 * a slot and confirms. The embed:
 *   - is built after mount: its colors come from the card's computed CSS
 *     and --demo-cal-primary, as LpModals did (PR #288), so the design
 *     tokens stay the single source;
 *   - follows calendly.page_height (origin and source checked, spinner
 *     reports under CALENDLY_MIN_PAGE_HEIGHT ignored) through --demo-cal-h;
 *     demo.css holds the initial height and the cap;
 *   - reports the booking with calendly.event_scheduled (origin and source
 *     checked, once): `onBooked` moves DemoForm to the booked state;
 *   - when blocked (third-party storage, an extension, a strict privacy
 *     mode) never reports a real page height: after FRAME_STUCK_MS the
 *     new-tab link to the same prefilled calendar appears (LpModals' escape
 *     hatch). The iframe's `load` event is no signal: browsers fire it for
 *     a blocked or error page too.
 * No analytics fire here (AGENTS.md: analytics changes need explicit scope).
 *
 * Focus moves to the H2 on mount. No status role on the wrapper: a live
 * region that mounts together with its content is not announced, so the
 * persistent status node in DemoForm carries the state change.
 *
 * "Talk to Pancake" opens the full-screen voice call with the ElevenLabs
 * agent "[WEBSITE] AI sales" (AiSalesCall; ElevenLabs workspace, published
 * 2026-09-16; decision page decisions/2026-09-15-demo-page-and-ai-sales-agent.md
 * in the pancake-brain repo). François, 2026-09-16: "I want it to feel like
 * you're talking to the website, not a chatbar", so the call takes the
 * screen and there is no chat. The click mounts the call, and mounting
 * starts it: lib/ai-sales.ts loads the SDK on that click, never before, and
 * the agent gets the visitor's first name and company website (`visitor`:
 * the two fields of the successful submission, nothing else). The pill is a
 * plain enabled button with no busy state of its own: the call covers the
 * page while it is open and hands focus back to the pill when it closes.
 * With no agent id (lib/ai-sales.ts) the pill renders as before, inert. Do
 * not link it to Calendly. The booked state does not repeat the pill; a
 * call still open when this state unmounts is ended.
 */

/** Calendly's first page_height report comes once its app has started,
 *  later than the document's load: long enough for a slow phone. */
const FRAME_STUCK_MS = 6000;

export function DemoBooking({
  answers,
  visitor,
  onBooked,
}: {
  answers: DemoBookingAnswers;
  visitor: AiSalesVisitor | null;
  onBooked: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  /** The frame URL, built after mount from the card's computed colors + width. */
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [frameStuck, setFrameStuck] = useState(false);
  const frameLoaded = useRef(false);
  const booked = useRef(false); // calendly.event_scheduled is acted on once
  // The listener is registered once; it calls the latest callback.
  const onBookedRef = useRef(onBooked);
  const [callOpen, setCallOpen] = useState(false);
  const destination = demoBookingDestination(answers.teamSize);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => { onBookedRef.current = onBooked; }, [onBooked]);

  // The frame's URL: the card's own colors (the frame's wrapper is
  // transparent, which Calendly cannot take), the plum pill as Calendly's
  // primary, and the compact layout (event details hidden, calendar first)
  // because the card body is always narrower than Calendly's two-column page.
  useEffect(() => {
    const wrap = frameWrapRef.current;
    if (!wrap) return;
    const card = wrap.closest<HTMLElement>(".demo-card") ?? wrap;
    const cardStyle = getComputedStyle(card);
    setFrameSrc(
      demoBookingEventUrl(answers, {
        compact: wrap.clientWidth < CALENDLY_TWO_COLUMN_MIN,
        colors: {
          background: cardStyle.backgroundColor,
          text: cardStyle.color,
          primary: getComputedStyle(wrap).getPropertyValue("--demo-cal-primary"),
        },
      }),
    );
  }, [answers]);

  // Calendly's Inline embed contract: page height and the booking. Only
  // Calendly's origin AND this frame's window are trusted.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== CALENDLY_ORIGIN) return;
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      if (isCalendlyEventScheduled(event.data)) {
        if (booked.current) return;
        booked.current = true;
        onBookedRef.current();
        return;
      }
      const height = calendlyPageHeight(event.data);
      // The loading spinner reports ~26px: only a real page resizes the
      // frame and counts as loaded; demo.css's initial height holds until
      // then.
      if (height === null || height < CALENDLY_MIN_PAGE_HEIGHT) return;
      frameLoaded.current = true;
      // A slow frame that lands after the escape hatch showed: the calendar
      // is working, so the "not loading?" line must go (QA 2026-09-16: it
      // sat under a loaded, prefilled calendar and read as broken).
      setFrameStuck(false);
      frameWrapRef.current?.style.setProperty("--demo-cal-h", `${height}px`);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The blocked-frame escape hatch: after a beat, a frame that has not sent
  // a real calendly.page_height report (the only loaded signal: `load` also
  // fires for a blocked or error page) gets the new-tab link. A frame that
  // reports in later hides it again (see the message handler).
  useEffect(() => {
    if (!frameSrc) return;
    const timer = window.setTimeout(() => {
      if (!frameLoaded.current) setFrameStuck(true);
    }, FRAME_STUCK_MS);
    return () => window.clearTimeout(timer);
  }, [frameSrc]);

  return (
    <div className="demo-success demo-success--booking">
      <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
        {BOOKING.title}
      </h2>
      <p className="demo-success__lead">
        {BOOKING.introBefore}{BOOKING.calendar[destination.key]}{BOOKING.introAfter}
      </p>
      <div className="demo-success__cal">
        <div ref={frameWrapRef} className="demo-success__frame">
          {/* Exists only in this state: nothing from Calendly loads before a
              successful submission. Unlike LpModals' embed, the referrer is
              the origin only (no /demo query string, so no ad click ids)
              and there is no camera or microphone access: a booking page
              needs neither. */}
          {frameSrc ? (
            <iframe
              ref={frameRef}
              src={frameSrc}
              title={BOOKING.frameTitle}
              allow="clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null}
        </div>
        {/* Persistent and empty until the frame is stuck (a live region that
            mounts with its text is not announced); empty, it takes no height. */}
        <p className="demo-success__fallback" role="status">
          {frameStuck && frameSrc ? (
            <>
              {BOOKING.fallbackBefore}
              <a href={frameSrc} target="_blank" rel="noopener noreferrer">{BOOKING.fallbackLink}</a>
              {BOOKING.fallbackAfter}
            </>
          ) : null}
        </p>
      </div>
      <p className="demo-success__note">{BOOKING.aiSalesLine}</p>
      {AI_SALES_ENABLED ? (
        <>
          <LpFxPill
            type="button"
            className="demo-success__cta"
            data-ai-sales-trigger=""
            aria-haspopup="dialog"
            onClick={() => setCallOpen(true)}
          >
            {BOOKING.aiSales}
          </LpFxPill>
          {callOpen ? <AiSalesCall visitor={visitor} onClose={() => setCallOpen(false)} /> : null}
        </>
      ) : (
        <LpFxPill type="button" className="demo-success__cta" data-ai-sales-trigger="">
          {BOOKING.aiSales}
        </LpFxPill>
      )}
    </div>
  );
}
