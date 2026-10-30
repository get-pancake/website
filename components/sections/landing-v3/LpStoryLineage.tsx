import { Fragment, type CSSProperties } from "react";

import { SkDisc, SkName, skF3 } from "./LpStoryKit";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_LINEAGE } from "./lp-story-lineage-data";

/**
 * Deep-dive story 3, "Where every lead came from" ("Lead lineage") — the stage markup, which IS
 * the END picture. Owner: story-lineage package (2026-10-28). The founder's "3/ Lead lineage",
 * which is also "la detection croisee de signaux interne externe": the customer's own data on the
 * left, Pancake's data on the right, wires from both into a column of leads; the one lead reached
 * from both sides is near-black and named, and its two wires are near-black with it: her lineage
 * (2026-10-30, "the match": the one change its motion made to this picture). No claim and no UI:
 * the parts of the one picture he loves (the old sources story's end hub), from the story kit.
 * Words and geometry: lp-story-lineage-data.ts; look: story-kit.css and story-lineage.css; motion:
 * lp-story-lineage-timeline.ts.
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client", no lib/placeholders: every
 * part is final, so `placeholders` changes nothing), ONE root with data-lp-story="lineage" and
 * aria-hidden (the shell's host carries the ALT), rest markup = the timeline's progress(1),
 * nothing painted behind the scene (the shell paints the stage). It imports nothing from
 * lp-story-kit.ts, which pulls GSAP into the server graph.
 *
 * Layers, back to front, inside .lp-sk-scene (the 752×489 box; nothing transforms it):
 *   .lp-sk-disc        the four marks on white discs (SkDisc): CRM, TheirStack, Apify, Dealroom
 *   svg.lp-sk-wires    the two stops (site visits, events), flat, under the wires; per source a
 *                      <g data-node>: its wire (data-wire, data-order its draw slot, data-to its
 *                      lead), from its edge, then its pulse (.lp-sk-pulse, data-pulse: a copy of
 *                      the wire's d the timeline rides, hidden at rest; both multiply: the kit's
 *                      `> g > *`). The two wires into her lead carry .lp-slin-lineage (near-black
 *                      at rest). Then the five grey leads (data-lead) and her near-black dot
 *                      (.lp-sk-hub) over the middle one. The stops, the leads and her dot are the
 *                      svg's own children: no blend, so a lead covers the end of the wire it sits
 *                      on and swallows the pulse that rides it in
 *   .lp-sk-name        each source's name under it (SkName), the two group labels over their
 *                      columns, her name under her dot (.lp-sk-rise: the one line that rises in)
 * Every box is placed inline from the data (stage px, three decimals at most: skF3); the
 * stylesheets hold the look only. Nothing here is focusable.
 */

/** the kit's name box (story-kit.css .lp-sk-name) whose line box starts at y: that rule's top is
    --nb + 5 */
const labelAt = (x: number, y: number) => ({ "--nx": skF3(x), "--nb": skF3(y - 5) }) as CSSProperties;

export function LpStoryLineageStage(_props: DiveStageProps) {
  const { groups, leads, found } = STORY_LINEAGE;
  const sources = groups.flatMap((group) => group.sources);
  const lead = leads[found.lead];

  return (
    <div className="lp-sk lp-slin" data-lp-story="lineage" aria-hidden="true">
      <div className="lp-sk-scene">
        {sources.map((source) =>
          source.logo ? (
            <SkDisc
              key={source.id}
              node={source.id}
              x={source.x - source.r}
              y={source.y - source.r}
              size={2 * source.r}
              logo={source.logo}
            />
          ) : null,
        )}
        <svg className="lp-sk-wires" viewBox="0 0 752 489" width="752" height="489">
          {sources.map((source) =>
            source.tone ? (
              <circle
                key={source.id}
                className="lp-slin-stop"
                data-node={source.id}
                cx={skF3(source.x)}
                cy={skF3(source.y)}
                r={skF3(source.r)}
                style={{ fill: `var(--lp-${source.tone})` }}
              />
            ) : null,
          )}
          {sources.map((source) => (
            <g key={source.id} data-node={source.id}>
              {source.wires.map((wire) => (
                <Fragment key={wire.id}>
                  <path
                    className={wire.to === found.lead ? "lp-slin-lineage" : undefined}
                    data-wire={wire.id}
                    data-order={wire.order}
                    data-to={wire.to}
                    d={wire.d}
                  />
                  <path className="lp-sk-pulse" data-pulse={wire.id} d={wire.d} />
                </Fragment>
              ))}
            </g>
          ))}
          {leads.map((dot, i) => (
            <circle key={i} className="lp-slin-lead" data-lead={i} cx={skF3(dot.x)} cy={skF3(dot.y)} r={skF3(dot.r)} />
          ))}
          <circle className="lp-sk-hub lp-slin-found" cx={skF3(lead.x)} cy={skF3(lead.y)} r={skF3(found.r)} />
        </svg>
        {sources.map((source) => (
          <SkName key={source.id} node={source.id} x={source.x - source.r} y={source.y - source.r} size={2 * source.r}>
            {source.name}
          </SkName>
        ))}
        {groups.map((group) => (
          <span key={group.id} className="lp-sk-name lp-slin-group" data-node={group.id} style={labelAt(group.x, group.y)}>
            {group.text}
          </span>
        ))}
        <span
          className="lp-sk-name lp-sk-rise lp-slin-name"
          style={{ "--nx": skF3(lead.x), "--nb": skF3(lead.y + found.r) } as CSSProperties}
        >
          {found.name}
        </span>
      </div>
    </div>
  );
}
