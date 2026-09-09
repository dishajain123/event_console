"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

/**
 * A new, additive tabs component. Controlled — the caller owns which
 * tab is active — so it can be driven by local `useState`, a URL
 * search param, or anything else a page already uses. `count` is
 * optional, for tabs like "Sponsor Inquiries (4)".
 */
export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 border-b border-[var(--border)]", className)} role="tablist">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              "focus-ring relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "text-[var(--accent-strong)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]" : "bg-black/[0.05] text-[var(--foreground-subtle)]",
                )}
              >
                {item.count}
              </span>
            )}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ active, tabKey, children }: { active: string; tabKey: string; children: ReactNode }) {
  if (active !== tabKey) return null;
  return <div className="fade-in">{children}</div>;
}