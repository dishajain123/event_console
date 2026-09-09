import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A new, additive component — the "page title + short description +
 * right-aligned primary actions" row that sits below the global
 * [Header] (which shows the section title and the account menu).
 * Encodes the brief's Page Header -> Actions/Filters -> Content
 * hierarchy as one reusable block instead of every page hand-rolling
 * its own flex row. `actions` is typically one or two [Button]s;
 * `meta` is for a small trailing detail (e.g. "Updated 2 minutes ago").
 */
export function PageToolbar({
  title,
  description,
  actions,
  meta,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  if (!title && !description && !actions && !meta) return null;
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {title && <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>}
        {description && <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {meta && <span className="text-xs text-[var(--foreground-subtle)]">{meta}</span>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}