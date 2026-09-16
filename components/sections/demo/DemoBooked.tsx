"use client";

import { useEffect, useRef } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { BOOKED } from "./demo-copy";

/**
 * The booked state (DemoForm: booking ──calendly.event_scheduled──▶ booked):
 * the card confirms the booking, plays the demo video and offers a new
 * submission. Focus moves to the H2 on mount; the persistent status node in
 * DemoForm announces the change (a live region mounted with its text is
 * not). "Start a new submission" (`onReset`) returns to an empty step 1 with
 * focus on First name. The AI sales pill is not repeated here.
 */
export function DemoBooked({ onReset }: { onReset: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <div className="demo-success demo-success--booked">
      <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
        {BOOKED.title}
      </h2>
      <p className="demo-success__lead">{BOOKED.body}</p>
      {/* Exists only in this state: nothing from YouTube loads before a
          booking. referrerPolicy matches YouTube's own embed snippet. */}
      <div className="demo-success__video">
        <iframe
          src={BOOKED.videoSrc}
          title={BOOKED.videoTitle}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <p className="demo-success__again">{BOOKED.again}</p>
      <LpFxPill type="button" className="lp-btn--outline demo-success__restart" onClick={onReset}>
        {BOOKED.restart}
      </LpFxPill>
    </div>
  );
}
