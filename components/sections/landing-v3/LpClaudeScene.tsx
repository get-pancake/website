// LpClaudeScene — Claude's interface as a scene (server-safe, no hooks): the pieces of the
// homepage's two Claude animations, the demo window's Claude & Codex view (LpDemo.tsx) and the
// deep-dive story "Run it from Claude or Codex" (LpStoryClaude.tsx). Founder 2026-10-13: the
// story "should not be necessarily the same but reuse components". One markup, one stylesheet
// (demo.css, "Claude & Codex view": classes lp-demowin__c*, under a .lp-demowin ancestor), one
// timeline builder (lp-demo-claude-timeline.ts); what differs is the SCRIPT (ClaudeScript).
//
// Claude's UI as the launch film drew it (Pancake V2 launch/ph-motion-film claude2.mjs): the
// greeting, the composer with its Pancake connector chip, the user bubble, the serif answer
// streamed a word at a time, one white card per tool call under the Pancake mark (the only
// coloured mark), a result card in Claude's neutral type, Claude's permission prompt.
//
// The markup is the scene's HOME (the composer empty) plus every later element hidden; with
// `rest="end"` demo.css draws the END picture instead (the deep dive rests on its end picture).
//
// Since 2026-10-26 the same scene wears Codex too (`chrome.harness`; founder: "use mobbin to repro
// the UIs of each one of those tools"): data-harness on the root picks the app's skin in demo.css,
// and the few pieces Codex draws differently are here (its top-left mark and name, the mic). Same
// markup, same classes, so lp-demo-claude-timeline.ts plays both apps.

import { Fragment } from "react";

import { lpClaudeSerif } from "./lp-claude-font";
import { SL_AVATAR } from "./lp-story-learns-art";

export type ClaudeTool = { title: string; doing: string; done: string; count?: number; note?: string };
export type ClaudeScript = {
  /** typed in the composer, then the user bubble */
  request: string;
  /** Claude's first line */
  say: string;
  /** the tool calls, one card each */
  tools: readonly ClaudeTool[];
  /** Claude's line over the result card */
  found: string;
  /** the result card: a kicker, a title, a status that changes once the action is allowed */
  card: {
    kicker: string;
    title: string;
    before: string;
    after: string;
    rows: readonly { key: string; value: string | readonly string[] }[];
  };
  /** the permission prompt: "<lead> <b>tool</b> <from> <b>app</b>" */
  ask: { lead: string; tool: string; from: string; app: string };
  /** the call Claude makes once allowed */
  action: ClaudeTool;
  /** Claude's last line */
  done: string;
};
/** The agent app whose interface the scene wears (demo.css: one skin per app, on the shared
 *  markup; founder 2026-10-26: the demo plays in the most used agent apps, their UIs reproduced
 *  from Mobbin). */
export type Harness = "claude" | "codex";
export type ClaudeChrome = {
  /** default "claude" */
  harness?: Harness;
  /** the window's top-left title, where the app shows one (Codex's mark and name) */
  title?: string;
  greeting: string;
  placeholder: string;
  connector: string;
  /** the composer's model picker; "" = none */
  model: string;
  reply: string;
  /** the permission prompt's two buttons: the quiet one, then the one the cursor presses */
  always: string;
  allow: string;
};

