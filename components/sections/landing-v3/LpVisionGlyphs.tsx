import type { VisionProblemId } from "./lp-vision-data";

/**
 * One small drawing per hard problem (the vision homepage, 2026-11-09): hairlines for what a team
 * has today, one filled dot for what Pancake keeps. No "use client": the server sections and the
 * problems' list (a client component) both draw with it. Stroke and fill come from vision.css
 * (--lp-vg-line, --lp-vg-tone).
 */
export function VisionProblemGlyph({ id }: { id: VisionProblemId }) {
  const common = { viewBox: "0 0 160 96", focusable: false } as const;
  switch (id) {
    case "sources":
      return (
        <svg {...common}>
          {[18, 38, 58, 78].map((y) => (
            <g key={y}>
              <path d={`M26 ${y}C78 ${y} 82 48 122 48`} />
              <circle cx="20" cy={y} r="6" />
            </g>
          ))}
          <circle className="on" cx="132" cy="48" r="10" />
        </svg>
      );
    case "dedup":
      return (
        <svg {...common}>
          <circle cx="34" cy="48" r="18" />
          <circle cx="52" cy="48" r="18" />
          <circle cx="70" cy="48" r="18" />
          <path d="M92 48H116" />
          <circle className="on" cx="132" cy="48" r="10" />
        </svg>
      );
    case "matching":
      return (
        <svg {...common}>
          <rect x="18" y="30" width="36" height="36" rx="8" />
          <path d="M54 48C82 48 86 76 112 76" />
          <path d="M122 66V58M122 38V30" />
          <circle cx="122" cy="20" r="8" />
          <circle cx="122" cy="48" r="8" />
          <circle className="on" cx="122" cy="76" r="10" />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path d="M16 48H144" />
          {[28, 56, 84].map((x) => (
            <circle key={x} cx={x} cy="48" r="6" className="dot" />
          ))}
          <path d="M28 40V30M56 40V30M84 40V30M124 36V26" />
          <circle className="on" cx="124" cy="48" r="10" />
        </svg>
      );
    case "lineage":
      return (
        <svg {...common}>
          <rect x="16" y="46" width="36" height="36" rx="8" />
          <rect x="108" y="46" width="36" height="36" rx="8" />
          <path d="M34 40C34 4 126 4 126 36" />
          <circle cx="34" cy="64" r="7" />
          <circle className="on" cx="126" cy="64" r="9" />
        </svg>
      );
    case "crossing":
      return (
        <svg {...common}>
          <path d="M26 22C60 22 70 48 80 48M26 74C60 74 70 48 80 48" />
          <path d="M134 22C100 22 90 48 80 48M134 74C100 74 90 48 80 48" />
          <circle cx="20" cy="22" r="6" />
          <circle cx="20" cy="74" r="6" />
          <circle cx="140" cy="22" r="6" />
          <circle cx="140" cy="74" r="6" />
          <circle className="on" cx="80" cy="48" r="10" />
        </svg>
      );
  }
}
