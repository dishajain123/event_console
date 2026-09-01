"use client";

import { X, History, ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Skeleton } from "@/components/shared/skeleton";
import { useEntityHistory } from "@/hooks/useAuditLog";
import type { AuditLogOut } from "@/types/auditLog";

function ValueBlock({ label, value }: { label: string; value: Record<string, unknown> | null }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
        {label}
      </p>
      {value === null ? (
        <p className="text-sm text-[var(--foreground-subtle)]">—</p>
      ) : (
        <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-black/[0.03] p-3 text-xs text-[var(--foreground-muted)]">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function AuditLogDetailDrawer({ entry, onClose }: { entry: AuditLogOut; onClose: () => void }) {
  const { data: history, isLoading } = useEntityHistory(entry.entity_type, entry.entity_id);

  return (
    <div className="fade-in fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" onClick={onClose} />
      <GlassPanel
        strong
        padded={false}
        className="rise-in relative z-10 flex h-full w-full max-w-lg flex-col rounded-none rounded-l-[var(--radius-lg)] p-0"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div>
            <p className="text-sm font-semibold capitalize text-[var(--foreground)]">
              {entry.entity_type.replace(/_/g, " ")} · {entry.action.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-[var(--foreground-muted)]">{new Date(entry.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              Entity ID
            </p>
            <p className="break-all font-mono text-xs text-[var(--foreground)]">{entry.entity_id}</p>
          </div>

          {entry.actor_user_id && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
                Actor
              </p>
              <p className="break-all font-mono text-xs text-[var(--foreground)]">{entry.actor_user_id}</p>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="flex-1">
              <ValueBlock label="Before" value={entry.before_value} />
            </div>
            <ArrowRight className="mt-6 h-4 w-4 shrink-0 text-[var(--foreground-subtle)]" />
            <div className="flex-1">
              <ValueBlock label="After" value={entry.after_value} />
            </div>
          </div>

          <div className="border-t border-black/[0.06] pt-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--foreground-subtle)]">
              <History className="h-3.5 w-3.5" />
              Full history for this record
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : !history || history.length === 0 ? (
              <p className="text-sm text-[var(--foreground-muted)]">No other history found.</p>
            ) : (
              <ol className="relative space-y-4 border-l border-black/[0.08] pl-5">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span
                      className={`absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        h.id === entry.id ? "bg-[var(--accent)]" : "bg-slate-300"
                      }`}
                    />
                    <p className="text-sm font-medium capitalize text-[var(--foreground)]">
                      {h.action.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">{new Date(h.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
