import type { CSSProperties } from "react";
import { SUPERPOWERS } from "./ag-copy";

/**
 * /agents — Superpowers: the four animated mini-mocks inside the carousel
 * slides (draft #prims). Pure markup — every motion is a CSS keyframe in
 * app/_styles/agents/superpowers.css (ag-sp-*), ported 1:1 from draft-css.css.
 * The carousel re-mounts a mock (React `key`) each time its slide becomes
 * active, which is what restarts the one-shot animations. Colors are token
 * classes (`ag-sp-tone--*`, `ag-sp-wf__row--*`), never literals; text reads
 * in Geist through the kit's universal font rule (founder 2026-09-09: mock
 * stages read in Geist, Fono stays on the install command).
 */

const [S1, S2, S3, S4] = SUPERPOWERS.slides;

/* ── 01 · mini brain (draft-assets/slide1-mini-brain.svg, 420×220) ──
   hub coordinates + bdrift phase offsets are the draft's, in draft order */
const HUB_POS = [
  [110, 60],
  [300, 50],
  [320, 170],
  [90, 170],
  [316, 110],
] as const;
const HUB_DELAY = [0, -1.1, -2.2, -3.3, -4.4] as const;
const ROOT = { x: 210, y: 110 } as const;

export function AgSpBrainMock() {
  return (
    <svg className="ag-sp-brain" viewBox="0 0 420 220" aria-hidden="true" focusable="false">
      {/* one scene group: phones shift it left (CSS) to make room for the
          bigger labels the small render needs */}
      <g className="ag-sp-brain__scene">
        {S1.brain.map(([label], i) => {
          const [x, y] = HUB_POS[i]!;
          return <line key={label} className="ag-sp-brain__edge" x1={ROOT.x} y1={ROOT.y} x2={x} y2={y} />;
        })}
        {S1.brain.map(([label, tone], i) => {
          const [x, y] = HUB_POS[i]!;
          return (
            <g key={label} className={`ag-sp-brain__hub ag-sp-tone--${tone}`} style={{ animationDelay: `${HUB_DELAY[i]}s` }}>
              <circle className="ag-sp-brain__node" cx={x} cy={y} r={10} />
              <text className="ag-sp-brain__label" x={x + 15} y={y + 5}>
                {label}
              </text>
            </g>
          );
        })}
        <circle className="ag-sp-brain__root" cx={ROOT.x} cy={ROOT.y} r={14} />
      </g>
    </svg>
  );
}

/* ── 02 · enrichment chips (chipPop 4.2s loop, 0.4s × i) ── */
export function AgSpChipsMock() {
  return (
    <div className="ag-sp-chips">
      {S2.chips.map((chip, i) => (
        <span key={chip} className="ag-sp-chip" style={{ animationDelay: `${(i * 0.4).toFixed(2)}s` }}>
          {chip}
        </span>
      ))}
    </div>
  );
}

/* ── 03 · warm-up domains (animIn rows at 0/.6/1.2s, warm bars) ── */
export function AgSpDomainsMock() {
  return (
    <>
      <div className="ag-sp-domains">
        {S3.domains.map((d, i) => (
          <div key={d.host} className={`ag-sp-domain ag-sp-tone--${d.tone}`} style={{ animationDelay: `${(i * 0.6).toFixed(1)}s` }}>
            <div className="ag-sp-domain__row">
              <span className="ag-sp-domain__host">{d.host}</span>
              <span className="ag-sp-domain__meta">{d.meta}</span>
            </div>
            <div className="ag-sp-domain__track">
              <div className="ag-sp-domain__fill" style={{ "--ag-sp-pct": `${d.pct}%` } as CSSProperties} />
            </div>
          </div>
        ))}
      </div>
      <p className="ag-sp-note">{S3.note}</p>
    </>
  );
}

/* ── 04 · workflow (wfPop rows at .2/.8/1.1/1.7/2/2.9s, wfDrop dot) ── */
const WF_DELAY = [0.2, 0.8, 1.1, 1.7, 2, 2.9] as const;

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.5a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92zM20.45 20h-3.37v-5.6c0-1.34-.03-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V20H9.7V8.5h3.24v1.57h.05c.45-.85 1.55-1.75 3.19-1.75 3.42 0 4.05 2.25 4.05 5.17V20h.22z" />
    </svg>
  );
}
function ReplyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 6 6v4" />
    </svg>
  );
}
const ICONS = { mail: MailIcon, linkedin: LinkedinIcon, reply: ReplyIcon } as const;

export function AgSpWorkflowMock() {
  return (
    <>
      <div className="ag-sp-wf">
        <div className="ag-sp-wf__line" />
        <div className="ag-sp-wf__dot" />
        {S4.steps.map((step, i) => {
          const style = { animationDelay: `${WF_DELAY[i]}s` };
          if ("note" in step) {
            return (
              <div key={i} className="ag-sp-wf__row ag-sp-wf__row--note" style={style}>
                {step.note}
              </div>
            );
          }
          const Icon = ICONS[step.icon];
          if ("reply" in step) {
            return (
              <div key={i} className={`ag-sp-wf__row ag-sp-wf__row--${step.tint}`} style={style}>
                <span className="ag-sp-wf__icon">
                  <Icon />
                </span>
                <span className="ag-sp-wf__reply">{step.reply}</span>
              </div>
            );
          }
          return (
            <div key={i} className={`ag-sp-wf__row ag-sp-wf__row--${step.tint}`} style={style}>
              <span className="ag-sp-wf__icon">
                <Icon />
              </span>
              <div className="ag-sp-wf__pill">
                <span className="ag-sp-wf__label">
                  <b>{step.label}</b>
                  <span className="ag-sp-wf__detail">{step.detail}</span>
                </span>
                <span className="ag-sp-wf__tag">{step.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="ag-sp-wf__foot">{S4.note}</p>
    </>
  );
}

/** Slide order = draft order. */
export const AG_SP_MOCKS = [AgSpBrainMock, AgSpChipsMock, AgSpDomainsMock, AgSpWorkflowMock] as const;

/** One screen-reader description per animated mock (README rule 10) —
    built from the copy so the prompt and the data stay verbatim. */
export const AG_SP_MOCK_LABELS: readonly string[] = [
  `Chat mock: you ask "${S1.prompt}" and a mini brain graph links Pancake to ${S1.brain.map(([l]) => l).join(", ")}.`,
  `Chat mock: you ask "${S2.prompt}" and enrichment chips pop in: ${S2.chips.join(", ")}.`,
  `Chat mock: you ask "${S3.prompt}" and three domains warm up: ${S3.domains.map((d) => `${d.host}, ${d.meta}`).join("; ")}. ${S3.note}`,
  `Chat mock: you ask "${S4.prompt}" and it becomes a sequence: ${S4.steps
    .map((s) => ("note" in s ? s.note : "reply" in s ? s.reply : `${s.label}${s.detail} (${s.tag})`))
    .join(" ")}. ${S4.note}`,
];
