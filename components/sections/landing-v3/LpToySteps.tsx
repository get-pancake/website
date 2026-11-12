import { Fragment, type CSSProperties } from "react";

import { PancakeMark } from "./LpClaudeScene";
import { ToyBadge, ToyMark, ToyPic, toyPx } from "./LpToyKit";
import { DbTableIcon } from "./LpVisionDb";
import { TOY_ART } from "./lp-toy-art";
import { TOY_BRAIN, TOY_RADAR, TOY_SOURCES } from "./lp-toy-data";
import { VSTEP_ACCOUNT, VSTEP_BRAIN, VSTEP_SIGNALS, VSTEP_SOURCES, VSTEP_TABLES } from "./lp-vision-data";

/**
 * The three toy pictures of the vision homepage's 1-2-3 (2026-11-12), each on the designer's
 * 464 × 426 step stage (steps.css .lp-step-stage: it scales as pixels with its card). They take
 * the place of LpVisionStepMocks' v1, v2 and v3, which stay selectable (lp-vision-data.ts
 * VISION_STEPS `variant`).
 *   t1  four sources plug into a machine, beads run down their cables, the machine turns and two
 *       piles of rows come up: the tables
 *   t2  a radar over one account: four signals land round it, a line connects the dots
 *   t3  the Brain, a fine flat graph round a dark centre: signals run in, ideas come out, the
 *       next best Play
 * t1 and t2 are sets of soft 3D objects in the kitchen's look, drawn as flat layers (LpToyKit.tsx
 * has how), with the page's own type over them. t3 is drawn by the page itself (an SVG): the
 * Brain did not read as a 3D set. The markup is each picture's END (lp-play-once
 * restIsEnd: reduced motion and a page without script rest on it); what only shows on the way
 * rests hidden (.lp-toy-gone). lp-toy-step-timelines.ts sets the first frame and plays it.
 * Since 2026-11-12 a picture goes round for as long as it is looked at, and its next round shows
 * something else (other sources, another account, a Brain that changed): what only that round
 * shows is in the markup too, hidden at rest (lp-toy-data.ts has its words).
 * Styles: toys.css. No "use client": the server section renders a stage (LpVisionSteps.tsx) and
 * hands it to its card's island (LpVisionStepAnim) as a child, so its markup is HTML only.
 * How the sets are drawn and how to change one: toys/README.md.
 */

/* ── 01 · your sources plug in, the machine turns, the tables come up ── */

const S = TOY_ART.sources;
/** what lies flat on the set is this much shorter on the picture (the camera looks down on it) */
const S_FLAT = S.ground[3] / S.ground[0];
/** the docks' tones, left to right (toys/studio/scene-sources.js DOCKS) */
const DOCK_TONES = ["yellow", "pink", "purple", "blue"] as const;
type DockIndex = 0 | 1 | 2 | 3;
/** The beads of a round, in the order they reach the machine: the dock each one leaves, and the
    row it becomes (the piles' tones, scene-sources.js ROUND, are these docks' tones in this
    order). */
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
/** the drawings of a pile: empty to full (0 to 5), then a full pile after each row more (6 to 9;
    after the tenth row it is the full pile again) */
const PILE_STATES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
/** The rounds of beads. "open" fills the piles. The picture then goes round: on "b" the sources
    of TOY_SOURCES.more take the docks, on "a" the first four are back, and each rolls the piles
    by five rows (a row lands on top, the pile shows its last five). */
const ROUNDS = ["open", "b", "a"] as const;
/** the sources that hold the docks, by turns: the page's four (the picture's rest), then four more */
const SOURCE_SETS = [
  VSTEP_SOURCES.map((source, i) => ({ id: source.id, label: source.label, logo: source.logo, text: TOY_SOURCES.sends[i].text })),
  TOY_SOURCES.more,
] as const;
/** where the riders rest on the turntable, in turns from its right, one a tone */
const RIDER_REST = [0.07, 0.32, 0.57, 0.82] as const;

