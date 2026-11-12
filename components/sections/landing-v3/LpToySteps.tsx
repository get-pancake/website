import type { CSSProperties } from "react";

import { PancakeMark } from "./LpClaudeScene";
import { ToyBadge, ToyMark, ToyPic, toyPx } from "./LpToyKit";
import { DbTableIcon } from "./LpVisionDb";
import { TOY_ART } from "./lp-toy-art";
import { TOY_BRAIN, TOY_SOURCES } from "./lp-toy-data";
import { VSTEP_ACCOUNT, VSTEP_BRAIN, VSTEP_SIGNALS, VSTEP_SOURCES, VSTEP_TABLES } from "./lp-vision-data";

/**
 * The three toy pictures of the vision homepage's 1-2-3 (2026-11-12), each on the designer's
 * 464 × 426 step stage (steps.css .lp-step-stage: it scales as pixels with its card). They take
 * the place of LpVisionStepMocks' v1, v2 and v3, which stay selectable (lp-vision-data.ts
 * VISION_STEPS `variant`).
 *   t1  four sources plug into a machine, beads run down their cables, the machine turns and two
 *       piles of rows come up: the tables
 *   t2  a radar over one account: four signals land round it, a line connects the dots
 *   t3  the Brain as beads round a dark centre: signals run in, ideas come out, the next best Play
 * Each is a set of soft 3D objects in the kitchen's look, drawn as flat layers (LpToyKit.tsx has
 * how), with the page's own type over them. The markup is each picture's END (lp-play-once
 * restIsEnd: reduced motion and a page without script rest on it); what only shows on the way
 * rests hidden (.lp-toy-gone). lp-toy-step-timelines.ts sets the first frame and plays it once.
 * Styles: toys.css. No "use client": the server section renders a stage (LpVisionSteps.tsx) and
 * hands it to its card's island (LpVisionStepAnim) as a child, so its markup is HTML only.
 * How the sets are drawn and how to change one: toys/README.md.
 */

/* ── 01 · your sources plug in, the machine turns, the tables come up ── */

const S = TOY_ART.sources;
/** the docks' tones, left to right (toys/studio/scene-sources.js DOCKS) */
const DOCK_TONES = ["yellow", "pink", "purple", "blue"] as const;
/** The beads, in the order they reach the machine: the dock each one leaves, and the row it
    becomes (the piles' tones, scene-sources.js ROWS, are these docks' tones in this order). */
const ARRIVALS = [
  { dock: 0, side: "l", row: 0 },
  { dock: 1, side: "r", row: 0 },
  { dock: 2, side: "l", row: 1 },
  { dock: 3, side: "r", row: 1 },
  { dock: 1, side: "l", row: 2 },
  { dock: 0, side: "r", row: 2 },
  { dock: 3, side: "l", row: 3 },
  { dock: 2, side: "r", row: 3 },
  { dock: 0, side: "l", row: 4 },
  { dock: 1, side: "r", row: 4 },
] as const;
const ROWS_HIGH = 5;
/** where the riders rest on the turntable, in turns from its right, one a tone */
const RIDER_REST = [0.07, 0.32, 0.57, 0.82] as const;

