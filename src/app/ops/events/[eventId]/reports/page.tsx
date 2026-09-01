"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CheckSquare, Gauge, IndianRupee } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { KPICard } from "@/components/reports/kpi-card";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventSummaryReport } from "@/hooks/useReports";

export default function EventReportsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: report, isLoading, isError, refetch } = useEventSummaryReport(eventId);

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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !report ? (
        <ErrorState
          title="Couldn't load this report"
          description="This event may not be configured yet, or the backend is unreachable."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard label="Total registrations" value={report.total_registrations} icon={Users} tone="accent" />
            <KPICard label="Active registrations" value={report.active_registrations} icon={CheckSquare} tone="success" />
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

          <div className="mt-6">
            <GlassPanel>
              <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                Registrations by status
              </h2>
              {report.registrations_by_status.length === 0 ? (
                <p className="text-sm text-[var(--foreground-muted)]">No registrations yet.</p>
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
                        <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]">
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
          </div>
        </>
      )}
    </div>
  );
}
