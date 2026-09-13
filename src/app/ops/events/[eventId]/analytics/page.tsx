"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CircleDollarSign, Users, Ticket, MessageSquare, RefreshCw } from "lucide-react";
import { useEventAnalytics, useEventAnalyticsComparison, useEventAnalyticsTimeSeries } from "@/hooks/useReports";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { KPICard } from "@/components/reports/kpi-card";
import { MiniLineChart } from "@/components/reports/mini-line-chart";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { CardSkeleton } from "@/components/shared/skeleton";
import type { ApiError } from "@/api/client";

export default function EventAnalyticsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const filters = { start: start ? `${start}T00:00:00Z` : undefined, end: end ? `${end}T23:59:59Z` : undefined };
  const analytics = useEventAnalytics(eventId, filters);
  const series = useEventAnalyticsTimeSeries(eventId, filters);
  const comparison = useEventAnalyticsComparison(eventId, filters);
  const isFiltered = !!(start || end);

  function resetFilters() {
    setStart("");
    setEnd("");
  }

  function refetchAll() {
    analytics.refetch();
    series.refetch();
    comparison.refetch();
  }

  const isLoading = analytics.isLoading || series.isLoading || comparison.isLoading;
  const isError = analytics.isError || series.isError || comparison.isError;

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
      <Header title="Advanced Analytics" />
      <PageToolbar
        description={analytics.data ? `${analytics.data.event_name} · server-derived performance metrics` : "Server-derived performance metrics"}
        actions={
          <Button variant="outline" size="sm" onClick={refetchAll}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <FilterBar isFiltered={isFiltered} onReset={resetFilters}>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-subtle)]">From</label>
          <Input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--foreground-subtle)]">To</label>
          <Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
      </FilterBar>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description={
            (analytics.error as unknown as ApiError | null)?.message ??
            (series.error as unknown as ApiError | null)?.message ??
            "Unable to load event analytics."
          }
          onRetry={refetchAll}
        />
      ) : !analytics.data ? (
        <EmptyState icon={BarChart3} title="No analytics available" />
      ) : (
        (() => {
          const data = analytics.data;
          const revenue = data.revenue;
          return (
            <>
              <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                <KPICard label="Registrations" value={data.registrations.total ?? 0} icon={Users} tone="accent" />
                <KPICard label="Confirmed" value={data.registrations.confirmed ?? 0} icon={Users} tone="success" />
                <KPICard label="Capacity used" value={`${data.capacity.utilization_rate ?? 0}%`} icon={BarChart3} tone="info" />
                <KPICard label="Check-ins" value={data.attendance.check_ins ?? 0} icon={Ticket} tone="accent" />
                <KPICard label="Feedback" value={data.feedback.submitted ?? 0} icon={MessageSquare} tone="neutral" />
              </div>

              {revenue && (
                <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
                  <KPICard label="Gross collected" value={`₹${Number(revenue.gross ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="success" />
                  <KPICard label="Net collected" value={`₹${Number(revenue.net_collected ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="neutral" />
                  <KPICard label="Refunded" value={`₹${Number(revenue.refunded_amount ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="warning" />
                  <KPICard label="Pending amount" value={`₹${Number(revenue.pending_amount ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="info" />
                  <KPICard label="Reconciliation issues" value={Number(revenue.reconciliation_attention ?? 0)} icon={BarChart3} tone="warning" />
                </div>
              )}

              {comparison.data && (
                <GlassPanel className="mb-4">
                  <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Previous-period comparison</h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Object.entries(comparison.data)
                      .filter(([key]) => ["registrations", "attendance", "engagement", "revenue"].includes(key))
                      .map(([key, value]) => (
                        <div className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-3" key={key}>
                          <p className="text-xs capitalize text-[var(--foreground-subtle)]">{key}</p>
                          <p className="text-lg font-semibold text-[var(--foreground)]">{(value as { current: number }).current}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            Previous {(value as { previous: number }).previous} ·{" "}
                            {(value as { change_pct: number | null }).change_pct == null ? "—" : `${(value as { change_pct: number }).change_pct}%`}
                          </p>
                        </div>
                      ))}
                  </div>
                </GlassPanel>
              )}

              <div className="mb-4 grid gap-4 lg:grid-cols-2">
                <GlassPanel>
                  <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Registration funnel</h2>
                  <div className="space-y-2 text-sm">
                    {Object.entries(data.funnel).map(([key, value]) => (
                      <div className="flex justify-between border-b border-[var(--border)] py-2 last:border-b-0" key={key}>
                        <span className="capitalize text-[var(--foreground-muted)]">{key.replaceAll("_", " ")}</span>
                        <strong className="text-[var(--foreground)]">{value}</strong>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
                <GlassPanel>
                  <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Engagement and attendance</h2>
                  <div className="space-y-2 text-sm">
                    {Object.entries({ ...data.engagement, ...data.attendance, ...data.feedback }).map(([key, value]) => (
                      <div className="flex justify-between border-b border-[var(--border)] py-2 last:border-b-0" key={key}>
                        <span className="capitalize text-[var(--foreground-muted)]">{key.replaceAll("_", " ")}</span>
                        <strong className="text-[var(--foreground)]">{(value as number | string | null) ?? "—"}</strong>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>

              {series.data && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <GlassPanel>
                    <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Registrations &amp; check-ins</h2>
                    <p className="mb-3.5 text-xs text-[var(--foreground-subtle)]">Daily counts over the selected range</p>
                    <MiniLineChart
                      series={[
                        { key: "registrations", label: "Registrations", color: "#6366f1", points: series.data.registrations },
                        { key: "check_ins", label: "Check-ins", color: "#16a34a", points: series.data.check_ins },
                      ]}
                    />
                  </GlassPanel>
                  <GlassPanel>
                    <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Engagement</h2>
                    <p className="mb-3.5 text-xs text-[var(--foreground-subtle)]">Feedback, sponsor engagement, and networking activity</p>
                    <MiniLineChart
                      series={[
                        { key: "feedback", label: "Feedback", color: "#6366f1", points: series.data.feedback },
                        { key: "sponsor_engagements", label: "Sponsor engagements", color: "#16a34a", points: series.data.sponsor_engagements },
                        { key: "networking", label: "Networking", color: "#0284c7", points: series.data.networking },
                      ]}
                    />
                  </GlassPanel>
                  <GlassPanel className="lg:col-span-2">
                    <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Payments &amp; refunds</h2>
                    <p className="mb-3.5 text-xs text-[var(--foreground-subtle)]">Verified payments and processed refunds</p>
                    <MiniLineChart
                      series={[
                        { key: "payments", label: "Payments", color: "#6366f1", points: series.data.payments },
                        { key: "refunds", label: "Refunds", color: "#d97706", points: series.data.refunds },
                      ]}
                    />
                  </GlassPanel>
                </div>
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
