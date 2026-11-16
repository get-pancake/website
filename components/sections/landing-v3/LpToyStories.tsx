import type { ReactNode } from "react";

import { ClaudeMark, GrokBotMark } from "./LpAgentMarks";
import { PancakeMark } from "./LpClaudeScene";
import { ToyBadge, ToyPic, toyPx } from "./LpToyKit";
import { BRAIN_HUBS } from "./LpToySteps";
import type { DiveStageProps } from "./lp-dive-stages";
import { TOY_ART } from "./lp-toy-art";
import { lpClaudeSerif } from "./lp-claude-font";
import { STORY_MCP } from "./lp-story-mcp-data";
import { STORY_PING } from "./lp-story-ping-data";
import { TOY_ENGINE, TOY_JOURNEY, TOY_MERGE } from "./lp-toy-data";
import { VSTEP_BRAIN } from "./lp-vision-data";

/**
 * The four toy pictures of "What your agent can do with Pancake" (the vision homepage's deep
 * dive, 2026-11-12), each on the dive's 752 × 489 box. They take the place of the stories "mcp",
 * "p-history", "p-dedup" and "ping", which stay in the registry (lp-vision-data.ts
 * VISION_FEATURES `story` names the one a feature shows).
 *   t-engine    Claude's window on a cable to an engine: a part of it comes on for each step
 *   t-journey   one buyer goes from stop to stop along a track: each touch keeps its date
 *   t-merge     three sightings of one person, from three sources, become one record
 *   t-ping      a phone lights up by itself: your agent writes first
 * Each is a set of soft 3D objects in the kitchen's look, drawn as flat layers (LpToyKit.tsx has
 * how), with the page's own type over them. Since 2026-11-16 no glow, ring, beam or point of
 * light is drawn over them (lp-toy-kit.ts has the rule).
 *
 * Contract (lp-dive-stages.ts): server-safe (no hooks, no "use client"), ONE root with
 * data-lp-story and aria-hidden (the shell's host carries the ALT), the markup is the story's END
 * picture, nothing painted behind the scene. What only shows on the way rests hidden
 * (.lp-toy-gone). Motion: lp-toy-story-timelines.ts. Styles: toys.css. How the sets are drawn
 * and how to change one: toys/README.md.
 */

type XY = readonly [number, number];

/* small glyphs, in currentColor, where a touch has no tool's mark to show (the kitchen's own,
   kitchen/overlay.js) */
const GLYPH: Record<string, ReactNode> = {
  chat: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path
        d="M5.5 4.5h13A2.5 2.5 0 0 1 21 7v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.3L8 20.4V17H5.5A2.5 2.5 0 0 1 3 14.5V7a2.5 2.5 0 0 1 2.5-2.5z"
        fill="currentColor"
      />
    </svg>
  ),
  reply: (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M10 8.5V5l-7 6.5 7 6.5v-3.6c4.6 0 7.8 1.3 10 4.6-.6-6-3.9-10-10-10.5z" fill="currentColor" />
    </svg>
  ),
};

/* ── "Remember every touch with every buyer": one buyer, stop after stop ── */

const J = TOY_ART.journey;
type StopIndex = 0 | 1 | 2 | 3;
/** the stops' tones, in the set's order (toys/studio/scene-journey.js STOPS) */
const STOP_TONES = ["pink", "purple", "yellow", "green"] as const;
/** The first touch's badge hangs from its left corner, here: centred on its stop it would run off
    the picture's left edge on phones, where the type is larger. */
const FIRST_TOUCH_LEFT = 30;
/** where the record of what was kept stands: the middle of its top edge */
const KEPT_AT: XY = [588, 404];

