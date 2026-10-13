// No "use client" on purpose: reached only through DIVE_LOADERS.claude (lp-dive-loaders.ts), so
// it stays a lazy chunk of the carousel / harness import(). Browser-only code runs inside
// build() alone.
import { buildDemoClaudeSteps } from "./lp-demo-claude-timeline";
import type { BuiltStory } from "./lp-dive-stages";

/**
 * Deep-dive story "Run it from Claude or Codex" — its build-up. Since 2026-10-13 the story is
 * the shared Claude scene (LpClaudeScene) with its own script, so its timeline is the demo
 * window's (lp-demo-claude-timeline.ts: type, send, tool calls, the result card, the permission
 * prompt, the allowed call, Claude's last line), built on the story's own box.
 *
 * The stage rests on its END picture (`data-rest="end"`, drawn by demo.css). The builder needs
 * the HOME layout (it measures the request's glyphs, the cards that fold away, the cursor's
 * target): the attribute is taken off before it builds and put back by cleanup(), after the
 * caller has reverted its gsap.context. In between, the timeline owns the picture: its last
 * frame is the same picture as the END markup, its first (`cue: 0`) is Claude's home with the
 * composer empty, a composed scene.
 *
 * In slices (2026-10-13): `buildStoryClaudeSteps` hands on the demo builder's own slices
 * (lp-demo-claude-timeline.ts); `buildStoryClaude` runs them to the end in one go.
 */
export function buildStoryClaude(root: HTMLElement): BuiltStory {
  const steps = buildStoryClaudeSteps(root);
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

export function* buildStoryClaudeSteps(root: HTMLElement): Generator<void, BuiltStory, void> {
  const view = root.querySelector<HTMLElement>(".lp-sc-view");
  const win = root.querySelector<HTMLElement>(".lp-demowin__cwin");
  if (!view || !win) throw new Error("story-claude: the scene is missing");
  win.removeAttribute("data-rest");
  const slices = buildDemoClaudeSteps(view);
  let slice = slices.next();
  while (!slice.done) {
    yield;
    slice = slices.next();
  }
  const built = slice.value;
  return {
    tl: built.tl,
    cue: 0,
    cleanup: () => {
      built.cleanup();
      win.setAttribute("data-rest", "end");
    },
  };
}
