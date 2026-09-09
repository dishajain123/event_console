"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "@/components/ui/popover";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * A new, additive component — a simple action menu (row "more" menus,
 * the header user menu, any future overflow menu) built on the
 * viewport-aware [Popover], so it inherits the flip/clamp/portal
 * behavior for free instead of every call site reimplementing its own
 * `absolute` positioning. Manages its own open state (controlled
 * against Popover) purely so selecting an item can close the menu —
 * Popover itself stays a generic, stateless-by-default primitive.
 */
export function DropdownMenu({
  trigger,
  items,
  align = "end",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      align={align}
      open={open}
      onOpenChange={setOpen}
      renderTrigger={trigger}
      panelClassName="py-1"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              setOpen(false);
              item.onClick();
            }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              item.danger
                ? "text-[var(--danger)] hover:bg-red-50"
                : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
            )}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </Popover>
  );
}