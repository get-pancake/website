import { SiClaude, SiOpenai } from "react-icons/si";
import type { AgentName } from "./ag-copy";

/**
 * The five agent marks of the /agents page, in the draft's order: Claude,
 * Codex, OpenClaw, Grok Bot, Hermes — monochrome plum on the cream page.
 * Claude/Codex reuse the homepage's react-icons marks; OpenClaw is the
 * draft's own drawing (its eyes are page-cream with plum pupils — the
 * homepage's OpenClawMark was drawn for the inverted plum hero and its eyes
 * would vanish on cream); Grok Bot is the draft's vector; Hermes is the
 * draft's "H" wordmark (a 96px raster, /lp/agents/hermes.png — the
 * homepage's HermesMark is a portrait mask, a different logo).
 */

export function ClaudeMark() {
  return <SiClaude role="img" aria-label="Claude" focusable="false" />;
}

export function CodexMark() {
  return <SiOpenai role="img" aria-label="Codex" focusable="false" />;
}

export function OpenClawCreamMark() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="OpenClaw" focusable="false">
      <path
        fill="currentColor"
        d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z"
      />
      <path fill="currentColor" d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" />
      <path fill="currentColor" d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" />
      <path d="M45 15 Q35 5 30 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M75 15 Q85 5 90 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="45" cy="35" r="6" fill="var(--lp-page-bg)" />
      <circle cx="75" cy="35" r="6" fill="var(--lp-page-bg)" />
      <circle cx="46" cy="34" r="2.5" fill="currentColor" />
      <circle cx="76" cy="34" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function GrokBotMark() {
  return (
    <svg viewBox="0 0 512 509.641" role="img" aria-label="Grok Bot" focusable="false" fillRule="evenodd" clipRule="evenodd">
      <path
        fill="currentColor"
        d="M213.235 306.019l178.976-180.002v.169l51.695-51.763c-.924 1.32-1.86 2.605-2.785 3.89-39.281 54.164-58.46 80.649-43.07 146.922l-.09-.101c10.61 45.11-.744 95.137-37.398 131.836-46.216 46.306-120.167 56.611-181.063 14.928l42.462-19.675c38.863 15.278 81.392 8.57 111.947-22.03 30.566-30.6 37.432-75.159 22.065-112.252-2.92-7.025-11.67-8.795-17.792-4.263l-124.947 92.341zm-25.786 22.437l-.033.034L68.094 435.217c7.565-10.429 16.957-20.294 26.327-30.149 26.428-27.803 52.653-55.359 36.654-94.302-21.422-52.112-8.952-113.177 30.724-152.898 41.243-41.254 101.98-51.661 152.706-30.758 11.23 4.172 21.016 10.114 28.638 15.639l-42.359 19.584c-39.44-16.563-84.629-5.299-112.207 22.313-37.298 37.308-44.84 102.003-1.128 143.81z"
      />
    </svg>
  );
}

export function HermesMark() {
  return <img src="/lp/agents/hermes.png" alt="" role="img" aria-label="Hermes" width={96} height={96} />;
}

export const AGENT_MARKS: { name: AgentName; Mark: () => JSX.Element }[] = [
  { name: "Claude", Mark: ClaudeMark },
  { name: "Codex", Mark: CodexMark },
  { name: "OpenClaw", Mark: OpenClawCreamMark },
  { name: "Grok Bot", Mark: GrokBotMark },
  { name: "Hermes", Mark: HermesMark },
];

/** Inline row of the five marks (e.g. hero "Give this to your agent", the
    "Works with" strip). Sized by the parent's `.ag-marks` CSS. */
export function AgMarksRow({ className }: { className?: string }) {
  return (
    <ul className={className ? `ag-marks ${className}` : "ag-marks"} aria-label="Agents">
      {AGENT_MARKS.map(({ name, Mark }) => (
        <li key={name} title={name}>
          <Mark />
        </li>
      ))}
    </ul>
  );
}
