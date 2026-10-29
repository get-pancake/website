import type { CSSProperties } from "react";

import { SkDisc, skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_CONTEXT } from "./lp-story-context-data";

/**
 * Deep-dive story "context" (block 1, "Your agent knows what to do next") — the stage markup.
 * Founder 2026-10-28: "ban UI things from motions and try to abstract things we re talking about
 * being graphic simple and on brand (you can reuse components)", then "no UI should not mean text
 * it should mean abstraction of what our infrastructure does". So no claim and no UI: the
 * inputs (ICP, Voice, the CRM's mark) each draw a wire into one plum centre, and one wire runs
 * from it to one account of a cluster, the next best action. Words and geometry:
 * lp-story-context-data.ts; look: story-kit.css (the kit) + story-context.css; motion:
 * lp-story-context-timeline.ts.
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client", no lib/placeholders:
 * every part is final, so `placeholders` changes nothing), ONE root carrying
 * data-lp-story="context" and aria-hidden (the shell's host carries the ALT), and this markup IS
 * the END picture (rest = end): the server HTML is never a blank card. Nothing is painted behind
 * the scene. It imports nothing from lp-story-kit.ts, which pulls GSAP into the server graph:
 * the caps' 5.333 is its SK_CAP_R, written out.
 *
 * Layers, back to front, all inside the kit's scene wrapper (.lp-sk-scene, never transformed):
 *   .lp-sk-disc        the CRM: the HubSpot mark on the kit's white disc (SkDisc), under the
 *                      wires like the loved discs, so its cap sits over its edge
 *   svg.lp-sk-wires    the stops (ICP, Voice: flat brand tones);
 *                      each wire in its own <g> (the kit multiplies `> g > *` from 768 px up):
 *                      the inputs' wires into the centre, then the exit wire;
 *                      the plum centre, over the inputs' wire ends;
 *                      the accounts (--lp-ink-60), over the exit wire's end;
 *                      the near-black dot over the picked account (the kit's hub colour, r 12);
 *                      the caps, last and outside any <g>: one flat grey dot over each source's
 *                      right edge (a stop's, the disc's, the centre's), as the loved caps read
 *                      over their white discs
 *   .lp-sk-name        the labels (kit name style, hidden on phones): under each input, over the
 *                      picked account; each rises by the kit's variable (.lp-sk-rise)
 * `data-node` ties an input's body, wire, cap and label together ("exit" for the wire out,
 * "pick" for its label); the timeline pairs them by it. Nothing here is focusable.
 */

/** the kit's name box (story-kit.css .lp-sk-name) around a dot: centre x, top and bottom */
const nameAt = (x: number, y: number, r: number) =>
  ({ "--nx": skF3(x), "--nt": skF3(y - r), "--nb": skF3(y + r) }) as CSSProperties;

export function LpStoryContextStage(_props: DiveStageProps) {
  const { center, inputs, accounts, pick, exit } = STORY_CONTEXT;
  const picked = accounts[pick.index];

  return (
    <div className="lp-sk lp-sctx" data-lp-story="context" aria-hidden="true">
      <div className="lp-sk-scene">
        {inputs.map((input) =>
          input.kind === "disc" ? (
            <SkDisc
              key={input.id}
              node={input.id}
              x={input.x - input.r}
              y={input.y - input.r}
              size={2 * input.r}
              logo={input.logo}
            />
          ) : null,
        )}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {inputs.map((input) =>
            input.kind === "stop" ? (
              <circle
                key={input.id}
                className="lp-sctx-stop"
                data-node={input.id}
                cx={skF3(input.x)}
                cy={skF3(input.y)}
                r={skF3(input.r)}
                style={{ fill: `var(--lp-${input.tone})` }}
              />
            ) : null,
          )}
          {inputs.map((input) => (
            <g key={input.id} data-node={input.id}>
              <path d={input.d} />
            </g>
          ))}
          <g data-node="exit">
            <path d={exit.d} />
          </g>
          <circle className="lp-sctx-center" cx={skF3(center.x)} cy={skF3(center.y)} r={skF3(center.r)} />
          {accounts.map((account, i) => (
            <circle key={i} className="lp-sctx-account" cx={skF3(account.x)} cy={skF3(account.y)} r={skF3(account.r)} />
          ))}
          <circle className="lp-sk-hub lp-sctx-pick" cx={skF3(picked.x)} cy={skF3(picked.y)} r={skF3(pick.r)} />
          {inputs.map((input) => (
            <circle
              key={input.id}
              className="lp-sk-cap"
              data-node={input.id}
              cx={skF3(input.cap.x)}
              cy={skF3(input.cap.y)}
              r="5.333"
            />
          ))}
          <circle className="lp-sk-cap" data-node="exit" cx={skF3(exit.cap.x)} cy={skF3(exit.cap.y)} r="5.333" />
        </svg>
        {inputs.map((input) => (
          <span key={input.id} className="lp-sk-name lp-sk-rise" data-node={input.id} style={nameAt(input.x, input.y, input.r)}>
            {input.name}
          </span>
        ))}
        <span
          className="lp-sk-name lp-sk-rise"
          data-node="pick"
          data-above=""
          style={nameAt(picked.x, picked.y, pick.r)}
        >
          {pick.text}
        </span>
      </div>
    </div>
  );
}
