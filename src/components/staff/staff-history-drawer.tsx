"use client";

import { X, History } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/shared/skeleton";
import { useStaffAssignmentHistory } from "@/hooks/useStaff";
import type { StaffAssignmentOut } from "@/types/staff";

export function StaffHistoryDrawer({
  eventId,
  assignment,
  onClose,
}: {
  eventId: string;
  assignment: StaffAssignmentOut;
  onClose: () => void;
}) {
  const { data: history, isLoading } = useStaffAssignmentHistory(eventId, assignment.id);

  return (
    <div className="fade-in fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel
        strong
        padded={false}
        className="rise-in relative z-10 flex h-full w-full max-w-md flex-col rounded-none rounded-l-[var(--radius-lg)] p-0"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {assignment.full_name || assignment.invitee_mobile}
            </p>
            <p className="text-xs capitalize text-[var(--foreground-muted)]">{assignment.role_label}</p>
          </div>
          <button onClick={onClose} className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
            <History className="h-3.5 w-3.5" />
            History
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : !history || history.length === 0 ? (
            <p className="text-sm text-[var(--foreground-muted)]">No history yet.</p>
          ) : (
            <ol className="relative space-y-5 border-l border-black/[0.08] pl-5">
              {history.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
                  <p className="text-sm font-medium capitalize text-[var(--foreground)]">
                    {entry.action.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                  {entry.notes && (
                    <p className="mt-1 rounded-[var(--radius-sm)] bg-black/[0.03] p-2 text-xs text-[var(--foreground-muted)]">
                      {entry.notes}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
