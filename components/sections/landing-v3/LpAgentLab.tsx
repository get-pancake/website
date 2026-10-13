"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { useAudience } from "./LpAudience";
import { LpAgentCaptcha } from "./LpAgentCaptcha";
import { LpAgentPrompt } from "./LpAgentPrompt";
import { AS_MEDIA, mountAgentsAssembly } from "./lp-agents-scroll";
import { AGENT_WALL_TEXT, type AgentCardBody } from "./lp-agents-wall-data";

/**
 * The agents view's code wall — Figma V2 4939:3457 (section 777 → 2064 at 1654): a still wall of
 * white pseudocode (4939:3760, Andale Mono 16/18 in a 1136 column) under a centred blue card with a
 * 1 px white outline (4964:4098, 690×562) whose head repeats the install prompt. Replaces
 * production's black terminal stream (LpAgentTerminalStream, retired) and its CAPTCHA card; the
 * puzzle now fills the card's body (decision 2026-10-09 §8, never an empty card in production).
 * Owner: agents-view package; styles in agent-lab.css.
 *
 * Kept from production: `section.lp-agent-lab#agent-playground` (the integrator's agents-view hide
 * rule shows `.lp-agent-lab` and the anchor stays), hidden from assistive tech outside the view.
 * The wall and card render once the view has been shown (and stay): the humans HTML carries no
 * hidden pseudocode — the agents view is client-only anyway (LpAudience reads the URL on mount).
 *
 * Motion (lp-agents-scroll.ts, desktop with motion allowed): the wall prints and the card extends
 * on scroll, then locks assembled. Reduced motion, tablets, phones and short windows: the rest
 * picture (state 03 = the V2 artboard).
 *
 * `cardBody` comes from the server page through the SHOW_PLACEHOLDERS gate (app/page.tsx).
 */
export function LpAgentLab({ cardBody }: { cardBody?: AgentCardBody } = {}) {
  const { audience } = useAudience();
  const active = audience === "agents";
  const section = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  // render the wall the first time the view shows, in the same commit (the switch's snapshot)
  if (active && !seen) setSeen(true);

  // Scroll assembly: mounted in the commit that shows the view, so the View Transition's new
  // snapshot already holds the scroll pose; follows the desktop/motion gate live.
  useLayoutEffect(() => {
    const el = section.current;
    if (!active || !el) return;
    const gate = matchMedia(AS_MEDIA);
    let unmount: (() => void) | null = null;
    const sync = () => {
      if (gate.matches && !unmount) unmount = mountAgentsAssembly(el);
      else if (!gate.matches && unmount) {
        unmount();
        unmount = null;
      }
    };
    sync();
    gate.addEventListener("change", sync);
    return () => {
      gate.removeEventListener("change", sync);
      unmount?.();
    };
  }, [active]);

  const body = cardBody ?? { kind: "captcha", status: "final" };

  return <section
    ref={section}
    className="lp-agent-lab lp-agents-wall"
    id="agent-playground"
    aria-label="Set up Pancake with your agent"
    aria-hidden={!active}
  >
    {seen && <>
      <div className="lp-agents-wall__code" aria-hidden="true">{AGENT_WALL_TEXT}</div>
      {/* the section colour over the rows not yet printed (scroll assembly only) */}
      <div className="lp-agents-wall__cover" aria-hidden="true" />
      <div className="lp-agents-wall__slot">
        <div className="lp-agents-wall__card" data-body={body.kind}>
          <LpAgentPrompt variant="card" />
          <div className="lp-agents-wall__body" {...(body.status === "placeholder" ? { "data-placeholder": "" } : {})}>
            {body.kind === "captcha" ? <LpAgentCaptcha /> : <AgentTranscript lines={body.lines} />}
          </div>
        </div>
        {/* the card's bottom hairline: it travels with the frame while the card assembles */}
        <div className="lp-agents-wall__edge" aria-hidden="true" />
      </div>
    </>}
  </section>;
}

/** Preview-only body (AGENT_CARD_TRANSCRIPT_DRAFT): the agent's install session prints one line
 *  every 280 ms once the assembled card is half in view; reduced motion shows every line. */
function AgentTranscript({ lines }: { lines: Extract<AgentCardBody, { kind: "transcript" }>["lines"] }) {
  const log = useRef<HTMLOListElement>(null);
  const [print, setPrint] = useState(false);
  useEffect(() => {
    const el = log.current;
    const wall = el?.closest(".lp-agents-wall");
    if (!el || !wall || print) return;
    let inView = false;
    // after the scroll assembly has locked, or wherever it does not run
    const check = () => {
      if (inView && (wall.hasAttribute("data-as-done") || !wall.hasAttribute("data-as"))) setPrint(true);
    };
    const io = new IntersectionObserver((entries) => {
      inView = entries.some((e) => e.isIntersecting);
      check();
    }, { threshold: 0.5 });
    const mo = new MutationObserver(check);
    io.observe(el);
    mo.observe(wall, { attributes: true, attributeFilter: ["data-as", "data-as-done"] });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [print]);
  return <ol ref={log} className="lp-agents-wall__log" data-print={print} aria-label="Illustrative install session">
    {lines.map((line, i) => <li key={i} data-kind={line.kind} style={{ "--i": i } as CSSProperties}>{line.text}</li>)}
  </ol>;
}