function T1Stage() {
  const ring = {
    "--toy-rx": toyPx(S.anchors["ring-x"][0] - S.anchors["ring-o"][0]),
    "--toy-ry": toyPx(S.anchors["ring-z"][1] - S.anchors["ring-o"][1]),
  } as CSSProperties;
  return (
    <div className="lp-step-stage lp-step-stage--t1 lp-toy" aria-hidden="true" style={ring}>
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <ToyPic set="sources" name="plate" />
        {/* each source's cable, drawn in as it connects */}
        {VSTEP_SOURCES.map((source, i) => (
          <ToyPic key={source.id} set="sources" name={`cable${i as 0 | 1 | 2 | 3}`} className="lp-t1-cable" data-dock={i} />
        ))}
        {/* the beads on their way down the cables: under the docks and the machine */}
        {ARRIVALS.map((a, k) => (
          <ToyPic
            key={k}
            set="sources"
            name={`bead-${DOCK_TONES[a.dock]}`}
            from={S.anchors.bead}
            to={S.paths[`cable${a.dock}`][0]}
            className="lp-toy-gone lp-t1-token"
            data-dock={a.dock}
          />
        ))}
        <ToyPic set="sources" name="docks" />
        <ToyPic set="sources" name="machine" />
        {/* the beads that ride the turntable */}
        {DOCK_TONES.map((tone, i) => (
          <ToyPic
            key={tone}
            set="sources"
            name={`bead-${tone}`}
            from={S.anchors.bead}
            to={S.anchors["ring-o"]}
            className="lp-t1-rider"
            style={{ "--toy-a": RIDER_REST[i] } as CSSProperties}
          />
        ))}
        <span className="lp-t1-hub" style={{ left: toyPx(S.anchors.hub[0]), top: toyPx(S.anchors.hub[1]) }}>
          <PancakeMark className="lp-t1-hub__mark" />
        </span>
        {/* the tables: every height of each pile, the full one at rest */}
        {(["l", "r"] as const).map((side) =>
          Array.from({ length: ROWS_HIGH + 1 }, (_, n) => (
            <ToyPic
              key={`${side}${n}`}
              set="sources"
              name={`pile-${side}-${n as 0 | 1 | 2 | 3 | 4 | 5}`}
              className="lp-t1-pile"
              data-side={side}
              data-n={n}
              data-on={n === ROWS_HIGH ? "" : undefined}
            />
          )),
        )}
        {/* a row on its way from the machine to its pile */}
        {ARRIVALS.map((a, k) => (
          <ToyPic
            key={k}
            set="sources"
            name={`row-${DOCK_TONES[a.dock]}`}
            from={S.anchors.row}
            to={S.anchors[`pile-${a.side}-row${a.row}`]}
            className="lp-toy-gone lp-t1-row"
            data-side={a.side}
            data-row={a.row}
          />
        ))}
      </div>
      {/* the page's own type over the set: each source's mark and name, what it sends */}
      {VSTEP_SOURCES.map((source, i) => {
        const at = S.anchors[`dock${i as 0 | 1 | 2 | 3}`];
        const top = S.anchors[`name${i as 0 | 1 | 2 | 3}`];
        return (
          <span key={source.id} className="lp-t1-source" data-dock={i}>
            <ToyMark src={source.logo} at={at} size={30} className="lp-t1-mark" />
            <span className="lp-toy-cap lp-t1-name" style={{ left: toyPx(at[0]), top: toyPx(top[1] - 23) }}>
              {source.label}
            </span>
          </span>
        );
      })}
      {TOY_SOURCES.sends.map((send, i) => {
        const at = S.anchors[`name${i as 0 | 1 | 2 | 3}`];
        return (
          <ToyBadge key={send.text} at={[at[0], at[1] - (i % 2 ? 29 : 55)]} logo={VSTEP_SOURCES[i].logo} className="lp-toy-gone lp-t1-send" data-dock={i}>
            {send.text}
          </ToyBadge>
        );
      })}
      {VSTEP_TABLES.map((table, i) => {
        const at = S.anchors[i === 0 ? "pile-l-label" : "pile-r-label"];
        return (
          <span key={table.name} className="lp-t1-table" data-side={i === 0 ? "l" : "r"} style={{ left: toyPx(at[0]), top: toyPx(at[1] + 5) }}>
            <DbTableIcon />
            <b>{table.name}</b>
            <em data-to={table.rows}>{table.rows.toLocaleString("en-US")}</em>
          </span>
        );
      })}
    </div>
  );
}

/* ── 02 · a radar over one account: the signals land, a line connects the dots ── */

const R = TOY_ART.radar;
/** The signals that land (VSTEP_SIGNALS' four dots), in the order the beam meets them: round
    the account from its upper right, each one nearer than the last, so the line that connects
    them winds in and never crosses the account's own badge. */
