import { cn } from "@/lib/utils";

/** Public API unchanged for all three exports. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-sm)] bg-black/[0.06]",
        className,
      )}
    />
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-8 flex-1", c === 0 && "max-w-[160px]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel space-y-2.5 p-4">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}