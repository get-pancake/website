"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { PancakeMonster } from "@/components/mascot/pancake-monster/PancakeMonster";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import {
  AI_SALES_AGENT_ID,
  aiSalesDynamicVariables,
  loadAiSalesSdk,
  type AiSalesMode,
  type AiSalesSession,
  type AiSalesVisitor,
} from "@/lib/ai-sales";
import { AI_CALL } from "./demo-copy";

/**
 * The full-screen voice call with the ElevenLabs agent "[WEBSITE] AI sales"
 * (François, 2026-09-16: "I asked for something similar to the Eleven Labs
 * where the agent takes up the screen and there's no chat. I want it to
 * feel like you're talking to the website, not a chatbar"). DemoBooking
 * mounts it when the visitor clicks "Talk to AI sales" and unmounts it on
 * `onClose`. Styles: app/_styles/ai-sales-call.css.
 *
 * Mounting IS starting: the click that mounts it flushes this component's
 * effects in the same task (React 18 flushes effects of a discrete event
 * synchronously), so the SDK import and the microphone request begin from
 * the visitor's gesture. There is no second "start" button. The SDK loads
 * from jsDelivr on that first click (lib/ai-sales.ts).
 *
 * The microphone is asked for here, next to the SDK import, not by the SDK:
 * startSession only runs once the visitor has answered the prompt and the
 * call is still open. A call closed while the prompt is up never reaches
 * ElevenLabs; Allow afterwards only lights the mic until the stream is
 * stopped, at once. That stream stays open until startSession settles, so
 * the SDK's own microphone request finds access granted (no second prompt
 * in Safari). startSession itself cannot be cancelled: a call closed during
 * its token fetch and room join (plus a built-in 3 s delay on Android)
 * still creates the conversation, with the first name and website, and it
 * is ended the moment startSession resolves.
 *
 *   connecting ──connected──▶ listening ◀──mode──▶ speaking
 *     │  │                        │  End call / agent hangs up
 *     │  │                        ▼
 *     │  │                      ended ──Back to the calendar──▶ closed
 *     │  └─ mic refused ──▶ mic-denied ─┐
 *     └──── anything else ─▶ failed ────┴─ Try again ──▶ connecting
 *
 * A connection error during the call (onDisconnect "error") shows failed.
 * End call while still connecting closes the call: the visitor never
 * talked, so "Call ended" would be wrong (what a close can still stop: see
 * above). Escape ends the call and closes from any state. The session ends
 * (endSession) on End call, Escape, Back to the calendar, Try again,
 * unmount (a restart, the booking landing) and pagehide. Every async step
 * carries an attempt number; ending bumps it, so a stale startSession that
 * lands later is ended at once and a stale callback never sets state (also
 * after unmount).
 *
 * NO chat: no transcript, no messages, no text input. The only controls
 * during a call are End call and Mute. Muted, the pill reads "Unmute" and
 * turns filled plum (the state line also reads "Your mic is muted" while
 * listening). No aria-pressed: a toggle whose name changes must not also
 * carry a pressed state (WAI-ARIA APG button pattern), and the visible
 * label must stay in the accessible name.
 *
 * The controls swap in place (Try again → End call, End call → Back to the
 * calendar), so a click that lands within SWAP_GUARD_MS of a swap, or the
 * second click of a double-click, is ignored: it was meant for the button
 * that was there.
 *
 * Dialog: portalled to <body>, role=dialog + aria-modal, named by a visually
 * hidden heading and described by the disclosure line. Focus moves to the
 * dialog on open, to the first button when the controls change (ended,
 * errors), is trapped inside (Tab cycles, focus that escapes is pulled
 * back) and returns to the trigger on close (the "Talk to AI sales" pill
 * when the click did not focus it: Safari, Firefox on macOS). Body scroll
 * is locked while mounted. One visually hidden status region announces the
 * state line (ANNOUNCE_DELAY_MS after it changes, so a region that just
 * mounted is announced and quick flips coalesce; it is cleared first, so a
 * Try again that fails with the same line is announced again); "speaking →
 * listening" waits LISTEN_SETTLE_MS so a pause between two sentences is not
 * announced.
 * Volume never goes through React: one requestAnimationFrame loop writes
 * --ai-call-out / --ai-call-in on the stage while connected (off with
 * prefers-reduced-motion).
 */

