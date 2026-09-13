"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, CalendarDays, ChevronDown, RefreshCw, Search, Users, CheckSquare, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { usePlatformOperationsReport } from "@/hooks/useReports";
import { useMainCategories, useSubCategories } from "@/hooks/useEventCategories";
import { REGISTRATION_STATUS_LABELS } from "@/types/registrations";
import { cn } from "@/lib/utils";
import type { EventOperationsReportOut } from "@/types/reports";

type SortKey = "name" | "registrations" | "checkins" | "utilization";

/** Reused for both the all-events funnel and each row's own breakdown — no new data, just a shared renderer. */
function StatusBreakdown({ rows }: { rows: { status: string; count: number; pct: number }[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--foreground-muted)]">No registrations yet.</p>;
  }
  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.status}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--foreground)]">
              {REGISTRATION_STATUS_LABELS[row.status as keyof typeof REGISTRATION_STATUS_LABELS] ?? row.status}
            </span>
            <span className="text-[var(--foreground-muted)]">{row.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${row.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function toBreakdownRows(source: { status: string; count: number }[]) {
  const total = source.reduce((sum, row) => sum + row.count, 0);
  return [...source]
    .map((row) => ({ ...row, pct: total > 0 ? Math.round((row.count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);
}

function SortableHeaderCell({
  label,
  sortKey,
  activeKey,
  desc,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  desc: boolean;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <TableHeaderCell>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors",
          active ? "text-[var(--accent-strong)]" : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]",
        )}
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active && !desc && "rotate-180")} />
      </button>
    </TableHeaderCell>
  );
}

function EventRow({ event, expanded, onToggle }: { event: EventOperationsReportOut; expanded: boolean; onToggle: () => void }) {
  const utilizationPct = event.capacity_utilization_pct ?? (event.capacity ? Math.round((event.capacity_used / event.capacity) * 100) : null);
  return (
    <>
      <TableRow clickable onClick={onToggle}>
        <TableCell>
          <div className="flex items-center gap-2">
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[var(--foreground-subtle)] transition-transform", expanded && "rotate-180")} />
            <div className="min-w-0">
              <Link
                href={`/ops/events/${event.event_id}/reports`}
                onClick={(e) => e.stopPropagation()}
                className="font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
              >
                {event.event_name}
              </Link>
              {(event.main_category_name || event.sub_category_name) && (
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  {event.main_category_name && (
                    <Badge tone="neutral" className="text-[10px]">
                      {event.main_category_name}
                    </Badge>
                  )}
                  {event.sub_category_name && (
                    <Badge tone="neutral" className="text-[10px]">
                      {event.sub_category_name}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-[var(--foreground-muted)]">
          {event.active_registrations} / {event.total_registrations}
        </TableCell>
        <TableCell className="text-[var(--foreground-muted)]">
          {event.capacity ? (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.min(utilizationPct ?? 0, 100)}%` }} />
              </div>
              <span className="text-xs">
                {event.capacity_used}/{event.capacity} {utilizationPct != null && `(${utilizationPct}%)`}
              </span>
            </div>
          ) : (
            "Unlimited"
          )}
        </TableCell>
        <TableCell className="text-[var(--foreground-muted)]">{event.total_check_ins}</TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-[var(--surface-muted)] py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
              Registration breakdown for {event.event_name}
            </p>
            <div className="max-w-md">
              <StatusBreakdown rows={toBreakdownRows(event.registrations_by_status)} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

/**
 * Same `usePlatformOperationsReport` hook and the same aggregate
 * `statusTotals` computation as before — no fabricated or new data.
 * What's new: a search box over the by-event table (client-side; the
 * full event list is already loaded, not paginated), and each row
 * expands to show that event's own `registrations_by_status` — data
 * the backend was already sending per event but that the page only
 * used in aggregate before. That's the "summary -> breakdown -> detail"
 * flow the brief asks for, built entirely from data already on hand.
 */
export default function OpsReportsPage() {
  const { data: report, isLoading, isError, refetch, dataUpdatedAt } = usePlatformOperationsReport();
  const [search, setSearch] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("registrations");
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const mainCategories = useMainCategories();
  const subCategories = useSubCategories(mainCategoryId || undefined);

  const statusTotals = useMemo(() => {
    if (!report) return [];
    const totals = new Map<string, number>();
    for (const event of report.events) {
      for (const row of event.registrations_by_status) {
        totals.set(row.status, (totals.get(row.status) ?? 0) + row.count);
      }
    }
    return toBreakdownRows(Array.from(totals.entries()).map(([status, count]) => ({ status, count })));
  }, [report]);

  const isFiltered = !!(search || mainCategoryId || subCategoryId);

  function resetAll() {
    setSearch("");
    setMainCategoryId("");
    setSubCategoryId("");
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  }

  const filteredEvents = useMemo(() => {
    if (!report) return [];
    const term = search.trim().toLowerCase();
    let events = report.events;
    if (term) events = events.filter((event) => event.event_name.toLowerCase().includes(term));
    if (mainCategoryId) events = events.filter((event) => event.main_category_id === mainCategoryId);
    if (subCategoryId) events = events.filter((event) => event.sub_category_id === subCategoryId);

    const sorted = [...events].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.event_name.localeCompare(b.event_name);
      else if (sortKey === "registrations") diff = a.total_registrations - b.total_registrations;
      else if (sortKey === "checkins") diff = a.total_check_ins - b.total_check_ins;
      else diff = (a.capacity_utilization_pct ?? -1) - (b.capacity_utilization_pct ?? -1);
      return sortDesc ? -diff : diff;
    });
    return sorted;
  }, [report, search, mainCategoryId, subCategoryId, sortKey, sortDesc]);

  return (
    <div>
      <Header title="Operations Reports" />
      <PageToolbar
        meta={dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !report ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard label="Total events" value={report.total_events} icon={CalendarDays} tone="accent" />
            <KPICard label="Published events" value={report.published_events} icon={TrendingUp} tone="success" />
            <KPICard label="Registrations (all events)" value={report.total_registrations_across_events} icon={Users} tone="info" />
            <KPICard label="Check-ins (all events)" value={report.total_check_ins_across_events} icon={CheckSquare} tone="success" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
            <GlassPanel padded={false}>
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">By event</h2>
                  <span className="text-xs text-[var(--foreground-subtle)]">
                    {filteredEvents.length} of {report.events.length} · click a row for its breakdown
                  </span>
                </div>
                <FilterBar className="mb-0" isFiltered={isFiltered} onReset={resetAll}>
                  <div className="relative max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                    <Input className="pl-9" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Select
                    className="w-44"
                    value={mainCategoryId}
                    onChange={(e) => {
                      setMainCategoryId(e.target.value);
                      setSubCategoryId("");
                    }}
                  >
                    <option value="">All main categories</option>
                    {(mainCategories.data ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                  <Select
                    className="w-44"
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    disabled={!mainCategoryId}
                  >
                    <option value="">All subcategories</option>
                    {(subCategories.data ?? []).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </FilterBar>
              </div>
              {report.events.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={CalendarDays} title="No events yet" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={CalendarDays}
                    title="No events match these filters"
                    description="Try a different search term or clear the category filters."
                    action={{ label: "Clear filters", onClick: resetAll }}
                  />
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <SortableHeaderCell label="Event" sortKey="name" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                        <SortableHeaderCell label="Registrations" sortKey="registrations" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                        <SortableHeaderCell label="Capacity" sortKey="utilization" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                        <SortableHeaderCell label="Check-ins" sortKey="checkins" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <EventRow
                          key={event.event_id}
                          event={event}
                          expanded={expandedEventId === event.event_id}
                          onToggle={() => setExpandedEventId(expandedEventId === event.event_id ? null : event.event_id)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </GlassPanel>

            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Registration funnel (all events)</h2>
              <StatusBreakdown rows={statusTotals} />
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}