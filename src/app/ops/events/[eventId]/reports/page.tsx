"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, CheckSquare, ClipboardCheck, Gauge, IndianRupee, RefreshCw, Users } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/reports/kpi-card";
import { CardSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventSummaryReport } from "@/hooks/useReports";

export default function EventReportsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: report, isLoading, isError, refetch, dataUpdatedAt } = useEventSummaryReport(eventId);

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>

      <Header title="Event Reports" />
      <PageToolbar
        description="A quick operational snapshot for this event."
        meta={dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError || !report ? (
        <ErrorState
          title="Couldn't load this report"
          description="This event may not be configured yet, or the backend is unreachable."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KPICard label="Total registrations" value={report.total_registrations} icon={Users} tone="accent" />
            <KPICard label="Active registrations" value={report.active_registrations} icon={CheckSquare} tone="success" />
            <KPICard label="Check-ins" value={report.total_check_ins} icon={ClipboardCheck} tone="accent" />
            <KPICard
              label="Capacity used"
              value={report.capacity ? `${report.capacity_used} / ${report.capacity}` : report.capacity_used}
              icon={Gauge}
              tone="info"
              hint={
                report.capacity_utilization_pct != null ? `${report.capacity_utilization_pct}% utilized` : undefined
              }
            />
            <KPICard
              label="Revenue collected"
              value={`₹${Number(report.revenue_collected).toLocaleString("en-IN")}`}
              icon={IndianRupee}
              tone="success"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Registrations by status</h2>
              {report.registrations_by_status.length === 0 ? (
                <EmptyState icon={Users} title="No registrations yet" description="This event hasn't received any registrations." />
              ) : (
                <div className="space-y-3">
                  {report.registrations_by_status.map((row) => {
                    const pct =
                      report.total_registrations > 0
                        ? Math.round((row.count / report.total_registrations) * 100)
                        : 0;
                    return (
                      <div key={row.status}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium capitalize text-[var(--foreground)]">
                            {row.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-[var(--foreground-muted)]">{row.count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>

            <GlassPanel className="h-fit">
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Go deeper</h2>
              <div className="space-y-2">
                <Link
                  href={`/ops/events/${eventId}/analytics`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <BarChart3 className="h-4 w-4 text-[var(--accent-strong)]" />
                    Advanced Analytics
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                </Link>
                <Link
                  href={`/ops/events/${eventId}/attendance`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <ClipboardCheck className="h-4 w-4 text-[var(--accent-strong)]" />
                    Attendance Analytics
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                </Link>
                <Link
                  href={`/ops/events/${eventId}/registrations`}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <span className="flex items-center gap-2 text-[var(--foreground)]">
                    <Users className="h-4 w-4 text-[var(--accent-strong)]" />
                    Full registrations list
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--foreground-subtle)]" />
                </Link>
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}