/** The Claude spark (Figma 4964:3909). */
const SPARK = { viewBox: "0 0 33.9468 33.9468", d: "M6.66064 22.5675L13.3368 18.8235L13.45 18.4982L13.3368 18.3171H13.0129L11.8955 18.2492L8.07933 18.146L4.77094 18.0088L1.56579 17.8362L0.758145 17.6651L0 16.6679L0.0777947 16.17L0.75673 15.7159L1.72704 15.8008L3.877 15.9465L7.09912 16.17L9.43579 16.3072L12.8998 16.6679H13.45L13.5278 16.4458L13.3383 16.3072L13.1926 16.17L9.85729 13.9125L6.24762 11.5249L4.35792 10.1501L3.33386 9.45559L2.819 8.80212L2.59551 7.37635L3.52339 6.35512L4.76952 6.43999L5.08777 6.52627L6.35088 7.49658L9.04964 9.58431L12.573 12.177L13.0893 12.607L13.2944 12.4613L13.3213 12.358L13.0893 11.9705L11.1727 8.51074L9.12744 4.98876L8.21653 3.52905L7.97608 2.65351C7.88446 2.31723 7.83504 1.97086 7.82897 1.62237L8.88698 0.189536L9.47115 0L10.8799 0.189536L11.474 0.704396L12.351 2.70443L13.7682 5.85723L15.9677 10.143L16.6127 11.4132L16.9564 12.59L17.0851 12.9507H17.3086V12.7442L17.4897 10.3311L17.8249 7.36786L18.1502 3.55592L18.2634 2.48094L18.7952 1.19379L19.8518 0.497886L20.6778 0.893932L21.3568 1.86283L21.262 2.49084L20.8575 5.10899L20.0668 9.21513L19.5519 11.962H19.8518L20.1955 11.6197L21.5887 9.77243L23.9254 6.853L24.958 5.69316L26.1602 4.41449L26.9339 3.80487H28.3951L29.47 5.40178L28.9891 7.05103L27.4842 8.95629L26.238 10.5716L24.4502 12.9762L23.3327 14.8998L23.436 15.0554L23.7019 15.0271L27.7416 14.1699L29.9241 13.7739L32.5281 13.3284L33.7063 13.8772L33.835 14.4359L33.3711 15.5773L30.586 16.2647L27.3201 16.9182L22.4558 18.0682L22.3964 18.1106L22.4657 18.1969L24.6567 18.4034L25.593 18.4543H27.8873L32.1589 18.7726L33.2763 19.5109L33.9468 20.4133L33.835 21.0993L32.1165 21.9763L29.7968 21.4261L24.3809 20.1389L22.5251 19.6736H22.2677V19.8292L23.8137 21.3398L26.651 23.8999L30.1999 27.1956L30.3795 28.0132L29.9241 28.6567L29.4432 28.5874L26.3243 26.2437L25.1206 25.1871L22.3964 22.8957H22.2153V23.1361L22.8433 24.0541L26.1602 29.0344L26.3328 30.562L26.0923 31.0613L25.2324 31.3626L24.2875 31.19L22.344 28.4672L20.3426 25.4021L18.7259 22.6538L18.5279 22.767L17.5745 33.0274L17.1276 33.5507L16.0964 33.9468L15.2379 33.2947L14.7824 32.2381L15.2379 30.1504L15.7881 27.429L16.2336 25.2649L16.6382 22.5774L16.8786 21.6835L16.8616 21.6241L16.6636 21.6496L14.6353 24.4318L11.5518 28.5973L9.11047 31.207L8.52488 31.439L7.51072 30.9156L7.60549 29.9792L8.17269 29.1461L11.5504 24.8519L13.5872 22.1899L14.9026 20.6538L14.8941 20.4303H14.8164L5.8445 26.2522L4.24618 26.4587L3.55734 25.8137L3.64362 24.7585L3.97036 24.4148L6.66913 22.559L6.66064 22.5675Z" };

const MARKS = { spark: SPARK } as const;

export function ClaudeMark({ id, className }: { id: keyof typeof MARKS; className: string }) {
  const m = MARKS[id];
  return (
    <svg className={className} viewBox={m.viewBox} aria-hidden="true" focusable="false">
      <path d={m.d} />
    </svg>
  );
}

