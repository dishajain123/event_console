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
import { usePaymentWebhooks, usePayments } from "@/hooks/usePayments";
import { useEvents } from "@/hooks/useEvents";

function formatAmount(amount: string | number, currency: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

export default function ReconciliationPage() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const { data: events } = useEvents();
  const { data: paymentPage, isLoading, isError, refetch } = usePayments({
    eventId: eventFilter === "all" ? undefined : eventFilter,
    page: 1,
    pageSize: 100,
  });
  const payments = paymentPage?.items;
  const { data: webhooks } = usePaymentWebhooks();

  const needingAttention = useMemo(
    () => (payments ?? []).filter((p) => ["unknown", "pending", "mismatch", "failed"].includes(p.reconciliation_status)),
    [payments],
  );

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
              label="Reconciliation attention"
              value={needingAttention.length}
              icon={Scale}
              tone={needingAttention.length > 0 ? "warning" : "info"}
              hint={needingAttention.length > 0 ? "Needs investigation" : "All clear"}
            />
          </div>

          <div className="mt-6">
            <GlassPanel padded={false}>
              <div className="border-b border-black/[0.06] px-6 py-4">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Payments needing attention
                </h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Provider reconciliation status from the backend, including pending, unknown, failed, and mismatch cases.
                </p>
              </div>
              {isLoading ? (
                <div className="p-6">
                  <TableSkeleton rows={3} cols={3} />
                </div>
              ) : needingAttention.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={CheckCircle2}
                    title="Nothing stuck"
                    description="No payment reconciliation exceptions are currently reported."
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
                      <th className="px-6 py-3 font-medium">Reconciliation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {needingAttention.map((payment) => (
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
                        <td className="px-6 py-4 text-xs text-[var(--foreground-muted)]">
                          <span className="font-medium text-[var(--foreground)]">{payment.reconciliation_status}</span>
                          {payment.reconciliation_error && <div>{payment.reconciliation_error}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </GlassPanel>
          </div>
          <div className="mt-6">
            <GlassPanel padded={false}>
              <div className="border-b border-black/[0.06] px-6 py-4">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Webhook inbox</h2>
                <p className="text-xs text-[var(--foreground-muted)]">Durable Razorpay events and retry state.</p>
              </div>
              <div className="max-h-72 overflow-auto">
                {(webhooks ?? []).length === 0 ? (
                  <p className="p-6 text-sm text-[var(--foreground-muted)]">No webhook events received.</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-black/[0.05]">
                      {(webhooks ?? []).slice(0, 20).map((webhook) => (
                        <tr key={webhook.id}>
                          <td className="px-6 py-3 font-mono text-xs">{webhook.provider_event_id}</td>
                          <td className="px-6 py-3">{webhook.event_type}</td>
                          <td className="px-6 py-3">{webhook.processing_status}</td>
                          <td className="px-6 py-3 text-xs text-[var(--foreground-muted)]">
                            {webhook.failure_reason ?? `${webhook.attempts} attempt(s)`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}