type Phase = "connecting" | "listening" | "speaking" | "ended" | "mic-denied" | "failed";

/** A pause shorter than this keeps "AI sales is speaking" on screen. */
const LISTEN_SETTLE_MS = 600;
const ANNOUNCE_DELAY_MS = 150;
/** The SDK's volume is the mean of the voice-range bins: speech lands around
    0.1–0.35, so it is amplified before it drives the art (clamped at 1). */
const VOLUME_GAIN = 3;
/** Per-frame easing toward the new level, so the art does not jitter. */
const VOLUME_EASE = 0.25;
/** The monster's drawing fills only about 41% of its square box (VIEWBOX in
    PancakeMonster.tsx), so the box is drawn this much larger than its slot,
    centred on it (ai-sales-call.css): the character then fills about 74%
    of the slot, and the ring reads as a halo just outside it. */
const MASCOT_ART_SCALE = 1.8;
/** See the header: clicks this soon after the controls swap are ignored. */
const SWAP_GUARD_MS = 400;

/** getUserMedia refused by the visitor, the browser setting or a policy.
    Every other failure (no microphone, network, jsDelivr, ElevenLabs,
    LiveKit) is `failed`. */
function isMicDenied(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { name } = error as { name?: unknown };
  // PermissionDeniedError: Chromium's pre-standard name.
  return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function statusLine(phase: Phase, muted: boolean): string {
  switch (phase) {
    case "connecting":
      return AI_CALL.connecting;
    case "listening":
      return muted ? AI_CALL.muted : AI_CALL.listening;
    case "speaking":
      return AI_CALL.speaking;
    case "ended":
      return AI_CALL.ended;
    case "mic-denied":
      return AI_CALL.micDenied;
    case "failed":
      return AI_CALL.failed;
  }
}

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) track.stop();
}

function level(read: () => number): number {
  try {
    return Math.min(1, Math.max(0, read() * VOLUME_GAIN));
  } catch {
    return 0; // the connection is closing
  }
}

