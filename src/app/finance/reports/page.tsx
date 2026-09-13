"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, IndianRupee, Receipt, RefreshCw, RotateCcw, Search, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { usePlatformFinancialReport } from "@/hooks/useReports";
import { useMainCategories, useSubCategories } from "@/hooks/useEventCategories";
import { cn } from "@/lib/utils";
import type { EventFinancialReportOut } from "@/types/reports";

type SortKey = "name" | "revenue" | "refunded" | "net";

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function numeric(amount: string | number) {
  return typeof amount === "string" ? parseFloat(amount) : amount;
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

function EventRow({ event }: { event: EventFinancialReportOut }) {
  return (
    <TableRow>
      <TableCell>
        <Link
          href="/finance/transactions"
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
      </TableCell>
      <TableCell className="text-[var(--foreground-muted)]">{formatAmount(event.total_revenue)}</TableCell>
      <TableCell className="text-xs text-[var(--foreground-muted)]">
        {event.verified_payment_count} verified
        {event.pending_payment_count > 0 && `, ${event.pending_payment_count} pending`}
        {event.failed_payment_count > 0 && `, ${event.failed_payment_count} failed`}
      </TableCell>
      <TableCell className="text-[var(--foreground-muted)]">
        {formatAmount(event.total_refunded)}
        {event.refund_count > 0 && (
          <span className="ml-1 text-xs text-[var(--foreground-subtle)]">({event.refund_count})</span>
        )}
      </TableCell>
      <TableCell className="font-medium text-[var(--foreground)]">{formatAmount(event.net_revenue)}</TableCell>
    </TableRow>
  );
}

/** Same `usePlatformFinancialReport` hook and totals as before — no fabricated data. */
export default function FinanceReportsPage() {
  const { data: report, isLoading, isError, refetch, dataUpdatedAt } = usePlatformFinancialReport();
  const [search, setSearch] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDesc, setSortDesc] = useState(true);

  const mainCategories = useMainCategories();
  const subCategories = useSubCategories(mainCategoryId || undefined);

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

    return [...events].sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.event_name.localeCompare(b.event_name);
      else if (sortKey === "revenue") diff = numeric(a.total_revenue) - numeric(b.total_revenue);
      else if (sortKey === "refunded") diff = numeric(a.total_refunded) - numeric(b.total_refunded);
      else diff = numeric(a.net_revenue) - numeric(b.net_revenue);
      return sortDesc ? -diff : diff;
    });
  }, [report, search, mainCategoryId, subCategoryId, sortKey, sortDesc]);

  return (
    <div>
      <Header title="Financial Reports" />
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !report ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KPICard
              label="Revenue (all events)"
              value={formatAmount(report.total_revenue_across_events)}
              icon={TrendingUp}
              tone="success"
            />
            <KPICard
              label="Refunded (all events)"
              value={formatAmount(report.total_refunded_across_events)}
              icon={RotateCcw}
              tone="warning"
            />
            <KPICard
              label="Net revenue"
              value={formatAmount(report.net_revenue_across_events)}
              icon={IndianRupee}
              tone="accent"
            />
          </div>

          <div className="mt-4">
            <GlassPanel padded={false}>
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">By event</h2>
                  <span className="text-xs text-[var(--foreground-subtle)]">
                    {filteredEvents.length} of {report.events.length}
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
                  <EmptyState icon={Receipt} title="No revenue yet" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={Receipt}
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
                        <SortableHeaderCell label="Revenue" sortKey="revenue" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                        <TableHeaderCell>Payments</TableHeaderCell>
                        <SortableHeaderCell label="Refunded" sortKey="refunded" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                        <SortableHeaderCell label="Net" sortKey="net" activeKey={sortKey} desc={sortDesc} onSort={toggleSort} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <EventRow key={event.event_id} event={event} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}