/** The Pancake mark, full colour (the only coloured mark in Claude's interface). */
export function PancakeMark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${SL_AVATAR.size} ${SL_AVATAR.size}`} aria-hidden="true" focusable="false">
      {SL_AVATAR.shapes.map((shape, i) => (
        <path key={i} d={shape.d} fill={shape.fill} opacity={"opacity" in shape ? shape.opacity : undefined} />
      ))}
    </svg>
  );
}

/** The cursor (production's arrow), one per window: the window clips it, so it enters from the
 *  window's bottom edge. */
export function Cursor() {
  return (
    <span className="lp-demowin__cursor" aria-hidden="true">
      <svg width="18" height="22" viewBox="0 0 18 22" focusable="false">
        <path d="M1.5 1.5v16.2l4.3-4.1 2.9 6.6 3-1.3-2.9-6.5h6z" />
      </svg>
    </span>
  );
}

/** Claude's answer: one span a word, so it can stream in. */
function Say({ line, text }: { line: number; text: string }) {
  return (
    <p className="lp-demowin__csay" data-line={line}>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="lp-demowin__w">{word}</span>
        </Fragment>
      ))}
    </p>
  );
}

/** One tool call, its own card: the Pancake mark, the tool, and on the right what it is doing,
 *  then what came back. */
function ToolCard({ tool, action }: { tool: ClaudeTool; action?: boolean }) {
  return (
    <li className="lp-demowin__ctool" data-deploy={action ? "" : undefined}>
      <PancakeMark className="lp-demowin__ctool-mark" />
      <span className="lp-demowin__ctool-t">{tool.title}</span>
      <span className="lp-demowin__ctool-r">
        <span className="lp-demowin__ctool-doing">{tool.doing}</span>
        <span className="lp-demowin__ctool-done">
          {tool.count !== undefined && <b>{tool.count}</b>} {tool.done}
          {tool.note && <span className="lp-demowin__ctool-note">· {tool.note}</span>}
        </span>
      </span>
    </li>
  );
}

export function LpClaudeScene({
  script,
  chrome,
  rest = "home",
  label,
}: {
  script: ClaudeScript;
  chrome: ClaudeChrome;
  /** "end": the markup shows the scene's last picture (the deep dive's rest) */
  rest?: "home" | "end";
  /** role="img" label; omit where an ancestor already carries it */
  label?: string;
}) {
  const s = script;
  const harness = chrome.harness ?? "claude";
  return (
    // lpClaudeSerif.variable defines --lp-font-claude-serif here (Literata, homepage-only module)
    <div
      className={`lp-demowin__cwin ${lpClaudeSerif.variable}`}
      data-harness={harness}
      data-rest={rest === "end" ? "end" : undefined}
    >
      <div className="lp-demowin__capp" role={label ? "img" : undefined} aria-label={label}>
        {chrome.title && (
          <p className="lp-demowin__ctitle">
            {harness === "codex" && <i className="lp-demowin__ctitle-mark" data-ico="codex" />}
            {chrome.title}
          </p>
        )}
        <p className="lp-demowin__greet">
          {harness === "claude" && <ClaudeMark id="spark" className="lp-demowin__greet-spark" />}
          {chrome.greeting}
        </p>

        {/* the thread */}
        <div className="lp-demowin__cthread">
          <p className="lp-demowin__cbubble">{s.request}</p>
          <Say line={1} text={s.say} />
          <ul className="lp-demowin__ctools">
            {s.tools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </ul>
          <Say line={2} text={s.found} />
          {/* the result, in Claude's own interface (founder 2026-10-13: "in claude the play should
              stay in a kind of claude ui, should not be the pancake look and feel"): a card like
              the tool calls', its rows in Claude's neutral type */}
          <div className="lp-demowin__cplay">
            <p className="lp-demowin__cplay-h">
              <PancakeMark className="lp-demowin__ctool-mark" />
              <span className="lp-demowin__cplay-k">{s.card.kicker}</span>
              <span className="lp-demowin__cplay-n">{s.card.title}</span>
              <span className="lp-demowin__cplay-st">
                <span data-s="draft">{s.card.before}</span>
                <span data-s="live">{s.card.after}</span>
              </span>
            </p>
            <ul className="lp-demowin__cplay-rows">
              {s.card.rows.map((row) => (
                <li key={row.key}>
                  <span className="lp-demowin__cplay-key">{row.key}</span>
                  <span className="lp-demowin__cplay-v">
                    {typeof row.value === "string"
                      ? row.value
                      : row.value.map((w) => (
                          <span key={w} className="lp-demowin__cplay-chip">
                            {w}
                          </span>
                        ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Claude's permission prompt, then the call it allowed */}
          <div className="lp-demowin__perm">
            <p className="lp-demowin__perm-t">
              {s.ask.lead} <b>{s.ask.tool}</b> {s.ask.from} <b>{s.ask.app}</b>
            </p>
            <p className="lp-demowin__perm-b">
              <span className="lp-demowin__perm-btn">{chrome.always}</span>
              <span className="lp-demowin__perm-btn lp-demowin__perm-btn--go">{chrome.allow}</span>
            </p>
          </div>
          <ul className="lp-demowin__ctools lp-demowin__ctools--deploy">
            <ToolCard tool={s.action} action />
          </ul>
          <Say line={3} text={s.done} />
        </div>

        {/* the composer: ONE element, from the home to the dock */}
        <div className="lp-demowin__cbar">
          <p className="lp-demowin__cbar-ph">{chrome.placeholder}</p>
          <p className="lp-demowin__cbar-text">{s.request}</p>
          <p className="lp-demowin__cbar-ask">{chrome.reply}</p>
          <span className="lp-demowin__caret" />
          <p className="lp-demowin__cctrls">
            <span className="lp-demowin__plus" data-ico="plus" />
            <span className="lp-demowin__conn">
              <PancakeMark className="lp-demowin__conn-mark" />
              {chrome.connector}
              <i />
            </span>
            {chrome.model && <span className="lp-demowin__model">{chrome.model}</span>}
            {harness === "codex" && <span className="lp-demowin__mic" data-ico="mic" />}
            <span className="lp-demowin__csend" data-ico="arrow-up" />
          </p>
        </div>
        <Cursor />
      </div>
    </div>
  );
}