export function AiSalesCall({ visitor, onClose }: { visitor: AiSalesVisitor | null; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [muted, setMuted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  /** Bumped by Try again, so a retry that lands on the same line is announced again. */
  const [retries, setRetries] = useState(0);
  /** The mascot's px size, measured from its slot (the component takes a number). */
  const [mascotSize, setMascotSize] = useState<number | null>(null);

  const titleId = useId();
  const noteId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const sessionRef = useRef<AiSalesSession | null>(null);
  /** Bumped by every start and every stop: async work checks it before acting. */
  const attemptRef = useRef(0);
  const startingRef = useRef(false); // the double-start guard
  const connectedRef = useRef(false);
  const modeRef = useRef<AiSalesMode>("listening");
  const mutedRef = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);
  const visitorRef = useRef(visitor);
  const onCloseRef = useRef(onClose);

  useEffect(() => { visitorRef.current = visitor; }, [visitor]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  /** End whatever is running or starting; state is the caller's to set. */
  const stop = useCallback(() => {
    attemptRef.current += 1;
    startingRef.current = false;
    connectedRef.current = false;
    window.clearTimeout(settleTimer.current);
    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) void session.endSession().catch(() => {});
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current || sessionRef.current) return;
    const attempt = ++attemptRef.current;
    const current = () => attempt === attemptRef.current;
    startingRef.current = true;
    modeRef.current = "listening";
    setPhase("connecting");
    const agentId = AI_SALES_AGENT_ID;
    if (!agentId) {
      startingRef.current = false;
      setPhase("failed");
      return;
    }
    let micProbe: Promise<MediaStream> | undefined;
    try {
      // Both start inside the click (see the header). No mediaDevices (an
      // insecure context) throws here and shows failed.
      micProbe = navigator.mediaDevices.getUserMedia({ audio: true });
      const [sdk] = await Promise.all([loadAiSalesSdk(), micProbe]);
      if (!current()) return; // closed during the prompt or the load: nothing sent
      const dynamicVariables = aiSalesDynamicVariables(visitorRef.current ?? {});
      const session = await sdk.startSession({
        agentId,
        connectionType: "webrtc",
        ...(dynamicVariables ? { dynamicVariables } : {}),
        onConnect: () => {
          if (!current()) return;
          connectedRef.current = true;
          setPhase(modeRef.current === "speaking" ? "speaking" : "listening");
        },
        onModeChange: ({ mode }) => {
          if (!current()) return;
          modeRef.current = mode;
          if (!connectedRef.current) return;
          window.clearTimeout(settleTimer.current);
          if (mode === "speaking") {
            setPhase("speaking");
            return;
          }
          settleTimer.current = window.setTimeout(() => {
            setPhase((shown) => (shown === "speaking" ? "listening" : shown));
          }, LISTEN_SETTLE_MS);
        },
        onDisconnect: (details) => {
          if (!current()) return; // ended by us (stop bumped the attempt)
          sessionRef.current = null; // the SDK is already closing it
          stop();
          setPhase(details.reason === "error" ? "failed" : "ended");
        },
      });
      if (!current()) {
        // Closed, retried or unmounted while connecting.
        void session.endSession().catch(() => {});
        return;
      }
      sessionRef.current = session;
      startingRef.current = false;
      if (mutedRef.current) session.setMicMuted(true);
    } catch (error) {
      if (!current()) return;
      startingRef.current = false;
      setPhase(isMicDenied(error) ? "mic-denied" : "failed");
    } finally {
      // Our stream is released once startSession has settled (the SDK holds
      // its own by then), or when anything failed or went stale. A prompt
      // still open after a failure is released as soon as it is answered.
      void micProbe?.then(stopTracks, () => {});
    }
  }, [stop]);

  const close = useCallback(() => {
    stop();
    onCloseRef.current();
  }, [stop]);

  // Open = start. The cleanup ends the session on unmount (StrictMode's
  // dev remount included: the first attempt goes stale, the second runs).
  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  // Leaving the page (navigation, tab close, bfcache) hangs up; a page
  // restored from the back-forward cache shows "Call ended".
  useEffect(() => {
    const onPageHide = () => {
      const running = startingRef.current || sessionRef.current !== null;
      stop();
      if (running) setPhase("ended");
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [stop]);

  // Escape, the Tab trap, and focus that escapes (a click cannot reach the
  // page: the dialog covers it). Effect order matters from here on: effects
  // run, and clean up on unmount, in declaration order. This one is removed
  // before the next one hands focus back to the trigger, which it would
  // otherwise pull back into the dialog.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusables = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')).filter(
        (element) => element.getClientRects().length > 0,
      );
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) dialog.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [close]);

  // Reads the trigger as the active element before the next effect moves
  // focus into the dialog; gives focus back to it on close. Safari (iOS
  // VoiceOver included) and Firefox on macOS do not focus a button on click,
  // so the active element is <body>: the pill is found by its data attribute.
  useEffect(() => {
    const active = document.activeElement;
    const trigger =
      active instanceof HTMLElement && active !== document.body
        ? active
        : document.querySelector<HTMLElement>("[data-ai-sales-trigger]");
    return () => {
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  const group = phase === "ended" ? "ended" : phase === "mic-denied" || phase === "failed" ? "error" : "call";

  // When the controls last swapped (before paint, so no click can beat it).
  const swappedAtRef = useRef(0);
  useLayoutEffect(() => {
    swappedAtRef.current = performance.now();
  }, [group]);

  // Open, and back to connecting after Try again: the dialog itself (no ring
  // on End call, where a held Enter would hang up). Ended and errors: their
  // first button, since the one that had focus is gone.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (group === "call") {
      if (!dialog.contains(document.activeElement)) dialog.focus();
      return;
    }
    controlsRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [group]);

  // Scroll lock, restored on close and unmount.
  useEffect(() => {
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, []);

  const line = statusLine(phase, muted);

  // One announcement per shown line, never per volume frame. Cleared first:
  // a retry that fails again within the delay sets the same text, which
  // would not change the region and would not be spoken.
  useEffect(() => {
    setAnnouncement("");
    const timer = window.setTimeout(() => setAnnouncement(line), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [line, retries]);

  // The mascot takes a px size; the slot's CSS size is the source (before
  // paint, so it never shows at a wrong size).
  useLayoutEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;
    const measure = () => {
      const width = visual.getBoundingClientRect().width;
      if (width > 0) setMascotSize(Math.round(width * MASCOT_ART_SCALE));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(visual);
    return () => observer.disconnect();
  }, []);

  const connected = phase === "listening" || phase === "speaking";

  // The volume loop: CSS custom properties on the stage, no React render.
  useEffect(() => {
    const stage = stageRef.current;
    if (!connected || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let output = 0;
    let input = 0;
    const tick = () => {
      const session = sessionRef.current; // set a microtask after onConnect
      if (session) {
        output += (level(() => session.getOutputVolume()) - output) * VOLUME_EASE;
        input += (level(() => session.getInputVolume()) - input) * VOLUME_EASE;
        stage.style.setProperty("--ai-call-out", output.toFixed(3));
        stage.style.setProperty("--ai-call-in", input.toFixed(3));
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      stage.style.removeProperty("--ai-call-out");
      stage.style.removeProperty("--ai-call-in");
    };
  }, [connected]);

  /** A click meant for the button the controls just replaced (see the header). */
  function stray(event: ReactMouseEvent) {
    return event.detail > 1 || performance.now() - swappedAtRef.current < SWAP_GUARD_MS;
  }

  function endCall(event: ReactMouseEvent) {
    if (stray(event)) return;
    if (phase === "connecting") {
      close();
      return;
    }
    stop();
    setPhase("ended");
  }

  function backToCalendar(event: ReactMouseEvent) {
    if (stray(event)) return;
    close();
  }

  function retry(event: ReactMouseEvent) {
    if (stray(event)) return;
    stop();
    setRetries((count) => count + 1);
    void start();
  }

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    sessionRef.current?.setMicMuted(next); // while connecting: applied once connected
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    // The root carries `lp lp-demo`: portalled out of main.lp.lp-demo, it
    // needs the tokens, the pill recipe and the page's focus rings itself.
    <div
      ref={dialogRef}
      className="lp lp-demo ai-call"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={noteId}
      tabIndex={-1}
      data-phase={phase}
    >
      {/* The /demo nav's wordmark, in the same place; not a link here: leaving
          the page would hang up. */}
      <div className="ai-call__top">
        {/* eslint-disable-next-line @next/next/no-img-element -- same wordmark markup as the /demo nav */}
        <img className="ai-call__logo" alt="" src="/lp/lp-nav-logo.svg" width={114.956} height={56} />
      </div>
      <div ref={stageRef} className="ai-call__stage">
        <h2 id={titleId} className="lp-sr-only">
          {AI_CALL.title}
        </h2>
        <div ref={visualRef} className="ai-call__visual" aria-hidden="true">
          <span className="ai-call__ring" />
          <div className="ai-call__mascot">
            {mascotSize ? <PancakeMonster size={mascotSize} pancakeColor="yellow" disableForkCursor /> : null}
          </div>
        </div>
        {/* Shown here, spoken by the status region below (one channel each). */}
        <p className="lp-display ai-call__state" aria-hidden="true">
          {line}
        </p>
        <p className="lp-sr-only" role="status">
          {announcement}
        </p>
        <div ref={controlsRef} className="ai-call__controls">
          {group === "call" ? (
            <>
              <LpFxPill key="end" size="lg" className="ai-call__end" onClick={endCall}>
                {AI_CALL.endCall}
              </LpFxPill>
              {/* Muted: filled plum and "Unmute", readable under the hover
                  flood and on touch (no aria-pressed: see the header). The
                  fill hangs on data-muted, not the class: a className change
                  would wipe the pill's hover class (.is-fx) under the pointer
                  and leave the cream label on the pastel flood. */}
              <LpFxPill
                key="mute"
                className="lp-btn--outline ai-call__mute"
                data-muted={muted ? "" : undefined}
                onClick={toggleMute}
              >
                {muted ? AI_CALL.unmute : AI_CALL.mute}
              </LpFxPill>
            </>
          ) : group === "ended" ? (
            <LpFxPill key="back" className="ai-call__back" onClick={backToCalendar}>
              {AI_CALL.back}
            </LpFxPill>
          ) : (
            <>
              <LpFxPill key="retry" className="ai-call__retry" onClick={retry}>
                {AI_CALL.retry}
              </LpFxPill>
              <LpFxPill key="back" className="lp-btn--outline ai-call__back" onClick={backToCalendar}>
                {AI_CALL.back}
              </LpFxPill>
            </>
          )}
        </div>
      </div>
      <p id={noteId} className="ai-call__note">
        {AI_CALL.disclosureBefore}
        {/* A new tab: /privacy in this tab would hang up. */}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          {AI_CALL.privacy}
          <span className="lp-sr-only">{AI_CALL.newTab}</span>
        </a>
      </p>
    </div>,
    document.body,
  );
}
