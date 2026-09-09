import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

/**
 * Public API unchanged (label/value/icon/tone/hint) — every existing
 * `<KPICard .../>` call site (Dashboard's 10-card grid, and any Reports
 * usage) keeps compiling and rendering. Layout is now compact and
 * horizontal instead of stacked-with-a-big-icon-box, so 5 fit per row
 * on a standard desktop viewport instead of 4. `trend` is new and
 * optional — omit it and the card renders exactly as before, just
 * smaller.
 */
export function KPICard({
  label,
  value,
  icon: Icon,
  tone = "accent",
  hint,
  trend,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "success" | "warning" | "info";
  hint?: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-slate-500/10 text-slate-600",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
  };

  const trendClasses: Record<string, string> = {
    up: "text-[var(--success)]",
    down: "text-[var(--danger)]",
    flat: "text-[var(--foreground-subtle)]",
  };
  const TrendIcon = trend?.direction === "up" ? ArrowUp : trend?.direction === "down" ? ArrowDown : Minus;

  return (
    <GlassPanel padded={false} className="fade-in flex items-start gap-3 p-3.5">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]", toneClasses[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[var(--foreground-muted)]">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <p className="text-xl font-semibold leading-none tracking-tight text-[var(--foreground)]">{value}</p>
          {trend && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendClasses[trend.direction])}>
              <TrendIcon className="h-3 w-3" />
              {trend.label}
            </span>
          )}
        </div>
        {hint && <p className="mt-1 truncate text-xs text-[var(--foreground-subtle)]">{hint}</p>}
      </div>
    </GlassPanel>
  );
}