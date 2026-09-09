import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A new, additive filter-bar wrapper. Every filter row in the console
 * (Events, Categories, Accounts, Reports, ...) can adopt this instead
 * of a bare `<div className="flex flex-wrap items-center gap-3">`, and
 * it gives every one of them the same "Reset filters" affordance for
 * free — `onReset` is only rendered when `isFiltered` is true, so nothing
 * shows up as a distracting no-op button when no filter is active.
 */
export function FilterBar({
  children,
  onReset,
  isFiltered,
  className,
}: {
  children: ReactNode;
  onReset?: () => void;
  isFiltered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-2.5", className)}>
      {children}
      {onReset && isFiltered && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset filters
        </Button>
      )}
    </div>
  );
}