const BLIP_ORDER = ["team", "funding", "traffic", "hiring"] as const;
const BLIPS = BLIP_ORDER.flatMap((id) => {
  const signal = VSTEP_SIGNALS.find((s) => s.id === id);
  return signal?.dot ? [{ id: signal.id, logo: signal.logo, tone: signal.tone, text: signal.dot.text }] : [];
});
/** where the beam points when it meets each one, in degrees, clockwise from the face's right
    (toys/studio/scene-radar.js BLIPS): the take turns the beam through them */
const BLIP_ANGLES = [315, 385, 495, 552] as const;
/** which side of its bead each badge hangs on, so that none covers the account */
const BLIP_SIDE = ["bottom", "top", "top", "top"] as const;

type XY = readonly [number, number];
/** a smooth line through points (Catmull-Rom, written as cubic Béziers) */
function through(points: readonly XY[]): string {
  const n = (v: number) => Math.round(v * 10) / 10;
  let d = `M${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}

function T2Stage() {
  const c = R.anchors.centre;
  const rx = R.anchors["edge-x"][0] - c[0];
  /** the face is a circle of the set: on the picture, an ellipse this much flatter */
  const squash = (R.anchors["edge-z"][1] - c[1]) / rx;
  const spots = BLIPS.map((_, k) => R.anchors[`blip${k as 0 | 1 | 2 | 3}`]);
  const face = { left: toyPx(c[0]), top: toyPx(c[1]), "--toy-r": toyPx(rx), "--toy-squash": squash } as CSSProperties;
  return (
    <div className="lp-step-stage lp-step-stage--t2 lp-toy" aria-hidden="true">
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <ToyPic set="radar" name="plate" />
        {/* what is drawn on the radar's face: its rings, the beam, a ring where a signal lands */}
        <div className="lp-t2-face" style={face}>
          <svg className="lp-t2-rings" viewBox="-100 -100 200 200" focusable="false">
            <circle r="33" />
            <circle r="66" />
            <circle r="97" />
            <path d="M-97 0H97M0 -97V97" />
          </svg>
          <i className="lp-t2-beam" data-from={BLIP_ANGLES[0] - 25} />
          {spots.map((spot, k) => (
            <i
              key={k}
              className="lp-t2-ping"
              data-tone={BLIPS[k].tone}
              style={{ left: toyPx(spot[0] - c[0]), top: toyPx((spot[1] - c[1]) / squash) }}
            />
          ))}
          <i className="lp-t2-heat" />
        </div>
        {/* the line that connects the dots, into the account */}
        <svg className="lp-t2-line" viewBox="0 0 464 426" focusable="false">
          <path d={through([...spots, c])} pathLength={1} />
        </svg>
        <ToyPic set="radar" name="account" className="lp-t2-account" />
        {BLIPS.map((blip, k) => (
          <ToyPic key={blip.id} set="radar" name={`blip${k as 0 | 1 | 2 | 3}`} className="lp-t2-blip" data-at={BLIP_ANGLES[k]} />
        ))}
      </div>
      {/* the account: what your own data says of it */}
      <ToyBadge at={R.anchors.account} className="lp-t2-who">
        <b>{VSTEP_ACCOUNT.name}</b>
        <em>{VSTEP_ACCOUNT.own}</em>
      </ToyBadge>
      {BLIPS.map((blip, k) => {
        const side = BLIP_SIDE[k];
        const at = side === "bottom" ? R.anchors[`over${k as 0 | 1 | 2 | 3}`] : ([spots[k][0], spots[k][1] + 9] as const);
        return (
          <ToyBadge key={blip.id} at={at} anchor={side} logo={blip.logo} className="lp-t2-says" data-tone={blip.tone}>
            {blip.text}
          </ToyBadge>
        );
      })}
    </div>
  );
}

/* ── 03 · the Brain: signals run in, ideas come out, the next best Play ── */

const B = TOY_ART.brain;
/** the hubs' tones, in the set's order (toys/studio/scene-brain.js HUBS) */
const HUB_TONES = ["pink", "purple", "green", "yellow", "blue", "orange"] as const;
type HubIndex = 0 | 1 | 2 | 3 | 4 | 5;
/** where each hub's name sits from its bead, in px: clear of the rods and of the dots */
const HUB_NAME: readonly XY[] = [
  [-2, 15],
  [-33, 5],
  [15, 15],
  [4, 16],
  [3, 46],
  [-30, -27],
];
/** the signals that run in: the dot each one leaves (its hub, then the dot) */
const RUNS = [
  [0, 1],
  [2, 1],
  [4, 0],
  [1, 0],
  [5, 2],
] as const;
/** where the ideas land, under the Brain, and the Play under them */
const IDEA_AT: readonly XY[] = [
  [128, 281],
  [338, 281],
];
const PLAY_AT: XY = [232, 303];

function T3Stage() {
  const centre = B.anchors.centre;
  return (
    <div className="lp-step-stage lp-step-stage--t3 lp-toy" aria-hidden="true">
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <i className="lp-t3-halo" style={{ left: toyPx(centre[0]), top: toyPx(centre[1]) }} />
        {HUB_TONES.map((tone, k) => {
          const name = `hub${k as HubIndex}` as const;
          const box = B.layers[name];
          const hub = B.anchors[name];
          // (a hub breathes from its own bead)
          return <ToyPic key={tone} set="brain" name={name} className="lp-t3-hub" data-hub={k} style={{ transformOrigin: `${toyPx(hub[0] - box.x)} ${toyPx(hub[1] - box.y)}` }} />;
        })}
        <ToyPic set="brain" name="centre" className="lp-t3-centre" />
        {/* a signal on its way in: from a dot to its hub, then to the centre */}
        {RUNS.map(([hub, dot], k) => {
          const from = (B.anchors as unknown as Record<string, XY>)[`dot${hub}-${dot}`];
          return <i key={k} className="lp-toy-gone lp-t3-run" data-tone={HUB_TONES[hub]} data-hub={hub} data-dot={dot} style={{ left: toyPx(from[0]), top: toyPx(from[1]) }} />;
        })}
      </div>
      {/* what the Brain holds, a name a hub */}
      {TOY_BRAIN.holds.map((item, k) => {
        const hub = B.anchors[`hub${k as HubIndex}`];
        return (
          <span key={item.label} className="lp-toy-cap lp-t3-name" data-tone={HUB_TONES[k]} style={{ left: toyPx(hub[0] + HUB_NAME[k][0]), top: toyPx(hub[1] + HUB_NAME[k][1]) }}>
            {item.label}
          </span>
        );
      })}
      {/* the ideas it comes up with, then the one it recommends */}
      {TOY_BRAIN.ideas.map((idea, k) => (
        <ToyBadge key={idea.text} at={IDEA_AT[k]} anchor="centre" icon={<PlayGlyph />} className="lp-t3-idea" data-k={k}>
          {idea.text}
        </ToyBadge>
      ))}
      <div className="lp-t3-play" style={{ left: toyPx(PLAY_AT[0]), top: toyPx(PLAY_AT[1]) }}>
        <div className="lp-t3-play__in">
          <i className="lp-t3-play__icon">
            <PlayGlyph />
          </i>
          <p className="lp-t3-play__k">{VSTEP_BRAIN.play.kicker}</p>
          <p className="lp-t3-play__t">{TOY_BRAIN.play.text}</p>
        </div>
      </div>
    </div>
  );
}

/** the Play's glyph (LpVisionStepMocks' own) */
function PlayGlyph() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path d="M5.5 3.8v8.4L12 8z" />
    </svg>
  );
}

export const TOY_STEP_STAGES = { t1: T1Stage, t2: T2Stage, t3: T3Stage } as const;
export type ToyStepVariant = keyof typeof TOY_STEP_STAGES;
