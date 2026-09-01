"use client";

import { useState } from "react";
import { History, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { AuditLogDetailDrawer } from "@/components/audit/audit-log-detail-drawer";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AUDIT_ENTITY_TYPES } from "@/types/auditLog";
import type { AuditLogOut } from "@/types/auditLog";

const PAGE_SIZE = 25;

const ENTITY_TONE: Record<string, "neutral" | "accent" | "success" | "warning" | "info" | "danger"> = {
  payment: "success",
  refund: "warning",
  registration: "accent",
  event: "info",
  role_assignment: "danger",
  staff_assignment: "danger",
};

export default function AuditLogPage() {
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<AuditLogOut | null>(null);

  const { data, isLoading, isError, refetch } = useAuditLog({
    entity_type: entityType || undefined,
    action: action || undefined,
    date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    date_to: dateTo ? new Date(dateTo).toISOString() : undefined,
    limit: PAGE_SIZE,
    offset,
  });

  function resetFilters() {
    setEntityType("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    setOffset(0);
  }

  const hasFilters = !!(entityType || action || dateFrom || dateTo);
  const total = data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <Header title="Audit Log" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--foreground-muted)]">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>
        <Select
          className="w-48"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            setOffset(0);
          }}
        >
          <option value="">All entity types</option>
          {AUDIT_ENTITY_TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          className="w-40"
          placeholder="Action, e.g. approved"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setOffset(0);
          }}
        />
        <Input
          type="date"
          className="w-40"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setOffset(0);
          }}
        />
        <Input
          type="date"
          className="w-40"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setOffset(0);
          }}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <GlassPanel padded={false}>
        {isLoading && !data ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={History}
              title={hasFilters ? "No entries match your filters" : "No audit entries yet"}
              description={hasFilters ? "Try broadening your filters." : "Actions across the platform will appear here as they happen."}
            />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                  <th className="px-6 py-3 font-medium">When</th>
                  <th className="px-6 py-3 font-medium">Entity</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {data.items.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    className="cursor-pointer transition-colors hover:bg-black/[0.02]"
                  >
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={ENTITY_TONE[entry.entity_type] ?? "neutral"}>
                        {entry.entity_type.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 capitalize text-[var(--foreground)]">
                      {entry.action.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--foreground-muted)]">
                      {entry.actor_user_id ? entry.actor_user_id.slice(0, 8) + "…" : "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between border-t border-black/[0.06] px-6 py-4">
              <p className="text-xs text-[var(--foreground-muted)]">
                {total} total entr{total === 1 ? "y" : "ies"} · page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={offset + PAGE_SIZE >= total}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </GlassPanel>

      {selected && <AuditLogDetailDrawer entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
