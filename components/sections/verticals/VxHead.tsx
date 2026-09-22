import type { ReactNode } from "react";

/**
 * The one section-head pattern of the /for template (spec §1.3): eyebrow
 * (Fono caps + a pink bar running to the right text edge), then the hero's
 * own split — headline left, lede in the hero-lede column (368px) right,
 * bottoms aligned. Every eyebrow, H2 and lede starts at --vx-edge, the hero
 * H1's left edge at each width.
 *
 * `eyebrow` may be a node (VxRelated passes its breadcrumb <nav>, styled the
 * same); `as="h1"` is the hub's head (the H1 at H2 scale, §3).
 */
export function VxHead({
  id,
  eyebrow,
  title,
  lede,
  as: Tag = "h2",
}: {
  id: string;
  eyebrow: ReactNode;
  title: string;
  lede?: string;
  as?: "h1" | "h2";
}) {
  return (
    <>
      {typeof eyebrow === "string" ? <p className="vx-eyebrow">{eyebrow}</p> : eyebrow}
      <div className={`vx-head${lede ? "" : " vx-head--solo"}`}>
        <Tag id={id} className="vx-h2 lp-display">
          {title}
        </Tag>
        {lede ? <p className="vx-lede">{lede}</p> : null}
      </div>
    </>
  );
}
