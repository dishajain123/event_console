"use client";

import { useMemo, useState } from "react";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  points: { date: string; count: number }[];
}

/**
 * Dependency-free inline SVG line chart. One shared component so every
 * "activity over time" panel across event report screens gets the same
 * marks (2px lines, >=8px end markers with a surface ring, hairline
 * recessive gridlines) and the same hover crosshair + tooltip, instead of
 * each screen inventing its own rendering (or, as before, dumping raw
 * counts as a wall of text chips).
 */
export function MiniLineChart({ series, height = 220 }: { series: ChartSeries[]; height?: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 900;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const dates = series[0]?.points.map((p) => p.date) ?? [];
  const maxValue = useMemo(() => {
    const max = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.count)));
    return max;
  }, [series]);

  function x(index: number) {
    if (dates.length <= 1) return padding.left;
    return padding.left + (index / (dates.length - 1)) * plotWidth;
  }
  function y(value: number) {
    return padding.top + plotHeight - (value / maxValue) * plotHeight;
  }

  const yTicks = [0, 0.5, 1].map((t) => Math.round(maxValue * t));
  const labelStep = Math.max(1, Math.ceil(dates.length / 6));

  if (dates.length === 0) {
    return <p className="text-sm text-[var(--foreground-muted)]">No activity recorded in this range.</p>;
  }

  return (
    <div>
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-4">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Line chart of ${series.map((s) => s.label).join(", ")} over time`}
        onMouseLeave={() => setHoverIndex(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * width;
          const ratio = (relX - padding.left) / plotWidth;
          const index = Math.round(ratio * (dates.length - 1));
          setHoverIndex(Math.min(Math.max(index, 0), dates.length - 1));
        }}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={padding.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" className="fill-[var(--foreground-subtle)] text-[10px]">
              {tick}
            </text>
          </g>
        ))}

        {dates.map((date, i) =>
          i % labelStep === 0 || i === dates.length - 1 ? (
            <text
              key={date}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-[var(--foreground-subtle)] text-[10px]"
            >
              {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </text>
          ) : null,
        )}

        {series.map((s) => {
          const path = s.points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.count)}`).join(" ");
          return <path key={s.key} d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        })}

        {series.map((s) => {
          const last = s.points[s.points.length - 1];
          if (!last) return null;
          return (
            <circle key={`${s.key}-end`} cx={x(s.points.length - 1)} cy={y(last.count)} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
          );
        })}

        {hoverIndex !== null && (
          <>
            <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={padding.top} y2={height - padding.bottom} stroke="var(--border-strong)" strokeWidth={1} />
            {series.map((s) => (
              <circle
                key={`${s.key}-hover`}
                cx={x(hoverIndex)}
                cy={y(s.points[hoverIndex]?.count ?? 0)}
                r={4}
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ))}
          </>
        )}
      </svg>
      {hoverIndex !== null && (
        <div className="mt-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs">
          <p className="mb-1 font-medium text-[var(--foreground)]">
            {new Date(dates[hoverIndex]).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-[var(--foreground-muted)]">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}: <strong className="text-[var(--foreground)]">{s.points[hoverIndex]?.count ?? 0}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
