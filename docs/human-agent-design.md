# Human / agent toggle foundation

Scope reset by Tristan on September 4, 2026: keep the existing landing, add a toggle above the headline’s right edge, and prepare an agent page containing the hero in inverse colors with one empty viewport below. The agent headline and terminal-style setup CTA were subsequently added at Tristan’s request. The formerly empty section now contains a simulated terminal and a deliberately impossible CAPTCHA playground.

## Implemented

- Human mode is the original v3 landing (baseline `14ad159`) with only the audience selector added.
- The selector uses the [Figma Signals switch](https://www.figma.com/design/fr8NgOCTUxsEbrMEJA3YKu/Pancake-Design?node-id=4389-781): a 40×24 track, 20×20 white thumb and 2px inset. Per Tristan’s follow-up, human mode uses the human rainbow’s blue (`--lp-blue-40`) and agent mode its green (`--lp-green-20`). The artwork sits within a 44×44 keyboard-accessible button.
- Agent mode reads “> get gtm superpowers” on one line in Aeonik Fono, matching the setup terminal (founder 2026-09-07: the agent is the reader and the one who gets stronger; the earlier “give your human gtm superpowers” made the human the beneficiary). Cream text types from a green insertion bar word by word, a short pause at each space, over 1.6 seconds, after the 240ms audience crossfade; the cursor then keeps blinking with a 700ms cycle, like a terminal. Human mode retains its original two-line Aeonik Condensed headline. Both layers share the original headline box so the toggle and adjacent content stay fixed. The complete active heading is always available to assistive technology; the animated duplicate is decorative. Reduced motion displays the full line and a solid cursor immediately.
- Agent mode replaces the hero description and buttons with a copyable “Run `curl -fsSL https://getpancake.ai/install.md`, then follow the instructions” prompt, and a “friends with” row above the terminal, aligned to the terminal’s inner content edge, showing clean white Claude, Codex, Cursor, Hermes and OpenClaw marks, matching the founder’s five-logo reference. The install URL is supplied by the founder. Codex Browser blocked rendering that Markdown URL, so its contents were not independently verified in this change. The “Start here” label was removed at the founder’s request. The terminal itself is vertically centered on the H1 on desktop, while keeping the original CTA column’s horizontal alignment. The logo row sits 12px above the terminal (before the existing short-window scaling). The terminal uses a pure black background, cream Fono text with no dollar prefix; its copy button confirms success with a checkmark and a screen-reader announcement, and offers manual selection if clipboard access fails.
- Agent mode keeps the original navigation and rainbow motion. Cream and plum exchange roles; each of the five rainbow bands uses its exact RGB negative.
- The agent hero and navigation fill the first viewport, keeping the playground out of view until scrolling. Tall screens no longer use the human hero’s height cap; tablet content stays bottom-aligned, and existing short-screen readability floors remain. Human layout is unchanged.
- An agent-only playground follows the hero, filling at least one viewport. An uninterrupted black background continuously displays illustrative GTM pseudocode, with no top or bottom terminal bars. A compact CAPTCHA overlays it: blue header, “Prove you’re not human” and “Turn every tile green.” each on one line, a square 3×3 tile grid, and a small reset/info/Verify footer. The title uses one uniform font size throughout.
- Each move flips two tiles. Starting with six green tiles preserves even parity, so nine green is unreachable. Paired hover/focus outlines make the two-tile behavior visible; Verify responds “Human detected.” and Info reveals “No solution.” The puzzle does not gate any navigation or setup action.
- The terminal uses Cheng Lou’s Pretext to lay text into available line segments around a circular pointer exclusion. Font measurements are cached; one canvas and a finite recycled source keep memory bounded. It pauses offscreen, in a hidden tab, in human mode, or through the pause control in the CAPTCHA footer. Reduced motion renders a static frame with no cursor avoidance. Touch scrolling remains native.
- `/?audience=agents` opens the inverse hero directly. The toggle updates the URL without remounting the hero; refresh and browser history retain the selected view.
- Audience changes use a quick 240ms page crossfade, including the rainbow. The switch is excluded from that fade and keeps its ordinary thumb slide. Active canvas renderers repaint the new palette synchronously, eliminating the previous capture wait while preserving their clocks. Reduced motion and browsers without this API switch immediately; there is no entrance animation on initial loading.
- Hidden original sections remain mounted so their fit and motion observers survive the return to human mode.
- Both canvas renderers follow all six rings’ new colors without restarting the animation clock. Reduced motion uses the same palette through the original static SVG.
- Original signup, scheduling and analytics contracts are unchanged. Added `@chenglou/pretext` pinned to `0.0.8`, flagged before installation.

## Validation

- Codex Browser found identical original human text/link records and desktop layout measurements at 1280×720.
- Human hero typography, text and desktop geometry remain identical to the prior preview; the agent setup block preserves the original human description/buttons column’s horizontal bounds. Its terminal centers on the headline on desktop and remains stacked below it on phones. The original column remains in layout but is hidden visually and from assistive technology in agent mode, keeping the headline fixed through the toggle.
- Original human layout comparisons passed at 320×740, 393×852 and 768×1024; the selector stays inside the phone viewport.
- Agent mode exposes the hero and the terminal playground. Human mode hides the playground and preserves the original sections.
- Direct agent URL, keyboard switching, back/forward, reduced motion, inverse mobile menu and the existing booking dialog were checked. The live WebGL renderer and forced phone Canvas fallback both retained the correct palette through audience changes.
- Terminal CTA checked at 320×740, 393×852, 1025×768 and 1280×720. Clipboard copying and keyboard activation succeed; human hero text and desktop geometry match the previous preview.
- Independent code review confirmed the reduced scope and original component parity.
- The crossfade was measured at 240ms in both directions on desktop and phone. Heading geometry, scroll position and canvas instances remained unchanged. Three rapid toggles, Back/Forward and reduced-motion switching passed without errors.
- Removing the capture wait reduced measured desktop click-to-fade onset from about 95–100ms to 20–30ms. Only the page snapshot fades; the named switch snapshot has no fade animation.

Preview: https://pancake-pozge9pl4-getpancake.vercel.app

The setup CTA borrows the single copyable instruction pattern from [Monid](https://monid.ai/), adapted to Pancake’s existing typography, colors and geometry. Other reference screenshots are historical research from the broader concept.

Logo sources: Claude and Codex use the existing React Icons marks; Cursor and OpenClaw match the SVG marks in the supplied Monid reference. Hermes uses the [official NousResearch portrait](https://github.com/NousResearch/hermes-agent/blob/main/website/static/img/logo.png), rendered in white through an SVG alpha mask, with its source-image border removed and paper background transparent. Next Image supplies the optimized portrait; the mask is inset beyond the source frame to exclude resize bleed at small icon sizes. The five-logo row follows the founder’s explicit direction; adding a mark does not represent a new installation test.

The agent headline borrows the insertion-cursor and character-step rhythm from [Hacker Typer](https://hackertyper.net/). It uses Pancake’s cream and rainbow green, with no extra terminal frame. The desktop headline uses a fixed 36.498px midpoint between the v3 33.18px and 39.816px tokens. Narrower layouts fit within the original headline width. The font size is known in CSS before hydration; typing starts only after font metrics settle, eliminating the initial size jump. Codex Browser verified the stepped reveal, complete text, rapid mode changes, stable human geometry and immediate reduced-motion rendering at 320px.

The headline and setup terminal share `--lp-font-fono`. Each letter reveals at its natural width so the cursor follows Fono’s proportional spacing; all 31 characters, three typing bursts and reduced-motion behavior were verified in Codex Browser.

Cold-load verification: the first visible frame through completion held exactly one font size and line height across 363 desktop frames (36.498px) and 363 phone frames (14.5332px at 320px). Human-mode geometry and reduced-motion rendering remained unchanged.

Alignment refinement: Codex Browser measured identical terminal/H1 vertical centers at 1280×720 and 1654×960, a 12px logo-row gap before scaling, and the unchanged human H1 bounds after switching back. Phone layout at 393×852 remains stacked with all five logos visible. The Hermes mark has no rectangular backing.

## Playground validation

- Exhaustive traversal of the puzzle finds 256 reachable boards, all with even green counts. Every move changes exactly two tiles and repeating it restores the board; nine green is unreachable.
- Codex Browser verified real Pretext reflow around the pointer (eight split rows), pause/resume, keyboard tile activation, paired focus feedback, reset, and Verify.
- At 320px, the card measures 288px wide; title and instruction each occupy one line, with no horizontal page overflow. Desktop placement and token-based colors remain consistent.
- Independent review checked keyboard semantics, persistent live announcements and isolation from human mode.
- Compiled-build checks confirmed the human H1’s original desktop bounds exactly, the playground hidden in human mode with its engine idle, and a static Pretext frame under reduced motion at 320px.
- Local and Vercel production builds pass. The new preview loads Pretext successfully and Verify returns the intended playful feedback. Existing unrelated image-lint and report-hook warnings remain.

The compact CAPTCHA follows the founder’s supplied classic CAPTCHA reference. The terminal uses the actual [Pretext library](https://github.com/chenglou/pretext), with readable HTML controls layered over a decorative canvas. The code is illustrative pseudocode, not advertised executable Pancake API methods.
