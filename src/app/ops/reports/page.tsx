"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Users, CheckSquare, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { KPICard } from "@/components/reports/kpi-card";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { usePlatformOperationsReport } from "@/hooks/useReports";
import { REGISTRATION_STATUS_LABELS } from "@/types/registrations";

export default function OpsReportsPage() {
  const { data: report, isLoading, isError, refetch } = usePlatformOperationsReport();

  const statusTotals = useMemo(() => {
    if (!report) return [];
    const totals = new Map<string, number>();
    for (const event of report.events) {
      for (const row of event.registrations_by_status) {
        totals.set(row.status, (totals.get(row.status) ?? 0) + row.count);
      }
    }
    const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0);
    return Array.from(totals.entries())
      .map(([status, count]) => ({ status, count, pct: grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [report]);

  return (
    <div>
      <Header title="Operations Reports" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !report ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard label="Total events" value={report.total_events} icon={CalendarDays} tone="accent" />
            <KPICard label="Published events" value={report.published_events} icon={TrendingUp} tone="success" />
            <KPICard
              label="Registrations (all events)"
              value={report.total_registrations_across_events}
              icon={Users}
              tone="info"
            />
            <KPICard
              label="Check-ins (all events)"
              value={report.total_check_ins_across_events}
              icon={CheckSquare}
              tone="success"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
            <GlassPanel padded={false}>
              <div className="border-b border-black/[0.06] px-6 py-4">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">By event</h2>
              </div>
              {report.events.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={CalendarDays} title="No events yet" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                      <th className="px-6 py-3 font-medium">Event</th>
                      <th className="px-6 py-3 font-medium">Registrations</th>
                      <th className="px-6 py-3 font-medium">Capacity</th>
                      <th className="px-6 py-3 font-medium">Check-ins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {report.events.map((event) => (
                      <tr key={event.event_id} className="transition-colors hover:bg-black/[0.02]">
                        <td className="px-6 py-4">
                          <Link
                            href={`/ops/events/${event.event_id}/reports`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                          >
                            {event.event_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">
                          {event.active_registrations} / {event.total_registrations}
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">
                          {event.capacity ? `${event.capacity_used} / ${event.capacity}` : "Unlimited"}
                          {event.capacity_utilization_pct != null && (
                            <span className="ml-1.5 text-xs text-[var(--foreground-subtle)]">
                              ({event.capacity_utilization_pct}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">{event.total_check_ins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </GlassPanel>

            <GlassPanel>
              <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">
                Registration funnel (all events)
              </h2>
              {statusTotals.length === 0 ? (
                <p className="text-sm text-[var(--foreground-muted)]">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {statusTotals.map((row) => (
                    <div key={row.status}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-[var(--foreground)]">
                          {REGISTRATION_STATUS_LABELS[row.status as keyof typeof REGISTRATION_STATUS_LABELS] ??
                            row.status}
                        </span>
                        <span className="text-[var(--foreground-muted)]">{row.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/[0.05]">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}
