// LpDemo — the homepage demo window (V2 Figma 4939:2645, window 4939:2736 / clean copy 4963:848,
// pills 4939:2784; the conversation as storyboard frame "4" 5024:8353 draws it).
// SERVER component. Owner: demo-scroll package. Specs: specs/demo-scroll.md,
// specs/updates/hero-scroll-4.md, specs/updates/mobile-402.md §5.3, _decisions.md §3 + §9 + §10.
//
// The window is assembled and opaque from the first frame (founder 2026-10-12, §10: the
// storyboard's scroll assembly 01 → 02 → 03 is gone). On desktop its top bar peeks at the bottom
// of the first screen (hero.css sizes the hero for it) and the card grows from .94 to 1 as the
// visitor scrolls to it (lp-demo-scroll.ts, demo.css "the one scroll effect").
//
// Since 2026-10-26 (founder: "The demo sub banner should evolve in claude, chatgpt but also
// grokbot, Or whatever are the top 3-4-5 harnesses most used on the market … use components
// originally in the figma to show the timing on each type … use mobbin to repro the UIs of each
// one of those tools … which will allow us to remove those odd logos"): ONE app window over the
// V2 pills (4939:2784, the yellow fill is each view's timing), one pill per agent app
// (LP_DEMO.agents), each running the same request in that app's own interface (LpClaudeScene's
// skins, demo.css). The Claude & Codex marks that stood bottom-right are gone: the pills name
// the apps. The Pancake app's own view left the homepage then; its timeline file stays (the
// agent timeline imports its helpers), and so do its styles in demo.css (not cleaned up yet).
//
// Until then (V2 red note: "keep plays, remove others / pancake view vs claude view of the same
// example"): ONE app window over two pills, Pancake / Claude & Codex, that autoplay between:
//   · the Pancake view — redrawn on 2026-10-12 (founder brief: suggested Plays instead of the
//     three actions, shorter and more relevant copy, one fluid take with no cut): the home
//     (title, empty chat bar, three suggested Plays, the "Use Pancake with Claude or Codex"
//     chip), the request typed and sent, the Play card building itself row by row, the click on
//     "Deploy Play", the card going Live and its first leads. ONE GSAP timeline
//     (lp-demo-pancake-timeline.ts, lazy) over markup that is the REST picture (the home);
//   · the Claude & Codex view — redrawn on 2026-10-13: the same request and the same logic in
//     Claude's own interface, as the launch film drew it (the Pancake connector chip in the
//     composer, one card per tool call under the Pancake mark, the Play, Claude's permission
//     prompt, Live). Its own GSAP timeline (lp-demo-claude-timeline.ts, lazy).
// It replaces LpDemoTour (the /for demo's four tabs). The /for pages keep VxDemo untouched.
//
// Layout (demo.css): everything in a view is placed against the window (--ck-* coordinates). A
// direct <section> child of main.lp: the agents view hides it with every human section
// (audience.css). Class block `lp-demowin` (`lp-demo` is /demo's <main>).
//
// Phones (≤767): the SAME markup in the mobile artboard's portrait card (5024:9506), a fixed
// design box scaled as pixels, every view under the pills as on desktop (PHONE_SOLO false).
//
// Accessibility: the mock is one role="img" per view with a sentence label. The stage is
// data-nosnippet (the mock's text is not quotable); the sr-only summary says what it shows.

import { HOME_DEMO } from "@/lib/verticals/home-demo";
import { VX_DEMO } from "@/components/sections/verticals/vx-copy";
import { LpClaudeScene, type ClaudeScript } from "./LpClaudeScene";
import { LP_DEMO } from "./lp-demo-data";
import { LpDemoPlayer, type LpDemoViewDef } from "./LpDemoPlayer";

const P = LP_DEMO.pancake;
const C = LP_DEMO.claude;

/* ─── the agent apps' run ────────────────────────────────────────────────────── */

/** The run every agent app plays: the Pancake view's request and logic (research, leads, the
 *  Play, deploy) in the app's interface (LpClaudeScene). */
const CLAUDE_SCRIPT: ClaudeScript = {
  request: P.request,
  say: C.say,
  tools: C.tools,
  found: C.found,
  card: {
    kicker: P.play.kicker,
    title: P.play.name,
    before: P.play.draft,
    after: P.play.live,
    rows: [P.play.who, P.play.signal, P.play.pace],
  },
  ask: C.ask,
  action: C.deploy,
  done: C.done,
};

/* ─── section ──────────────────────────────────────────────────────────────── */

/** No JS: nothing will ever grow the card, so it is drawn at its full size (demo.css starts
 *  it at .94 on desktop and lp-demo-scroll.ts takes it to 1). */
const NOSCRIPT_CSS = "<style>.lp-demowin .lp-demowin__card{scale:none!important}</style>";

/** One view per agent app, in pill order: the same run in each app's interface. */
const VIEWS: LpDemoViewDef[] = LP_DEMO.agents.map((agent) => ({
  label: agent.label,
  kind: "agent",
  node: (
    <LpClaudeScene
      script={{ ...CLAUDE_SCRIPT, ask: { ...CLAUDE_SCRIPT.ask, lead: agent.ask } }}
      chrome={agent.chrome}
      label={agent.aria}
    />
  ),
}));

export function LpDemo() {
  return (
    <section className="lp-demowin" id="lp-demowin" aria-labelledby="lp-demowin-title">
      <h2 id="lp-demowin-title" className="lp-sr-only">
        {HOME_DEMO.demo.h2}
      </h2>
      <p className="lp-sr-only">{LP_DEMO.summary}</p>
      <LpDemoPlayer views={VIEWS} tablist={LP_DEMO.tablist} pause={VX_DEMO.controls.pause} />
      <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
    </section>
  );
}
