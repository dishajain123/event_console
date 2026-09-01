import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="fade-in flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-slate-300/60 bg-white/30 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
        <Icon className="h-6 w-6 text-[var(--accent-strong)]" />
      </div>
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--foreground-muted)]">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="fade-in flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-red-200/60 bg-red-50/50 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-soft)]">
        <AlertTriangle className="h-6 w-6 text-[var(--danger)]" />
      </div>
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--foreground-muted)]">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}
