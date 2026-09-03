"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Scale, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Select } from "@/components/ui/select";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { KPICard } from "@/components/reports/kpi-card";
import { PaymentStatusBadge } from "@/components/finance/status-badges";
import { usePayments } from "@/hooks/usePayments";
import { useEvents } from "@/hooks/useEvents";

function formatAmount(amount: string | number, currency: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

/**
 * Scoped honestly to what GET /payments can actually support: the
 * backend has no dedicated settlement-reconciliation endpoint yet (no
 * gateway settlement file ingestion), so this view surfaces the one
 * genuinely actionable signal available today — payments that reached
 * "initiated" and never received a webhook confirmation, the most
 * common real-world reconciliation problem (a payment succeeded at the
 * gateway but the confirmation never arrived, or the user abandoned
 * checkout). A dedicated backend reconciliation endpoint comparing
 * against actual gateway settlement data would be a stronger future
 * version of this page.
 */
export default function ReconciliationPage() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [now] = useState(() => Date.now());
  const { data: events } = useEvents();
  const { data: payments, isLoading, isError, refetch } = usePayments(
    eventFilter === "all" ? undefined : eventFilter,
  );

  const stuckInitiated = useMemo(() => {
    if (!payments) return [];
    const cutoff = now - 30 * 60 * 1000; // older than 30 minutes
    return payments.filter((p) => p.status === "initiated" && new Date(p.created_at).getTime() < cutoff);
  }, [payments, now]);

  const summary = useMemo(() => {
    if (!payments) return null;
    const verified = payments.filter((p) => p.status === "verified");
    const failed = payments.filter((p) => p.status === "failed");
    const verifiedSum = verified.reduce(
      (sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : p.amount),
      0,
    );
    return { verifiedCount: verified.length, failedCount: failed.length, verifiedSum };
  }, [payments]);

  return (
    <div>
      <Header title="Reconciliation" />

      <div className="mb-4">
        <Select className="w-56" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="all">All events</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPICard
              label="Verified revenue"
              value={summary ? formatAmount(summary.verifiedSum, payments?.[0]?.currency ?? "INR") : "—"}
              icon={CheckCircle2}
              tone="success"
            />
            <KPICard label="Failed payments" value={summary?.failedCount ?? 0} icon={AlertTriangle} tone="warning" />
            <KPICard
              label="Stuck &gt;30min (unconfirmed)"
              value={stuckInitiated.length}
              icon={Scale}
              tone={stuckInitiated.length > 0 ? "warning" : "info"}
              hint={stuckInitiated.length > 0 ? "Needs investigation" : "All clear"}
            />
          </div>

          <div className="mt-6">
            <GlassPanel padded={false}>
              <div className="border-b border-black/[0.06] px-6 py-4">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Payments needing attention
                </h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Initiated more than 30 minutes ago with no webhook confirmation received.
                </p>
              </div>
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton rows={3} cols={3} />
                </div>
              ) : stuckInitiated.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={CheckCircle2}
                    title="Nothing stuck"
                    description="Every initiated payment has either been confirmed or is still within the normal checkout window."
                  />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                      <th className="px-6 py-3 font-medium">Gateway Order</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Initiated</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {stuckInitiated.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 font-mono text-xs text-[var(--foreground)]">
                          {payment.gateway_order_id ?? "—"}
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>
                        <td className="px-6 py-4 text-[var(--foreground-muted)]">
                          {new Date(payment.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <PaymentStatusBadge status={payment.status} />
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
