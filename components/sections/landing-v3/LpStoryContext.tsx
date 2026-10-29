import type { CSSProperties } from "react";

import { SkDisc, skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_CONTEXT } from "./lp-story-context-data";

/**
 * Deep-dive story "context" (block 1, "Your agent knows what to do next") — the stage markup.
 * Founder 2026-10-28: "ban UI things from motions and try to abstract things we re talking about
 * being graphic simple and on brand (you can reuse components)", then "no UI should not mean text
 * it should mean abstraction of what our infrastructure does", then "ajouter un poil de densité
 * informationnelle". So no claim and no UI: the inputs (ICP, Voice, the CRM's mark) each draw a
 * wire into one plum centre; one line runs from it to one account under a cluster (which
 * account), then on to a Play (which Play); and a loop runs from the Play back into the centre
 * (it remembers what worked). Words and geometry:
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
 *                      the inputs' wires into the centre, the exit wire, the Play's wire, the
 *                      loop;
 *                      the plum centre, over the inputs' and the loop's wire ends;
 *                      the accounts (--lp-ink-60), over the exit wire's end;
 *                      the near-black dot over the picked account (the kit's hub colour, r 12);
 *                      the Play (a --lp-pink-30 stop and its white play mark), over its wire's
 *                      end;
 *                      the caps, last and outside any <g>: one flat grey dot over each source's
 *                      edge (a stop's, the disc's, the centre's, the picked dot's right edge;
 *                      the Play's top), as the loved caps read over their white discs
 *   .lp-sk-name        the labels (kit name style, hidden on phones): under each input; under
 *                      the line, "Which account" and "Which Play" (ink-80) and the Play's name;
 *                      over the loop, "Remembers what worked" (ink-80); each rises by the kit's
 *                      variable (.lp-sk-rise)
 * `data-node` ties an input's body, wire, cap and label together ("exit" for the wire out, "pick"
 * for its label, "play" for the Play's wire, cap, stop, mark and labels, "loop" for the loop's);
 * the timeline pairs them by it. Nothing here is focusable.
 */

/** the kit's name box (story-kit.css .lp-sk-name) around a dot: centre x, top and bottom */
const nameAt = (x: number, y: number, r: number) =>
  ({ "--nx": skF3(x), "--nt": skF3(y - r), "--nb": skF3(y + r) }) as CSSProperties;
/** the kit's name box for a free label: centre x and the top of its line box (the kit sets a
    name's top 5 px under --nb) */
const labelAt = ({ x, top }: { x: number; top: number }) => ({ "--nx": skF3(x), "--nb": skF3(top - 5) }) as CSSProperties;

export function LpStoryContextStage(_props: DiveStageProps) {
  const { center, inputs, accounts, pick, exit, play, loop } = STORY_CONTEXT;
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
          <g data-node="play">
            <path d={play.d} />
          </g>
          <g data-node="loop">
            <path d={loop.d} />
          </g>
          <circle className="lp-sctx-center" cx={skF3(center.x)} cy={skF3(center.y)} r={skF3(center.r)} />
          {accounts.map((account, i) => (
            <circle key={i} className="lp-sctx-account" cx={skF3(account.x)} cy={skF3(account.y)} r={skF3(account.r)} />
          ))}
          <circle className="lp-sk-hub lp-sctx-pick" cx={skF3(picked.x)} cy={skF3(picked.y)} r={skF3(pick.r)} />
          <circle
            className="lp-sctx-play"
            data-node="play"
            cx={skF3(play.x)}
            cy={skF3(play.y)}
            r={skF3(play.r)}
            style={{ fill: `var(--lp-${play.tone})` }}
          />
          <path className="lp-sctx-play-mark" data-node="play" d={play.mark} />
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
          <circle className="lp-sk-cap" data-node="play" cx={skF3(play.cap.x)} cy={skF3(play.cap.y)} r="5.333" />
          <circle className="lp-sk-cap" data-node="loop" cx={skF3(loop.cap.x)} cy={skF3(loop.cap.y)} r="5.333" />
        </svg>
        {inputs.map((input) => (
          <span key={input.id} className="lp-sk-name lp-sk-rise" data-node={input.id} style={nameAt(input.x, input.y, input.r)}>
            {input.name}
          </span>
        ))}
        <span className="lp-sk-name lp-sk-rise lp-sctx-head" data-node="pick" style={labelAt(pick.label)}>
          {pick.label.text}
        </span>
        <span className="lp-sk-name lp-sk-rise lp-sctx-head" data-node="play" style={labelAt(play.label)}>
          {play.label.text}
        </span>
        <span className="lp-sk-name lp-sk-rise" data-node="play-name" style={labelAt(play.name)}>
          {play.name.text}
        </span>
        <span className="lp-sk-name lp-sk-rise lp-sctx-head" data-node="loop" style={labelAt(loop.label)}>
          {loop.label.text}
        </span>
      </div>
    </div>
  );
}
