"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
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

/**
 * Same `useAuditLog` hook, same filter params, and the same
 * offset/PAGE_SIZE pagination state as before — only the presentation
 * (FilterBar wrapper, Table primitives, shared Pagination) changed.
 */
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

      <FilterBar isFiltered={hasFilters} onReset={resetFilters}>
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
      </FilterBar>

      <GlassPanel padded={false}>
        {isLoading && !data ? (
          <div className="p-5">
            <TableSkeleton rows={8} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={History}
              title={hasFilters ? "No entries match your filters" : "No audit entries yet"}
              description={hasFilters ? "Try broadening your filters." : "Actions across the platform will appear here as they happen."}
            />
          </div>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>When</TableHeaderCell>
                    <TableHeaderCell>Entity</TableHeaderCell>
                    <TableHeaderCell>Action</TableHeaderCell>
                    <TableHeaderCell>Actor</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((entry) => (
                    <TableRow key={entry.id} clickable onClick={() => setSelected(entry)}>
                      <TableCell className="text-[var(--foreground-muted)]">{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge tone={ENTITY_TONE[entry.entity_type] ?? "neutral"}>{entry.entity_type.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="capitalize text-[var(--foreground)]">{entry.action.replace(/_/g, " ")}</TableCell>
                      <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">
                        {entry.actor_user_id ? entry.actor_user_id.slice(0, 8) + "…" : "System"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination page={page} totalPages={totalPages} totalItems={total} onPageChange={(next) => setOffset((next - 1) * PAGE_SIZE)} />
          </>
        )}
      </GlassPanel>

      {selected && <AuditLogDetailDrawer entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}