function T1Stage() {
  const ring = {
    "--toy-rx": toyPx(S.anchors["ring-x"][0] - S.anchors["ring-o"][0]),
    "--toy-ry": toyPx(S.anchors["ring-z"][1] - S.anchors["ring-o"][1]),
    "--toy-flat": Math.round(S_FLAT * 1000) / 1000,
  } as CSSProperties;
  return (
    <div className="lp-step-stage lp-step-stage--t1 lp-toy" aria-hidden="true" style={ring}>
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <ToyPic set="sources" name="plate" />
        {/* each dock's cable, drawn in as a source connects */}
        {DOCK_TONES.map((tone, i) => (
          <ToyPic key={tone} set="sources" name={`cable${i as DockIndex}`} className="lp-t1-cable" data-dock={i} />
        ))}
        {/* the beads on their way down the cables: under the docks and the machine */}
        {ROUNDS.map((round) =>
          ARRIVALS.map((a, k) => (
            <ToyPic
              key={`${round}${k}`}
              set="sources"
              name={`bead-${DOCK_TONES[a.dock]}`}
              from={S.anchors.bead}
              to={S.paths[`cable${a.dock}`][0]}
              className="lp-toy-gone lp-t1-token"
              data-round={round}
              data-dock={a.dock}
            />
          )),
        )}
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
        {/* the tables: every drawing of each pile, the full one at rest */}
        {(["l", "r"] as const).map((side) =>
          PILE_STATES.map((n) => (
            <ToyPic key={`${side}${n}`} set="sources" name={`pile-${side}-${n}`} className="lp-t1-pile" data-side={side} data-n={n} data-on={n === ROWS_HIGH ? "" : undefined} />
          )),
        )}
        {/* a row on its way from the machine to its pile: to its own height while the pile
            fills, onto the top of a full one after that */}
        {ROUNDS.map((round) =>
          ARRIVALS.map((a, k) => {
            const row = round === "open" ? a.row : ROWS_HIGH - 1;
            return (
              <ToyPic
                key={`${round}${k}`}
                set="sources"
                name={`row-${DOCK_TONES[a.dock]}`}
                from={S.anchors.row}
                to={S.anchors[`pile-${a.side}-row${row as 0 | 1 | 2 | 3 | 4}`]}
                className="lp-toy-gone lp-t1-row"
                data-round={round}
                data-side={a.side}
                data-row={row}
              />
            );
          }),
        )}
      </div>
      {/* the page's own type over the set: each source's mark, laid flat on its dock, and its
          name; then what it sends. The sources of the next round rest hidden. */}
      {SOURCE_SETS.map((sources, set) =>
        sources.map((source, i) => {
          const at = S.anchors[`dock${i as DockIndex}`];
          const top = S.anchors[`name${i as DockIndex}`];
          const gone = set ? " lp-toy-gone" : "";
          return (
            <Fragment key={source.id}>
              <ToyMark src={source.logo} at={at} size={32} className={`lp-t1-mark${gone}`} data-dock={i} data-set={set} />
              <span className={`lp-toy-cap lp-t1-name${gone}`} data-dock={i} data-set={set} style={{ left: toyPx(at[0]), top: toyPx(top[1] - 23) }}>
                {source.label}
              </span>
              <ToyBadge at={[top[0], top[1] - (i % 2 ? 29 : 55)]} logo={source.logo} className="lp-toy-gone lp-t1-send" data-dock={i} data-set={set}>
                {source.text}
              </ToyBadge>
            </Fragment>
          );
        }),
      )}
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
type SpotIndex = 0 | 1 | 2 | 3;
type XY = readonly [number, number];
/** a kind of signal as a scan shows it: its source's mark, its tone, what it says of the account */
const signalFor = (id: string, text?: string) => {
  const signal = VSTEP_SIGNALS.find((s) => s.id === id);
  const says = text ?? signal?.dot?.text;
  return signal && says ? [{ id: signal.id, logo: signal.logo, tone: signal.tone, text: says }] : [];
};
/**
 * The radar's scans, by turns (toys/studio/scene-radar.js BLIPS and BLOCKS have the places).
 *   a  the picture: the page's own account and four of its signals (VSTEP_SIGNALS' dots), as
 *      beads. The beam meets them round the account from its upper right, each one nearer than
 *      the last, so the line that connects them winds in and never crosses the account's badge.
 *   b  the next round: another account, four other signals, as blocks. The beam turns the other
 *      way, from the upper left round by the bottom, and the line ends on the account's right.
 * `piece`: the drawings' name. `angles`: where the beam points when it meets each one, in
 * degrees, clockwise from the face's right. `from`, `way`: where the beam starts, and which way
 * it turns (1 clockwise). `sides`: which side of its piece each badge hangs on, clear of the
 * account's.
 */
const SCANS = [
  {
    id: "a",
    piece: "blip",
    over: "over",
    account: VSTEP_ACCOUNT,
    signals: ["team", "funding", "traffic", "hiring"].flatMap((id) => signalFor(id)),
    angles: [315, 385, 495, 552],
    from: 290,
    way: 1,
    sides: ["bottom", "top", "top", "top"],
  },
  {
    id: "b",
    piece: "block",
    over: "above",
    account: TOY_RADAR.next.account,
    signals: TOY_RADAR.next.signals.flatMap((signal) => signalFor(signal.id, signal.text)),
    angles: [225, 150, 40, -12],
    from: 250,
    way: -1,
    sides: ["bottom", "top", "top", "bottom"],
  },
] as const;

/** a smooth line through points (Catmull-Rom, written as cubic Béziers), a path a stretch: the
    take draws them one after the other, so the line is seen going from dot to dot */
function stretches(points: readonly XY[]): string[] {
  const n = (v: number) => Math.round(v * 10) / 10;
  const out: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    out.push(
      `M${n(p1[0])} ${n(p1[1])}C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])} ${n(p2[1])}`,
    );
  }
  return out;
}

function T2Stage() {
  const c = R.anchors.centre;
  const rx = R.anchors["edge-x"][0] - c[0];
  /** the face is a circle of the set: on the picture, an ellipse this much flatter */
  const squash = (R.anchors["edge-z"][1] - c[1]) / rx;
  const face = { left: toyPx(c[0]), top: toyPx(c[1]), "--toy-r": toyPx(rx), "--toy-squash": squash } as CSSProperties;
  const scans = SCANS.map((scan) => ({
    ...scan,
    /** what only the next round shows rests hidden */
    gone: scan.id === "a" ? "" : " lp-toy-gone",
    spots: scan.signals.map((_, k) => R.anchors[`${scan.piece}${k as SpotIndex}`]),
  }));
  return (
    <div className="lp-step-stage lp-step-stage--t2 lp-toy" aria-hidden="true">
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <ToyPic set="radar" name="plate" />
        {/* what is drawn on the radar's face: its rings, a beam a scan, a ring where a signal lands */}
        <div className="lp-t2-face" style={face}>
          <svg className="lp-t2-rings" viewBox="-100 -100 200 200" focusable="false">
            <circle r="33" />
            <circle r="66" />
            <circle r="97" />
            <path d="M-97 0H97M0 -97V97" />
          </svg>
          {scans.map((scan) => (
            <i key={scan.id} className="lp-t2-beam" data-round={scan.id} data-from={scan.from} data-way={scan.way} />
          ))}
          {scans.map((scan) =>
            scan.spots.map((spot, k) => (
              <i
                key={`${scan.id}${k}`}
                className="lp-t2-ping"
                data-round={scan.id}
                data-tone={scan.signals[k].tone}
                style={{ left: toyPx(spot[0] - c[0]), top: toyPx((spot[1] - c[1]) / squash) }}
              />
            )),
          )}
          <i className="lp-t2-heat" />
        </div>
        {/* the line that connects a scan's dots, into the account: a path from each dot to the next */}
        {scans.map((scan) => (
          <svg key={scan.id} className="lp-t2-line" data-round={scan.id} viewBox="0 0 464 426" focusable="false">
            {stretches([...scan.spots, c]).map((d, k) => (
              <path key={k} className={scan.gone.trim() || undefined} d={d} pathLength={1} />
            ))}
          </svg>
        ))}
        <ToyPic set="radar" name="account" className="lp-t2-account" />
        {scans.map((scan) =>
          scan.signals.map((signal, k) => (
            <ToyPic key={`${scan.id}${signal.id}`} set="radar" name={`${scan.piece}${k as SpotIndex}`} className={`lp-t2-blip${scan.gone}`} data-round={scan.id} data-at={scan.angles[k]} />
          )),
        )}
      </div>
      {/* the account: what your own data says of it */}
      {scans.map((scan) => (
        <ToyBadge key={scan.id} at={R.anchors.account} className={`lp-t2-who${scan.gone}`} data-round={scan.id}>
          <b>{scan.account.name}</b>
          <em>{scan.account.own}</em>
        </ToyBadge>
      ))}
      {scans.map((scan) =>
        scan.signals.map((signal, k) => {
          const side = scan.sides[k];
          const at = side === "bottom" ? R.anchors[`${scan.over}${k as SpotIndex}`] : ([scan.spots[k][0], scan.spots[k][1] + 9] as const);
          return (
            <ToyBadge key={`${scan.id}${signal.id}`} at={at} anchor={side} logo={signal.logo} className={`lp-t2-says${scan.gone}`} data-round={scan.id} data-tone={signal.tone}>
              {signal.text}
            </ToyBadge>
          );
        }),
      )}
    </div>
  );
}

/* ── 03 · the Brain: signals run in, ideas come out, the next best Play ──
   The one picture of the seven that is not a 3D set: the Brain as the app draws it and as the
   designer drew it on the page (lp-step-data.ts s1Graph), a fine flat graph. lp-toy-data.ts
   TOY_BRAIN has why. Everything is placed here, in stage px. */

/** the Brain's centre on the stage */
const BRAIN_AT: XY = [232, 142];
/** a point `far` px from another, `angle` degrees clockwise from its right */
const polar = (from: XY, angle: number, far: number): XY => {
  const a = (angle * Math.PI) / 180;
  return [Math.round((from[0] + Math.cos(a) * far) * 10) / 10, Math.round((from[1] + Math.sin(a) * far) * 10) / 10];
};
type Spoke = readonly [angle: number, far: number];
/**
 * The Brain's six hubs, round its centre. `at`, `far`: where the hub is from the centre.
 * `round`: the round it carries a tag on ("a" is the picture, "b" the next round: the tags are
 * TOY_BRAIN's, in the hubs' order). `side`: the side its tag hangs on; no point of the hub lies
 * that way. Its points, each an angle and a distance from the hub: `leaves` (always there),
 * `goes` (there in the picture, gone on the next round), `comes` (there on the next round only).
 * `twigs`: a point farther out, from one of its leaves (the leaf, then an angle and a distance).
 */
const BRAIN_HUBS: readonly {
  tone: string;
  at: number;
  far: number;
  round: "a" | "b";
  side: "left" | "right";
  leaves: readonly Spoke[];
  goes: readonly Spoke[];
  comes: readonly Spoke[];
  twigs: readonly (readonly [leaf: number, angle: number, far: number])[];
}[] = [
  { tone: "pink", at: 196, far: 90, round: "a", side: "left", leaves: [[146, 36], [224, 42], [250, 32], [118, 50]], goes: [[264, 48]], comes: [], twigs: [[1, 205, 20]] },
  { tone: "purple", at: 250, far: 90, round: "b", side: "left", leaves: [[218, 38], [262, 46], [294, 34], [240, 30]], goes: [], comes: [[232, 56], [278, 46]], twigs: [] },
  { tone: "green", at: 304, far: 90, round: "a", side: "right", leaves: [[256, 36], [322, 32], [236, 46], [288, 52]], goes: [[272, 40]], comes: [], twigs: [[1, 350, 20]] },
  { tone: "yellow", at: 354, far: 90, round: "b", side: "right", leaves: [[318, 36], [44, 40], [68, 32], [288, 40]], goes: [], comes: [[304, 58], [84, 52]], twigs: [] },
  { tone: "blue", at: 44, far: 90, round: "a", side: "right", leaves: [[80, 38], [58, 50], [124, 32], [102, 52]], goes: [[140, 44]], comes: [], twigs: [[1, 20, 20]] },
  { tone: "orange", at: 144, far: 90, round: "b", side: "left", leaves: [[100, 36], [126, 48], [82, 42]], goes: [], comes: [[56, 50], [112, 58]], twigs: [[1, 160, 20]] },
];
type BrainPoint = { hub: number; kind: "rest" | "goes" | "comes" | "twig"; n: number; from: XY; at: XY; tone: string };
/** every hub's place, and every point with what it hangs from */
const BRAIN = BRAIN_HUBS.map((hub, k) => ({ ...hub, k, xy: polar(BRAIN_AT, hub.at, hub.far) }));
const BRAIN_POINTS: BrainPoint[] = BRAIN.flatMap((hub) => {
  const spokes = (list: readonly Spoke[], kind: "rest" | "goes" | "comes") =>
    list.map(([angle, far], n): BrainPoint => ({ hub: hub.k, kind, n, from: hub.xy, at: polar(hub.xy, angle, far), tone: hub.tone }));
  const leaves = spokes(hub.leaves, "rest");
  const twigs = hub.twigs.flatMap(([leaf, angle, far], n): BrainPoint[] => {
    const from = leaves[leaf]?.at;
    return from ? [{ hub: hub.k, kind: "twig", n, from, at: polar(from, angle, far), tone: hub.tone }] : [];
  });
  return [...leaves, ...twigs, ...spokes(hub.goes, "goes"), ...spokes(hub.comes, "comes")];
});
const branch = (from: XY, to: XY) => `M${from[0]} ${from[1]}L${to[0]} ${to[1]}`;
/**
 * The Brain's rounds: the hubs that carry a tag, the points its signals leave (a hub, a kind of
 * point, which one), the ideas that come out, the Play. "a" is the picture. "b" is the next
 * round: its signals leave the points that have just come.
 */
const THOUGHTS = [
  {
    id: "a",
    uses: TOY_BRAIN.uses,
    runs: [
      [0, "rest", 1],
      [2, "rest", 0],
      [4, "rest", 1],
      [0, "rest", 2],
      [2, "rest", 2],
    ],
    ideas: TOY_BRAIN.ideas,
    play: TOY_BRAIN.play,
  },
  {
    id: "b",
    uses: TOY_BRAIN.next.uses,
    runs: [
      [1, "comes", 0],
      [3, "comes", 1],
      [5, "comes", 0],
      [1, "comes", 1],
      [3, "comes", 0],
    ],
    ideas: TOY_BRAIN.next.ideas,
    play: TOY_BRAIN.next.play,
  },
] as const;
/** where the ideas land, under the Brain, and the Play under them */
const IDEA_AT: readonly XY[] = [
  [128, 288],
  [338, 288],
];
const PLAY_AT: XY = [232, 310];

function T3Stage() {
  const point = (hub: number, kind: string, n: number) => BRAIN_POINTS.find((p) => p.hub === hub && p.kind === kind && p.n === n);
  return (
    <div className="lp-step-stage lp-step-stage--t3 lp-toy" aria-hidden="true">
      <i className="lp-sx-bg" />
      <div className="lp-toy-set">
        <i className="lp-t3-halo" style={{ left: toyPx(BRAIN_AT[0]), top: toyPx(BRAIN_AT[1]) }} />
        {/* the graph: its branches, then its points over them. A point that only the next round
            has rests hidden, with its branch. */}
        <svg className="lp-t3-graph" viewBox="0 0 464 426" focusable="false">
          {BRAIN.map((hub) => (
            <path key={hub.k} className="lp-t3-edge" data-kind="hub" data-hub={hub.k} d={branch(BRAIN_AT, hub.xy)} pathLength={1} />
          ))}
          {BRAIN_POINTS.map((p) => (
            <path
              key={`${p.hub}${p.kind}${p.n}`}
              className={p.kind === "comes" ? "lp-toy-gone lp-t3-edge" : "lp-t3-edge"}
              data-kind={p.kind}
              data-hub={p.hub}
              data-n={p.n}
              d={branch(p.from, p.at)}
              pathLength={1}
            />
          ))}
          {BRAIN_POINTS.map((p) => (
            <circle
              key={`${p.hub}${p.kind}${p.n}`}
              className={p.kind === "comes" ? "lp-toy-gone lp-t3-dot" : "lp-t3-dot"}
              data-kind={p.kind}
              data-hub={p.hub}
              data-n={p.n}
              data-tone={p.tone}
              cx={p.at[0]}
              cy={p.at[1]}
              r={p.kind === "twig" ? 2.2 : 2.8}
            />
          ))}
          {BRAIN.map((hub) => (
            <circle key={hub.k} className="lp-t3-hub" data-hub={hub.k} data-tone={hub.tone} cx={hub.xy[0]} cy={hub.xy[1]} r={6} />
          ))}
          <circle className="lp-t3-centre" cx={BRAIN_AT[0]} cy={BRAIN_AT[1]} r={12} />
        </svg>
        {/* a ring opens where a point comes or goes */}
        {BRAIN_POINTS.filter((p) => p.kind !== "rest").map((p) => (
          <i key={`${p.hub}${p.kind}${p.n}`} className="lp-toy-gone lp-t3-ring" data-kind={p.kind} data-hub={p.hub} data-n={p.n} data-tone={p.tone} style={{ left: toyPx(p.at[0]), top: toyPx(p.at[1]) }} />
        ))}
        {/* a signal on its way in: from a point to its hub, then to the centre */}
        {THOUGHTS.map((thought) =>
          thought.runs.map(([hub, kind, n], k) => {
            const from = point(hub, kind, n);
            if (!from) return null;
            return (
              <i
                key={`${thought.id}${k}`}
                className="lp-toy-gone lp-t3-run"
                data-round={thought.id}
                data-hub={hub}
                data-tone={from.tone}
                data-x={from.at[0]}
                data-y={from.at[1]}
                data-hx={from.from[0]}
                data-hy={from.from[1]}
                style={{ left: toyPx(from.at[0]), top: toyPx(from.at[1]) }}
              />
            );
          }),
        )}
      </div>
      {/* what the Brain draws on, a tag on a hub each: the picture's three, and the three of the
          next round, which rest hidden */}
      {THOUGHTS.map((thought) => {
        const hubs = BRAIN.filter((hub) => hub.round === thought.id);
        return thought.uses.map((use, k) => {
          const hub = hubs[k];
          if (!hub) return null;
          return (
            <ToyBadge
              key={`${thought.id}${k}`}
              at={[hub.xy[0] + (hub.side === "left" ? -13 : 13), hub.xy[1]]}
              anchor={hub.side === "left" ? "right" : "left"}
              tone={hub.tone}
              className={thought.id === "a" ? "lp-t3-tag" : "lp-toy-gone lp-t3-tag"}
              data-round={thought.id}
              data-hub={hub.k}
            >
              {use.label}
            </ToyBadge>
          );
        });
      })}
      {/* the ideas it comes up with, then the one it recommends: the picture's, and the next
          round's, which rest hidden */}
      {THOUGHTS.map((thought) => {
        const gone = thought.id === "a" ? "" : " lp-toy-gone";
        return (
          <Fragment key={thought.id}>
            {thought.ideas.map((idea, k) => (
              <ToyBadge key={idea.text} at={IDEA_AT[k]} anchor="centre" icon={<PlayGlyph />} className={`lp-t3-idea${gone}`} data-round={thought.id} data-k={k}>
                {idea.text}
              </ToyBadge>
            ))}
            <div className={`lp-t3-play${gone}`} data-round={thought.id} style={{ left: toyPx(PLAY_AT[0]), top: toyPx(PLAY_AT[1]) }}>
              <div className="lp-t3-play__in">
                <i className="lp-t3-play__icon">
                  <PlayGlyph />
                </i>
                <p className="lp-t3-play__k">{VSTEP_BRAIN.play.kicker}</p>
                <p className="lp-t3-play__t">{thought.play.text}</p>
              </div>
            </div>
          </Fragment>
        );
      })}
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
