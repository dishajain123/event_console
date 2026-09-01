"use client";

import { useMemo, useState } from "react";
import { Search, Receipt } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaymentStatusBadge } from "@/components/finance/status-badges";
import { usePayments } from "@/hooks/usePayments";
import { useEvents } from "@/hooks/useEvents";
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/types/payments";

function formatAmount(amount: string | number, currency: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

export default function TransactionsPage() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [search, setSearch] = useState("");

  const { data: events } = useEvents();
  const { data: payments, isLoading, isError, refetch } = usePayments(
    eventFilter === "all" ? undefined : eventFilter,
  );

  const filtered = useMemo(() => {
    if (!payments) return [];
    return payments.filter((p) => {
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesSearch =
        !search ||
        p.gateway_order_id?.toLowerCase().includes(search.toLowerCase()) ||
        p.gateway_payment_id?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, search]);

  const totalVerified = filtered
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : p.amount), 0);

  return (
    <div>
      <Header title="Transactions" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            placeholder="Search by gateway transaction ID…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select className="w-56" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="all">All events</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
        <Select
          className="w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
        >
          <option value="all">All statuses</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="fade-in mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--success-soft)] px-4 py-2.5 text-sm text-[var(--success)]">
          <Receipt className="h-4 w-4" />
          <span className="font-medium">{formatAmount(totalVerified, filtered[0]?.currency ?? "INR")}</span>
          verified across {filtered.filter((p) => p.status === "verified").length} of {filtered.length} shown
        </div>
      )}

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title={payments && payments.length > 0 ? "No transactions match your filters" : "No transactions yet"}
              description={
                payments && payments.length > 0
                  ? "Try a different search term or filter."
                  : "Payments will appear here once participants start paying for registrations."
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Gateway Transaction</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Discount</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.map((payment) => (
                <tr key={payment.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-[var(--foreground)]">
                      {payment.gateway_payment_id ?? payment.gateway_order_id ?? "—"}
                    </p>
                    <p className="text-xs text-[var(--foreground-subtle)]">via {payment.gateway_provider}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                    {formatAmount(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">{payment.discount_code || "—"}</td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {new Date(payment.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
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
  );
}
