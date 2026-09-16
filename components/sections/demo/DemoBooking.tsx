"use client";

import { useEffect, useRef, useState } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { AI_SALES_ENABLED, openAiSales, type AiSalesVisitor } from "@/lib/ai-sales";
import {
  CALENDLY_MIN_PAGE_HEIGHT,
  CALENDLY_ORIGIN,
  CALENDLY_TWO_COLUMN_MIN,
  calendlyPageHeight,
  demoBookingPrefillUrl,
  isCalendlyEventScheduled,
  type DemoBookingPrefill,
} from "@/lib/booking";
import { BOOKING, SUPPORT_HREF } from "./demo-copy";

/**
 * The booking state that replaces the form in the card once
 * /api/demo-request answers 200 (François, 2026-09-16: "they're booking
 * straight with us"). DemoForm's state machine: … submitting ──200──▶
 * booking (this) ──calendly.event_scheduled──▶ booked (DemoBooked).
 *
 * The card holds the Calendly routing form (lib/booking.ts: it owns the
 * routing and feeds Attio) as an Inline embed, prefilled with the answers of
 * the successful submission (`prefill`: team size, account, goal, name,
 * email; nothing else about the visitor goes to Calendly: the frame gets the
 * browser's default referrer policy, so only the site's origin travels, and
 * no camera or microphone permission). The visitor
 * presses Calendly's own Submit, then picks a slot. The embed:
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
 *     new-tab link to the same prefilled URL appears (LpModals' escape
 *     hatch). The iframe's `load` event is no signal: browsers fire it for
 *     a blocked or error page too.
 * No analytics fire here (AGENTS.md: analytics changes need explicit scope).
 *
 * Focus moves to the H2 on mount. No status role on the wrapper: a live
 * region that mounts together with its content is not announced, so the
 * persistent status node in DemoForm carries the state change.
 *
 * "Chat with AI sales" opens the ElevenLabs agent "[WEBSITE] AI sales"
 * (ElevenLabs workspace, published 2026-09-16; decision page
 * decisions/2026-09-15-demo-page-and-ai-sales-agent.md in the pancake-brain
 * repo). lib/ai-sales.ts loads the widget script on that click, never
 * before, and mounts the widget at the bottom right of the page with the
 * visitor's first name and company website (`visitor`: the two fields of
 * the successful submission, nothing else). The pill's states:
 *
 *   idle ──click──▶ opening ──mounted──▶ ready (stays: one widget, one click)
 *                      └── load fails ──▶ error (label back, alert line, click again)
 *
 * As in DemoForm, the button is never `disabled` (the focused control would
 * drop focus to <body>): a ref guards re-entry and aria-disabled marks
 * opening and ready. Nothing in the widget's own UI is ours to style. With
 * no agent id (lib/ai-sales.ts) the pill renders as before, inert. Do not
 * link it to Calendly. The booked state does not repeat the pill; a widget
 * already open stays on the page.
 */

type AiSalesState = "idle" | "opening" | "ready" | "error";

/** Calendly's first page_height report comes once its app has started,
 *  later than the document's load: long enough for a slow phone. */
const FRAME_STUCK_MS = 6000;

export function DemoBooking({
  prefill,
  visitor,
  onBooked,
}: {
  prefill: DemoBookingPrefill;
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
  const [aiSales, setAiSales] = useState<AiSalesState>("idle");
  // Set on opening, kept on ready (the widget is open: a second click has
  // nothing to do), cleared on error so the visitor can try again.
  const aiSalesLocked = useRef(false);
  const mounted = useRef(false);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
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
      demoBookingPrefillUrl(prefill, {
        compact: wrap.clientWidth < CALENDLY_TWO_COLUMN_MIN,
        colors: {
          background: cardStyle.backgroundColor,
          text: cardStyle.color,
          primary: getComputedStyle(wrap).getPropertyValue("--demo-cal-primary"),
        },
      }),
    );
  }, [prefill]);

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

  async function onAiSales() {
    if (aiSalesLocked.current) return; // a second click while opening, or after ready
    aiSalesLocked.current = true;
    setAiSales("opening");
    let opened = false;
    try {
      await openAiSales(visitor ?? {});
      opened = true;
    } catch {
      // Offline, unpkg down, the script blocked, or the 10s timeout: the
      // line says to try again and keeps the support path.
    }
    if (!opened) aiSalesLocked.current = false;
    if (!mounted.current) return; // the booking landed (booked state) mid-load
    setAiSales(opened ? "ready" : "error");
  }

  const aiSalesBusy = aiSales === "opening" || aiSales === "ready";
  const aiSalesLabel =
    aiSales === "opening" ? BOOKING.aiSalesOpening : aiSales === "ready" ? BOOKING.aiSalesReady : BOOKING.aiSales;

  return (
    <div className="demo-success demo-success--booking">
      <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
        {BOOKING.title}
      </h2>
      <p className="demo-success__lead">{BOOKING.intro}</p>
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
          {/* Persistent from mount and empty until it changes (a live region
              that mounts with its text is not announced): the opening label,
              whose change on the pill may be missed, then where the widget
              landed and what to press. Absolutely positioned (lp-sr-only), so
              it takes no grid row. */}
          <p className="lp-sr-only" role="status">
            {aiSales === "opening" ? BOOKING.aiSalesOpening : aiSales === "ready" ? BOOKING.aiSalesOpened : ""}
          </p>
          <LpFxPill
            type="button"
            className="demo-success__cta"
            data-ai-sales-trigger=""
            data-state={aiSales}
            aria-disabled={aiSalesBusy}
            onClick={onAiSales}
          >
            {aiSalesLabel}
          </LpFxPill>
          {aiSales === "error" ? (
            <p className="demo-success__error" role="alert">
              {BOOKING.aiSalesErrorBefore}<a href={SUPPORT_HREF}>{BOOKING.aiSalesErrorLink}</a>{BOOKING.aiSalesErrorAfter}
            </p>
          ) : null}
        </>
      ) : (
        <LpFxPill type="button" className="demo-success__cta" data-ai-sales-trigger="">
          {BOOKING.aiSales}
        </LpFxPill>
      )}
    </div>
  );
}
