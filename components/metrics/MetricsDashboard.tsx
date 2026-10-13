"use client";

// The kit stylesheet rides with the components that use it (2026-10-13): it left
// app/layout.tsx so routes without kit markup stop downloading its 98 KB.
import "@/app/_styles/components.css";
import { useMemo, useState } from "react";
import type { Metrics, Point } from "@/lib/metrics";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatPct(n: number): string {
  if (n >= 10) return `${Math.round(n)}%`;
  return `${n.toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  KPI card                                                           */
/* ------------------------------------------------------------------ */

type KpiCardProps = {
  label: string;
  value: string;
  sublabel?: string;
};

function KpiCard({ label, value, sublabel }: KpiCardProps) {
  return (
    <div className="metrics-card metrics-card--kpi">
      <p className="metrics-card__label">{label}</p>
      <p className="metrics-card__value">{value}</p>
      {sublabel ? <p className="metrics-card__sublabel">{sublabel}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers — axis ticks                                               */
/* ------------------------------------------------------------------ */

function niceMax(raw: number): number {
  if (raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 2.5) nice = 2.5;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * mag;
}

function yTicks(max: number, steps = 4): number[] {
  if (max <= 0) return [0, 1];
  const step = max / steps;
  const out: number[] = [];
  for (let i = 0; i <= steps; i++) out.push(Math.round(step * i));
  return Array.from(new Set(out));
}

/* A sparse set of x-axis labels that won't overlap on narrow screens. */
function xLabelIndexes(count: number, maxLabels: number): Set<number> {
  if (count <= maxLabels) return new Set(Array.from({ length: count }, (_, i) => i));
  const step = Math.ceil(count / maxLabels);
  const idx = new Set<number>();
  for (let i = 0; i < count; i += step) idx.add(i);
  idx.add(count - 1);
  return idx;
}

/* ------------------------------------------------------------------ */
/*  Cumulative chart — line + area                                     */
/* ------------------------------------------------------------------ */

type CumulativeChartProps = {
  signups: Point[];
  ambassadors: Point[];
};

const CHART_W = 1000;
const CHART_H = 360;
const PAD = { top: 28, right: 28, bottom: 48, left: 56 };

function CumulativeChart({ signups, ambassadors }: CumulativeChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = CHART_W - PAD.left - PAD.right;
  const height = CHART_H - PAD.top - PAD.bottom;
  const n = signups.length;

  const max = useMemo(() => {
    const rawMax = Math.max(
      1,
      ...signups.map((p) => p.value),
      ...ambassadors.map((p) => p.value),
    );
    return niceMax(rawMax);
  }, [signups, ambassadors]);

  const xAt = (i: number) => (n === 1 ? width / 2 : (i * width) / (n - 1));
  const yAt = (v: number) => height - (v / max) * height;

  const signupPath = signups.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.value).toFixed(2)}`).join(" ");
  const signupArea = `${signupPath} L ${xAt(n - 1).toFixed(2)} ${height} L 0 ${height} Z`;
  const ambassadorPath = ambassadors.map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(p.value).toFixed(2)}`).join(" ");
  const ambassadorArea = `${ambassadorPath} L ${xAt(n - 1).toFixed(2)} ${height} L 0 ${height} Z`;

  const ticks = yTicks(max, 4);
  const xLabels = xLabelIndexes(n, 8);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (n === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = CHART_W / rect.width;
    const xPx = (e.clientX - rect.left) * scale - PAD.left;
    const clamped = Math.max(0, Math.min(width, xPx));
    const idx = n === 1 ? 0 : Math.round((clamped / width) * (n - 1));
    setHoverIdx(idx);
  }

  const hover = hoverIdx !== null ? signups[hoverIdx] : null;
  const hoverAmb = hoverIdx !== null ? ambassadors[hoverIdx] : null;
  const hoverX = hoverIdx !== null ? xAt(hoverIdx) : 0;
  const hoverY = hover ? yAt(hover.value) : 0;

  return (
    <ChartFrame
      title="Cumulative signups"
      chip={signups.length ? formatNumber(signups[signups.length - 1].value) : "0"}
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          className="block h-auto w-full select-none"
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <g transform={`translate(${PAD.left} ${PAD.top})`}>
            {/* Horizontal gridlines + y labels */}
            {ticks.map((t) => {
              const y = yAt(t);
              return (
                <g key={`y-${t}`}>
                  <line
                    x1={0}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke="var(--text)"
                    strokeOpacity={0.12}
                    strokeDasharray="3 4"
                    strokeWidth={1}
                  />
                  <text
                    x={-10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-[var(--subtle-text)] font-mono text-[13px]"
                  >
                    {formatNumber(t)}
                  </text>
                </g>
              );
            })}

            {/* Areas + lines */}
            <path d={ambassadorArea} fill="var(--strong-branded-surface)" fillOpacity={0.18} />
            <path d={signupArea} fill="var(--strong-branded-surface)" fillOpacity={0.3} />
            <path
              d={ambassadorPath}
              fill="none"
              stroke="var(--strong-branded-surface)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={signupPath}
              fill="none"
              stroke="var(--text)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X-axis */}
            <line x1={0} x2={width} y1={height} y2={height} stroke="var(--text)" strokeWidth={1.5} />
            {signups.map((p, i) =>
              xLabels.has(i) ? (
                <text
                  key={`x-${p.date}`}
                  x={xAt(i)}
                  y={height + 26}
                  textAnchor="middle"
                  className="fill-[var(--subtle-text)] font-mono text-[12px] font-bold"
                >
                  {formatShortDate(p.date)}
                </text>
              ) : null,
            )}

            {/* Hover guide + dots */}
            {hover ? (
              <g pointerEvents="none">
                <line
                  x1={hoverX}
                  x2={hoverX}
                  y1={0}
                  y2={height}
                  stroke="var(--text)"
                  strokeOpacity={0.45}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {hoverAmb ? (
                  <circle
                    cx={hoverX}
                    cy={yAt(hoverAmb.value)}
                    r={5}
                    fill="var(--strong-branded-surface)"
                    stroke="var(--text)"
                    strokeWidth={2}
                  />
                ) : null}
                <circle
                  cx={hoverX}
                  cy={hoverY}
                  r={6}
                  fill="#ffffff"
                  stroke="var(--text)"
                  strokeWidth={2.5}
                />
              </g>
            ) : null}
          </g>
        </svg>

        {hover && hoverIdx !== null ? (
          <Tooltip
            leftPct={((PAD.left + hoverX) / CHART_W) * 100}
            date={hover.date}
            rows={[
              { label: "Signups", value: formatNumber(hover.value) },
              hoverAmb
                ? { label: "Ambassadors", value: formatNumber(hoverAmb.value), pink: true }
                : null,
            ].filter(Boolean) as TooltipRow[]}
          />
        ) : null}
      </div>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Daily chart — bars                                                 */
/* ------------------------------------------------------------------ */

type DailyChartProps = {
  signups: Point[];
};

const BAR_H = 280;
const BAR_PAD = { top: 24, right: 28, bottom: 48, left: 56 };

function DailyChart({ signups }: DailyChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = CHART_W - BAR_PAD.left - BAR_PAD.right;
  const height = BAR_H - BAR_PAD.top - BAR_PAD.bottom;
  const n = signups.length;
  const max = useMemo(() => niceMax(Math.max(1, ...signups.map((p) => p.value))), [signups]);

  const xStep = n === 0 ? 0 : width / n;
  const barWidth = xStep * 0.6;
  const xCenter = (i: number) => xStep * i + xStep / 2;
  const yAt = (v: number) => height - (v / max) * height;

  const ticks = yTicks(max, 4);
  const xLabels = xLabelIndexes(n, 8);

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (n === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = CHART_W / rect.width;
    const xPx = (e.clientX - rect.left) * scale - BAR_PAD.left;
    const idx = Math.max(0, Math.min(n - 1, Math.floor(xPx / xStep)));
    setHoverIdx(idx);
  }

  const hover = hoverIdx !== null ? signups[hoverIdx] : null;
  const hoverCx = hoverIdx !== null ? xCenter(hoverIdx) : 0;

  return (
    <ChartFrame title="Daily signups">
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART_W} ${BAR_H}`}
          className="block h-auto w-full select-none"
          preserveAspectRatio="none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <g transform={`translate(${BAR_PAD.left} ${BAR_PAD.top})`}>
            {/* Grid + y labels */}
            {ticks.map((t) => {
              const y = yAt(t);
              return (
                <g key={`y-${t}`}>
                  <line
                    x1={0}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke="var(--text)"
                    strokeOpacity={0.12}
                    strokeDasharray="3 4"
                    strokeWidth={1}
                  />
                  <text
                    x={-10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="central"
                    className="fill-[var(--subtle-text)] font-mono text-[13px]"
                  >
                    {formatNumber(t)}
                  </text>
                </g>
              );
            })}

            {/* Hover column highlight */}
            {hoverIdx !== null ? (
              <rect
                x={xStep * hoverIdx}
                y={0}
                width={xStep}
                height={height}
                fill="#0a0a0a"
                fillOpacity={0.05}
                pointerEvents="none"
              />
            ) : null}

            {/* Bars */}
            {signups.map((p, i) => {
              const bx = xCenter(i) - barWidth / 2;
              const by = yAt(p.value);
              const bh = height - by;
              if (bh <= 0) return null;
              return (
                <rect
                  key={`bar-${p.date}`}
                  x={bx}
                  y={by}
                  width={barWidth}
                  height={bh}
                  fill="var(--strong-branded-surface)"
                  stroke="var(--text)"
                  strokeWidth={1.5}
                />
              );
            })}

            {/* Axis */}
            <line x1={0} x2={width} y1={height} y2={height} stroke="var(--text)" strokeWidth={1.5} />
            {signups.map((p, i) =>
              xLabels.has(i) ? (
                <text
                  key={`x-${p.date}`}
                  x={xCenter(i)}
                  y={height + 26}
                  textAnchor="middle"
                  className="fill-[var(--subtle-text)] font-mono text-[12px] font-bold"
                >
                  {formatShortDate(p.date)}
                </text>
              ) : null,
            )}
          </g>
        </svg>

        {hover && hoverIdx !== null ? (
          <Tooltip
            leftPct={((BAR_PAD.left + hoverCx) / CHART_W) * 100}
            date={hover.date}
            rows={[{ label: "Signups", value: formatNumber(hover.value) }]}
          />
        ) : null}
      </div>
    </ChartFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart frame + tooltip                                              */
/* ------------------------------------------------------------------ */

function ChartFrame({
  title,
  chip,
  children,
}: {
  title: string;
  chip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="metrics-card metrics-card--chart">
      <div className="metrics-card__chart-header">
        <p className="metrics-card__label">{title}</p>
        {chip ? (
          <span className="metrics-card__chip" aria-hidden>
            {chip}
          </span>
        ) : null}
      </div>
      <div className="metrics-card__chart-body">{children}</div>
    </div>
  );
}

type TooltipRow = { label: string; value: string; pink?: boolean };

function Tooltip({
  leftPct,
  date,
  rows,
}: {
  leftPct: number;
  date: string;
  rows: TooltipRow[];
}) {
  const clamped = Math.max(8, Math.min(92, leftPct));
  return (
    <div className="metrics-tooltip" style={{ left: `${clamped}%` }}>
      <p className="metrics-tooltip__date">{formatShortDate(date)}</p>
      {rows.map((row) => (
        <p
          key={row.label}
          className={`metrics-tooltip__row${row.pink ? " metrics-tooltip__row--pink" : ""}`}
        >
          {row.label}: <span className="metrics-tooltip__row-value">{row.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top-level dashboard                                                */
/* ------------------------------------------------------------------ */

type Props = {
  metrics: Metrics;
};

export function MetricsDashboard({ metrics }: Props) {
  return (
    <div className="metrics-dashboard">
      <div className="metrics-dashboard__kpis">
        <KpiCard
          label="Total signups"
          value={formatNumber(metrics.totalSignups)}
          sublabel={[
            `+${metrics.todaySignups} today`,
            metrics.bucketedWithCreatedTime > 0
              ? `${formatNumber(metrics.bucketedWithCreatedTime)} used record created time (no Signup Date)`
              : null,
            metrics.signupsWithoutDate > 0
              ? `Warning: ${formatNumber(metrics.signupsWithoutDate)} row(s) could not be dated`
              : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <KpiCard
          label="Ambassadors"
          value={formatNumber(metrics.ambassadors)}
          sublabel="users who referred others"
        />
        <KpiCard
          label="Invites sent"
          value={formatNumber(metrics.invitesSent)}
          sublabel="total referrals from waitlist"
        />
        <KpiCard
          label="Conversion"
          value={formatPct(metrics.conversionPct)}
          sublabel="signup → ambassador"
        />
      </div>

      <div className="metrics-dashboard__charts">
        <CumulativeChart
          signups={metrics.cumulativeSignups}
          ambassadors={metrics.cumulativeAmbassadors}
        />
        <DailyChart signups={metrics.dailySignups} />
      </div>
    </div>
  );
}
