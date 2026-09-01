import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";

export function ComingSoonPage({
  title,
  phase,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  phase: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div>
      <Header title={title} />
      <GlassPanel className="fade-in flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
          <Icon className="h-7 w-7 text-[var(--accent-strong)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{phase}</p>
        <p className="max-w-md text-sm text-[var(--foreground-muted)]">{description}</p>
      </GlassPanel>
    </div>
  );
}
