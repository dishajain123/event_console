import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * A new, additive set of table primitives. Several pages currently
 * hand-roll `<table>`/`<thead>`/`<tr>`/`<th>` markup with the same
 * classes repeated at every call site (see ops/events/page.tsx). These
 * wrap the same native elements with one consistent set of classes, so
 * a page can adopt them incrementally — each one renders the exact
 * native DOM element it wraps, nothing more, so existing table logic
 * (sorting, row click handlers, conditional cells) moves over as-is.
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-b border-[var(--border)]", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-[var(--border)]", className)} {...props} />;
}

export function TableRow({
  className,
  clickable,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }) {
  return (
    <tr
      className={cn(clickable && "cursor-pointer transition-colors hover:bg-black/[0.02]", className)}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle text-[var(--foreground)]", className)} {...props} />;
}

/** Convenience wrapper matching the `<GlassPanel padded={false}>` shell every table page already uses. */
export function TableContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}