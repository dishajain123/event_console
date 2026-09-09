"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Scale, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Select } from "@/components/ui/select";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { PaymentStatusBadge } from "@/components/finance/status-badges";
import { usePaymentWebhooks, usePayments } from "@/hooks/usePayments";
import { useEvents } from "@/hooks/useEvents";

function formatAmount(amount: string | number, currency: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

/** Same `usePayments`/`usePaymentWebhooks` hooks and filter params as before. */
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

          <div className="mt-4">
            <GlassPanel padded={false}>
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">
                  Payments needing attention
                </h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Provider reconciliation status from the backend, including pending, unknown, failed, and mismatch cases.
                </p>
              </div>
              {isLoading ? (
                <div className="p-5">
                  <TableSkeleton rows={3} cols={3} />
                </div>
              ) : needingAttention.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={CheckCircle2}
                    title="Nothing stuck"
                    description="No payment reconciliation exceptions are currently reported."
                  />
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Gateway Order</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                        <TableHeaderCell>Initiated</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Reconciliation</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {needingAttention.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs text-[var(--foreground)]">
                            {payment.gateway_order_id ?? "—"}
                          </TableCell>
                          <TableCell className="font-medium text-[var(--foreground)]">
                            {formatAmount(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell className="text-[var(--foreground-muted)]">
                            {new Date(payment.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <PaymentStatusBadge status={payment.status} />
                          </TableCell>
                          <TableCell className="text-xs text-[var(--foreground-muted)]">
                            <span className="font-medium text-[var(--foreground)]">{payment.reconciliation_status}</span>
                            {payment.reconciliation_error && <div>{payment.reconciliation_error}</div>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </GlassPanel>
          </div>
          <div className="mt-4">
            <GlassPanel padded={false}>
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Webhook inbox</h2>
                <p className="text-xs text-[var(--foreground-muted)]">Durable Razorpay events and retry state.</p>
              </div>
              <div className="max-h-72 overflow-auto">
                {(webhooks ?? []).length === 0 ? (
                  <p className="p-5 text-sm text-[var(--foreground-muted)]">No webhook events received.</p>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableBody>
                        {(webhooks ?? []).slice(0, 20).map((webhook) => (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-mono text-xs text-[var(--foreground)]">{webhook.provider_event_id}</TableCell>
                            <TableCell className="text-[var(--foreground)]">{webhook.event_type}</TableCell>
                            <TableCell className="text-[var(--foreground-muted)]">{webhook.processing_status}</TableCell>
                            <TableCell className="text-xs text-[var(--foreground-muted)]">
                              {webhook.failure_reason ?? `${webhook.attempts} attempt(s)`}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}