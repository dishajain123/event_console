"use client";

import Link from "next/link";
import { IndianRupee, Receipt, RotateCcw, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { KPICard } from "@/components/reports/kpi-card";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { usePlatformFinancialReport } from "@/hooks/useReports";

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

export default function FinanceReportsPage() {
  const { data: report, isLoading, isError, refetch } = usePlatformFinancialReport();

  return (
    <div>
      <Header title="Financial Reports" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !report ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

          <div className="mt-6">
            <GlassPanel padded={false}>
              <div className="border-b border-black/[0.06] px-6 py-4">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">By event</h2>
              </div>
              {report.events.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={Receipt} title="No revenue yet" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                      <th className="px-6 py-3 font-medium">Event</th>
                      <th className="px-6 py-3 font-medium">Revenue</th>
                      <th className="px-6 py-3 font-medium">Payments</th>
                      <th className="px-6 py-3 font-medium">Refunded</th>
                      <th className="px-6 py-3 font-medium">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {report.events.map((event) => (
                      <tr key={event.event_id} className="transition-colors hover:bg-black/[0.02]">
                        <td className="px-6 py-4">
                          <Link
                            href={`/finance/transactions`}
                            className="font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                          >
                            {event.event_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">
                          {formatAmount(event.total_revenue)}
                        </td>
                        <td className="px-6 py-4 text-xs text-[var(--foreground-muted)]">
                          {event.verified_payment_count} verified
                          {event.pending_payment_count > 0 && `, ${event.pending_payment_count} pending`}
                          {event.failed_payment_count > 0 && `, ${event.failed_payment_count} failed`}
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">
                          {formatAmount(event.total_refunded)}
                          {event.refund_count > 0 && (
                            <span className="ml-1 text-xs text-[var(--foreground-subtle)]">
                              ({event.refund_count})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {formatAmount(event.net_revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}
