"use client";

import { useState } from "react";
import { Search, Receipt } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PaymentStatusBadge } from "@/components/finance/status-badges";
import { usePayments } from "@/hooks/usePayments";
import { useEvents } from "@/hooks/useEvents";
import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/types/payments";

const PAGE_SIZE = 25;

function formatAmount(amount: string | number, currency: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

/** Same `usePayments` hook and filter params as before. */
export default function TransactionsPage() {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: events } = useEvents();
  const { data: paymentPage, isLoading, isError, refetch } = usePayments({
    eventId: eventFilter === "all" ? undefined : eventFilter,
    page,
    pageSize: PAGE_SIZE,
    search,
    status: statusFilter,
  });
  const payments = paymentPage?.items;
  const filtered = payments ?? [];
  const isFiltered = eventFilter !== "all" || statusFilter !== "all" || search !== "";
  const totalPages = paymentPage ? Math.max(1, Math.ceil(paymentPage.total / PAGE_SIZE)) : 1;

  const totalVerified = filtered
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (typeof p.amount === "string" ? parseFloat(p.amount) : p.amount), 0);

  return (
    <div>
      <Header title="Transactions" />

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setEventFilter("all");
          setStatusFilter("all");
          setSearch("");
          setPage(1);
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            placeholder="Search by gateway transaction ID…"
            className="pl-10"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
        <Select
          className="w-56"
          value={eventFilter}
          onChange={(e) => {
            setPage(1);
            setEventFilter(e.target.value);
          }}
        >
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
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as PaymentStatus | "all");
          }}
        >
          <option value="all">All statuses</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FilterBar>

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="fade-in mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--success-soft)] px-4 py-2.5 text-sm text-[var(--success)]">
          <Receipt className="h-4 w-4" />
          <span className="font-medium">{formatAmount(totalVerified, filtered[0]?.currency ?? "INR")}</span>
          verified across {filtered.filter((p) => p.status === "verified").length} of {filtered.length} shown
        </div>
      )}

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Gateway Transaction</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Discount</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <p className="font-mono text-xs text-[var(--foreground)]">
                        {payment.gateway_payment_id ?? payment.gateway_order_id ?? "—"}
                      </p>
                      <p className="text-xs text-[var(--foreground-subtle)]">via {payment.gateway_provider}</p>
                    </TableCell>
                    <TableCell className="font-medium text-[var(--foreground)]">
                      {formatAmount(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{payment.discount_code || "—"}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">
                      {new Date(payment.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={paymentPage?.total} onPageChange={setPage} />
      </GlassPanel>
    </div>
  );
}