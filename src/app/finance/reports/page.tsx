"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IndianRupee, Receipt, RotateCcw, Search, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { usePlatformFinancialReport } from "@/hooks/useReports";

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

/** Same `usePlatformFinancialReport` hook and totals as before — no fabricated data. */
export default function FinanceReportsPage() {
  const { data: report, isLoading, isError, refetch } = usePlatformFinancialReport();
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    if (!report) return [];
    const term = search.trim().toLowerCase();
    if (!term) return report.events;
    return report.events.filter((event) => event.event_name.toLowerCase().includes(term));
  }, [report, search]);

  return (
    <div>
      <Header title="Financial Reports" />

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
                </div>
                <div className="relative max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                  <Input className="pl-9" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              {report.events.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={Receipt} title="No revenue yet" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={Receipt} title="No events match your search" />
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Event</TableHeaderCell>
                        <TableHeaderCell>Revenue</TableHeaderCell>
                        <TableHeaderCell>Payments</TableHeaderCell>
                        <TableHeaderCell>Refunded</TableHeaderCell>
                        <TableHeaderCell>Net</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEvents.map((event) => (
                        <TableRow key={event.event_id}>
                          <TableCell>
                            <Link
                              href="/finance/transactions"
                              className="font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                            >
                              {event.event_name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-[var(--foreground-muted)]">
                            {formatAmount(event.total_revenue)}
                          </TableCell>
                          <TableCell className="text-xs text-[var(--foreground-muted)]">
                            {event.verified_payment_count} verified
                            {event.pending_payment_count > 0 && `, ${event.pending_payment_count} pending`}
                            {event.failed_payment_count > 0 && `, ${event.failed_payment_count} failed`}
                          </TableCell>
                          <TableCell className="text-[var(--foreground-muted)]">
                            {formatAmount(event.total_refunded)}
                            {event.refund_count > 0 && (
                              <span className="ml-1 text-xs text-[var(--foreground-subtle)]">
                                ({event.refund_count})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-[var(--foreground)]">
                            {formatAmount(event.net_revenue)}
                          </TableCell>
                        </TableRow>
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