export function LpToyJourneyStage(_props: DiveStageProps) {
  const j = TOY_JOURNEY;
  const last = J.anchors[`stop${(j.touches.length - 1) as StopIndex}`];
  return (
    <div className="lp-toy lp-toy-story lp-tj" data-lp-story="t-journey" aria-hidden="true">
      <div className="lp-toy-set">
        <ToyPic set="journey" name="plate" />
        {j.touches.map((touch, k) => {
          const name = `on${k as StopIndex}` as const;
          return <ToyPic key={touch.text} set="journey" name={name} className="lp-tj-on" data-k={k} />;
        })}
        {/* the buyer, at rest on the last stop */}
        <ToyPic set="journey" name="pawn" from={J.anchors.pawn} to={last} className="lp-tj-pawn" />
      </div>
      {/* each touch, dated, by its stop: under it, then over it, by turns, so that two dates
          never meet (on phones their type is larger) */}
      {j.touches.map((touch, k) => (
        <ToyBadge
          key={touch.text}
          at={k % 2 ? J.anchors[`over${k as StopIndex}`] : [k === 0 ? FIRST_TOUCH_LEFT : J.anchors[`stop${k as StopIndex}`][0], J.anchors[`stop${k as StopIndex}`][1] + 46]}
          anchor={k % 2 ? "bottom" : k === 0 ? "top-start" : "top"}
          logo={"logo" in touch ? touch.logo : undefined}
          icon={"icon" in touch ? GLYPH[touch.icon] : undefined}
          className="lp-tj-touch"
          data-tone={STOP_TONES[k]}
        >
          <small>{touch.when}</small>
          <b>{touch.text}</b>
        </ToyBadge>
      ))}
      {/* what was kept: a dot a touch, filled as the buyer reaches it, and their count */}
      <div className="lp-tj-kept" style={{ left: toyPx(KEPT_AT[0]), top: toyPx(KEPT_AT[1]) }}>
        <p className="lp-tj-kept__in">
          <span className="lp-tj-kept__dots">
            {j.touches.map((touch, k) => (
              <i key={touch.text} className="lp-tj-slot" data-tone={STOP_TONES[k]} />
            ))}
          </span>
          <span className="lp-tj-kept__n" data-counts={j.kept.map((count) => count.text).join("|")}>
            {j.kept[j.kept.length - 1].text}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ── "See one buyer behind three emails": three sightings, one record ── */

const M = TOY_ART.merge;
type LaneIndex = 0 | 1 | 2;
/** the lanes' tones, back to front (toys/studio/scene-merge.js LANES) */
const LANE_TONES = ["pink", "purple", "blue"] as const;
/** a line of the set as an SVG path, point to point */
const polyline = (points: readonly XY[]) => `M${points.map((p) => `${p[0]} ${p[1]}`).join("L")}`;

export function LpToyMergeStage(_props: DiveStageProps) {
  const m = TOY_MERGE;
  return (
    <div className="lp-toy lp-toy-story lp-tm" data-lp-story="t-merge" aria-hidden="true">
      <div className="lp-toy-set">
        <ToyPic set="merge" name="plate" />
        {/* the way each one came, kept in its source's tone */}
        <svg className="lp-tm-trails" viewBox="0 0 752 489" focusable="false">
          {m.sightings.map((sighting, k) => (
            <path key={sighting.text} data-tone={LANE_TONES[k]} d={polyline(M.paths[`lane${k as LaneIndex}`])} pathLength={1} />
          ))}
        </svg>
        {/* the same person, as each source knows them: on the way to the stand */}
        {m.sightings.map((sighting, k) => (
          <ToyPic
            key={sighting.text}
            set="merge"
            name={`ghost${k as LaneIndex}`}
            from={M.anchors.ghost}
            to={M.paths[`lane${k as LaneIndex}`][0]}
            className="lp-toy-gone lp-tm-ghost"
            data-k={k}
          />
        ))}
        <ToyPic set="merge" name="buyer" className="lp-tm-buyer" />
      </div>
      {/* what each source holds: where it saw them, and under which address */}
      {m.sightings.map((sighting, k) => {
        const pad = M.anchors[`pad${k as LaneIndex}`];
        return (
          <ToyBadge
            key={sighting.text}
            at={[pad[0] - 54, pad[1] - 4]}
            anchor="right"
            logo={sighting.logo}
            className="lp-tm-seen"
            data-tone={LANE_TONES[k]}
          >
            <small>{sighting.from}</small>
            <b>{sighting.text}</b>
          </ToyBadge>
        );
      })}
      {/* the one record */}
      <ToyBadge at={M.anchors.over} kind="dark" className="lp-tm-one">
        <span className="lp-tm-one__from">
          {m.sightings.map((sighting, k) => (
            <i key={sighting.text} data-tone={LANE_TONES[k]} />
          ))}
        </span>
        {m.one.text}
      </ToyBadge>
    </div>
  );
}

/* ── "Bring you the next deal before you ask": a phone lights up by itself ── */

export function LpToyPingStage(_props: DiveStageProps) {
  const s = STORY_PING;
  return (
    <div className="lp-toy lp-toy-story lp-tp" data-lp-story="t-ping" aria-hidden="true">
      <div className="lp-toy-set">
        {/* the phone: asleep, and the same glass lit over it */}
        <div className="lp-tp-phone">
          <ToyPic set="ping" name="plate" />
          <ToyPic set="ping" name="lit" className="lp-tp-lit" />
        </div>
      </div>
      {/* what it says: your agent writes first, you answer, it is done */}
      <div className="lp-tp-chat">
        <p className="lp-tp-who">
          <span className="lp-tp-avatar">
            <GrokBotMark />
          </span>
          <b>{s.contact}</b>
          <small>{s.time}</small>
        </p>
        {s.messages.map((message, i) => (
          <div key={i} className="lp-tp-row" data-from={message.from}>
            {/* the other side is typing: on the message's own spot until it comes */}
            {message.from === "them" ? (
              <span className="lp-toy-gone lp-tp-typing">
                <i />
                <i />
                <i />
              </span>
            ) : null}
            <p className="lp-tp-bubble">{message.text}</p>
            {message.from === "me" ? <small className="lp-tp-delivered">{s.delivered}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── "Run your revenue engine from Claude": Claude's window, a cable, the engine ── */

/** The 3D parts on the engine's stand: your tables and the radar. The Brain's 3D drawing
    (toys/studio/scene-engine.js: beads on rods round a dark one) read as an atom, as the 3D Brain
    of the 1-2-3 had (lp-toy-data.ts TOY_BRAIN), so it left the stand on 2026-11-16; the page draws
    the Brain there itself (EngineBrain). */
const PARTS = ["tables", "radar"] as const;

const E = TOY_ART.engine;
/** The engine's Brain (2026-11-16): the 1-2-3's own Brain as the app draws it (LpToySteps.tsx
    BRAIN_HUBS: its six hubs, their tones, the first points of each), small, lying flat on the
    stand where the 3D Brain stood (`E.anchors.brain`, a little forward, clear of the back rim).
    Like the two other parts, it comes on as Claude runs its step ("Read your Brain"). `hub`: a
    hub's distance from the centre; `leaf`: how much shorter its points' branches are than in
    the 1-2-3. Its flattening is the stand's own (the engine set's camera, as the radar face's). */
const ENGINE_BRAIN = { at: [E.anchors.brain[0], E.anchors.brain[1] + 6] as XY, hub: 24, leaf: 0.32, leaves: 3 } as const;

function EngineBrain() {
  const polar = (from: XY, angle: number, far: number): XY => {
    const a = (angle * Math.PI) / 180;
    return [Math.round((from[0] + Math.cos(a) * far) * 10) / 10, Math.round((from[1] + Math.sin(a) * far) * 10) / 10];
  };
  const hubs = BRAIN_HUBS.map((hub) => {
    const xy = polar([0, 0], hub.at, ENGINE_BRAIN.hub);
    return { tone: hub.tone, xy, points: hub.leaves.slice(0, ENGINE_BRAIN.leaves).map(([angle, far]) => polar(xy, angle, far * ENGINE_BRAIN.leaf)) };
  });
  const line = (from: XY, to: XY) => `M${from[0]} ${from[1]}L${to[0]} ${to[1]}`;
  return (
    <svg
      className="lp-te-part lp-te-brain"
      data-part="brain"
      viewBox="-60 -60 120 120"
      focusable="false"
      style={{ left: toyPx(ENGINE_BRAIN.at[0]), top: toyPx(ENGINE_BRAIN.at[1]) }}
    >
      {hubs.map((hub) => (
        <path key={hub.tone} className="lp-te-brain__edge" data-kind="hub" d={line([0, 0], hub.xy)} />
      ))}
      {hubs.flatMap((hub) => hub.points.map((point, k) => <path key={`${hub.tone}${k}`} className="lp-te-brain__edge" d={line(hub.xy, point)} />))}
      {hubs.flatMap((hub) => hub.points.map((point, k) => <circle key={`${hub.tone}${k}`} className="lp-te-brain__dot" data-tone={hub.tone} cx={point[0]} cy={point[1]} r={1.7} />))}
      {hubs.map((hub) => (
        <circle key={hub.tone} className="lp-te-brain__hub" data-tone={hub.tone} cx={hub.xy[0]} cy={hub.xy[1]} r={3.6} />
      ))}
      <circle className="lp-te-brain__centre" cx={0} cy={0} r={6} />
    </svg>
  );
}

export function LpToyEngineStage(_props: DiveStageProps) {
  const e = TOY_ENGINE;
  const chrome = STORY_MCP;
  const play = VSTEP_BRAIN.play;
  /** what is asked, said and recommended, round after round: the picture's own, then the others.
      Every round is in the markup; the root's data-round shows one (toys.css), and the take
      moves on to the next each time it plays again (lp-toy-story-timelines.ts). */
  const rounds = [{ ask: e.ask, say: e.say, name: play.name, rows: e.rows }, ...e.more.map((round) => ({ ask: round.ask, say: round.say, name: round.play.name, rows: round.rows }))];
  return (
    <div className={`lp-toy lp-toy-story lp-te ${lpClaudeSerif.variable}`} data-lp-story="t-engine" data-round={0} aria-hidden="true">
      <div className="lp-toy-set">
        <ToyPic set="engine" name="plate" />
        <ToyPic set="engine" name="stand" />
        {/* the parts: each one comes on as Claude runs its step. The Brain first, drawn flat */}
        <EngineBrain />
        {PARTS.map((part) => (
          <ToyPic key={part} set="engine" name={part} className="lp-te-part" data-part={part} />
        ))}
        {/* (no Pancake disc on the stand's front since 2026-11-16: founder, "la petite pill
            pancake ici apporte pas grand chose") */}
      </div>
      {/* Claude's window: the ask, the steps it runs through Pancake, the answer and the Play */}
      <div className="lp-te-win">
        <p className="lp-te-title">
          <span className="lp-te-title__mark">
            <ClaudeMark />
          </span>
          {chrome.title}
        </p>
        {/* Claude's home line: frame 0 only, hidden at rest */}
        <p className="lp-te-greet">{chrome.greeting}</p>
        <div className="lp-te-thread">
          <p className="lp-te-ask">
            {rounds.map((round, r) => (
              <span key={r} data-r={r}>
                {round.ask.text}
              </span>
            ))}
          </p>
          <ul className="lp-te-steps">
            {e.steps.map((step) => (
              <li key={step.id} className="lp-te-step" data-part={step.id}>
                <PancakeMark className="lp-te-pk" />
                <span>{step.text}</span>
                <em>{chrome.steps[0].done}</em>
              </li>
            ))}
          </ul>
          {rounds.map((round, r) => (
            <p key={r} className="lp-te-say" data-r={r}>
              {round.say.text}
            </p>
          ))}
          {rounds.map((round, r) => (
            <div key={r} className="lp-te-play" data-r={r}>
              <p className="lp-te-play__h">
                <PancakeMark className="lp-te-pk" />
                <span>{play.kicker}</span>
                <b>{round.name}</b>
              </p>
              {round.rows.map((row) => (
                <p key={row.name} className="lp-te-play__row">
                  <span>{row.name}</span>
                  <b>{row.value}</b>
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className="lp-te-bar">
          <span className="lp-te-field">
            <span className="lp-te-ph">{chrome.placeholder}</span>
            {rounds.map((round, r) => (
              <span key={r} className="lp-te-typed" data-r={r}>
                {round.ask.text}
              </span>
            ))}
            <span className="lp-te-reply">{chrome.reply}</span>
          </span>
          <span className="lp-te-conn">
            <PancakeMark className="lp-te-pk" />
            {chrome.connector}
            <i />
          </span>
          <span className="lp-te-send">
            <svg viewBox="0 0 14 14" focusable="false">
              <path d="M7 12.2V1.8M11.8 6.6 7 1.8 2.2 6.6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
