import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A new, additive pagination control. Several pages already implement
 * page/offset state themselves (audit log, transactions, registrations,
 * etc.) with their own hand-rolled Previous/Next buttons — this
 * doesn't change any of that state logic, it's just the shared render
 * for "page X of Y, N total" plus Previous/Next, driven by whatever
 * `page`/`totalPages` a page already computes.
 */
export function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] px-4 py-3 text-sm">
      <p className="text-[var(--foreground-muted)]">
        {totalItems !== undefined ? (
          <>
            {totalItems} total · page {page} of {totalPages}
          </>
        ) : (
          <>
            Page {page} of {totalPages}
          </>
        )}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}