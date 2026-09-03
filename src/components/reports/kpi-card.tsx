import type { LucideIcon } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

export function KPICard({
  label,
  value,
  icon: Icon,
  tone = "accent",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "accent" | "success" | "warning" | "info";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    neutral: "bg-slate-500/10 text-slate-600",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
  };

  return (
    <GlassPanel className="rise-in flex flex-col gap-4">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneClasses[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{label}</p>
        {hint && <p className="mt-1 text-xs text-[var(--foreground-subtle)]">{hint}</p>}
      </div>
    </GlassPanel>
  );
}
