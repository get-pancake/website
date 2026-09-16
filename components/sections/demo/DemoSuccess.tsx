"use client";

import { useEffect, useRef } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { SUCCESS } from "./demo-copy";

/**
 * The thank-you state that replaces the form in the card (founder: the
 * panel "becomes" the thank-you state). Focus moves to the H2 on mount. No
 * status role on the wrapper: a live region that mounts together with its
 * content is not announced, so the persistent status node in DemoForm
 * carries the brief's status role.
 */
export function DemoSuccess({ onReset }: { onReset: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  // TODO(ElevenLabs agent): open the AI sales conversation from the
  // [data-ai-sales-trigger] pill. Founder 2026-09-15: "let's program the
  // Eleven Labs agent later on, just put the button for now": the pill is a
  // real button with no handler and nothing user-visible on click (brief §3).
  // Do not link it to Calendly.

  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <div className="demo-success">
      <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
        {SUCCESS.title}
      </h2>
      <p className="demo-success__lead">{SUCCESS.body}</p>
      <p className="demo-success__faster">{SUCCESS.faster}</p>
      <LpFxPill type="button" className="demo-success__cta" data-ai-sales-trigger="">
        {SUCCESS.aiSales}
      </LpFxPill>
      {/* Exists only in this state: nothing from YouTube loads before a
          submission. referrerPolicy matches YouTube's own embed snippet. */}
      <div className="demo-success__video">
        <iframe
          src={SUCCESS.videoSrc}
          title={SUCCESS.videoTitle}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <p className="demo-success__again">{SUCCESS.again}</p>
      <LpFxPill type="button" className="lp-btn--outline demo-success__restart" onClick={onReset}>
        {SUCCESS.restart}
      </LpFxPill>
    </div>
  );
}
