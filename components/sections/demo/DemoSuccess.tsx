"use client";

import { useEffect, useRef, useState } from "react";
import { LpFxPill } from "@/components/sections/landing-v3/LpFxButton";
import { AI_SALES_ENABLED, openAiSales, type AiSalesVisitor } from "@/lib/ai-sales";
import { SUCCESS, SUPPORT_HREF } from "./demo-copy";

/**
 * The thank-you state that replaces the form in the card (founder: the
 * panel "becomes" the thank-you state). Focus moves to the H2 on mount. No
 * status role on the wrapper: a live region that mounts together with its
 * content is not announced, so the persistent status node in DemoForm
 * carries the brief's status role.
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
 * link it to Calendly.
 */

type AiSalesState = "idle" | "opening" | "ready" | "error";

export function DemoSuccess({ visitor, onReset }: { visitor: AiSalesVisitor | null; onReset: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
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
    if (!mounted.current) return; // "Start a new submission" replaced this state mid-load
    setAiSales(opened ? "ready" : "error");
  }

  const aiSalesBusy = aiSales === "opening" || aiSales === "ready";
  const aiSalesLabel =
    aiSales === "opening" ? SUCCESS.aiSalesOpening : aiSales === "ready" ? SUCCESS.aiSalesReady : SUCCESS.aiSales;

  return (
    <div className="demo-success">
      <h2 id="demo-card-title" className="lp-display demo-card__title" ref={titleRef} tabIndex={-1}>
        {SUCCESS.title}
      </h2>
      <p className="demo-success__lead">{SUCCESS.body}</p>
      <p className="demo-success__faster">{SUCCESS.faster}</p>
      {AI_SALES_ENABLED ? (
        <>
          {/* Persistent from mount and empty until it changes (a live region
              that mounts with its text is not announced): the opening label,
              whose change on the pill may be missed, then where the widget
              landed and what to press. Absolutely positioned (lp-sr-only), so
              it takes no grid row. */}
          <p className="lp-sr-only" role="status">
            {aiSales === "opening" ? SUCCESS.aiSalesOpening : aiSales === "ready" ? SUCCESS.aiSalesOpened : ""}
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
              {SUCCESS.aiSalesErrorBefore}<a href={SUPPORT_HREF}>{SUCCESS.aiSalesErrorLink}</a>{SUCCESS.aiSalesErrorAfter}
            </p>
          ) : null}
        </>
      ) : (
        <LpFxPill type="button" className="demo-success__cta" data-ai-sales-trigger="">
          {SUCCESS.aiSales}
        </LpFxPill>
      )}
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
