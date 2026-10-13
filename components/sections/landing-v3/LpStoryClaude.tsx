import { LpClaudeScene } from "./LpClaudeScene";
import { LP_DEMO } from "./lp-demo-data";
import type { DiveStageProps } from "./lp-dive-stages";
import { STORY_CLAUDE } from "./lp-story-claude-data";

/**
 * Deep-dive story "Run it from Claude or Codex" — the stage. Contract: lp-dive-stages.ts
 * (server-safe, one root with data-lp-story="claude" + aria-hidden, rest markup = the END
 * picture, paints nothing behind the scene).
 *
 * Since 2026-10-13 it is the shared Claude scene (LpClaudeScene: the demo window's Claude
 * interface) with this story's own script, drawn at the stage's size: the scene is a 860 × 559
 * box (645 × 839 on phones) scaled as pixels to the 752 × 489 scene box (story-claude.css). The
 * `.lp-demowin` wrapper is what scopes the scene's stylesheet (demo.css: icons, faces, the
 * Claude palette); `--embed` takes the demo section's own spacing off it.
 * `rest="end"`: the markup shows the last picture; the builder (lp-story-claude-timeline.ts)
 * switches it to the home layout to measure and to play.
 */
export function LpStoryClaudeStage(_props: DiveStageProps) {
  return (
    <div data-lp-story="claude" className="lp-sc" aria-hidden="true">
      <div className="lp-demowin lp-demowin--embed">
        <div className="lp-demowin__view--claude lp-sc-view">
          <LpClaudeScene script={STORY_CLAUDE} chrome={LP_DEMO.claude} rest="end" />
        </div>
      </div>
    </div>
  );
}
