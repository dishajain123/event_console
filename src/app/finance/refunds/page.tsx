"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RotateCcw, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { Dialog } from "@/components/ui/dialog";
import { RefundStatusBadge } from "@/components/finance/status-badges";
import { useApproveRefund, usePayments, useRefunds, useRequestRefund } from "@/hooks/usePayments";
import { useSessionStore } from "@/state/sessionStore";
import { canApproveRefund, canDraftRefund } from "@/lib/rbac";
import { REFUND_STATUS_LABELS, type RefundOut, type RefundStatus } from "@/types/payments";

const PAGE_SIZE = 25;

const draftSchema = z.object({
  payment_id: z.string().min(1, "Select a verified payment"),
  amount: z.string().optional(),
  reason: z.string().min(3, "A reason is required"),
});
type DraftFormValues = z.infer<typeof draftSchema>;

function formatAmount(amount: string | number) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

/**
 * Same hooks (`useRefunds`, `usePayments`, `useRequestRefund`,
 * `useApproveRefund`) and mutation payloads as before. The draft-refund
 * modal now uses the shared [Dialog] component instead of a bespoke
 * `fixed inset-0` overlay, which gets it Escape-to-close and
 * body-scroll-lock for free. Added a status filter and real pagination
 * (`useRefunds` already returns `total`) since this list has no way to
 * narrow down or page through refunds beyond the first 25.
 */
export default function RefundsPage() {
  const roles = useSessionStore((s) => s.roles);
  const [statusFilter, setStatusFilter] = useState<RefundStatus | "all">("all");
  const [page, setPage] = useState(1);
  const { data: refundPage, isLoading, isError, refetch } = useRefunds({ page, pageSize: PAGE_SIZE, status: statusFilter });
  const { data: paymentPage } = usePayments();
  const refunds = refundPage?.items;
  const payments = paymentPage?.items;
  const requestRefund = useRequestRefund();
  const approveRefund = useApproveRefund();
  const isFiltered = statusFilter !== "all";
  const totalPages = refundPage ? Math.max(1, Math.ceil(refundPage.total / PAGE_SIZE)) : 1;

  const [draftOpen, setDraftOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<RefundOut | null>(null);

  const verifiedPayments = useMemo(
    () => (payments ?? []).filter((p) => p.status === "verified"),
    [payments],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DraftFormValues>({ resolver: zodResolver(draftSchema) });

  async function onDraftSubmit(values: DraftFormValues) {
    try {
      await requestRefund.mutateAsync({
        payment_id: values.payment_id,
        amount: values.amount ? Number(values.amount) : null,
        reason: values.reason,
      });
      toast.success("Refund drafted", { description: "Waiting for a Finance Admin to approve." });
      reset();
      setDraftOpen(false);
    } catch (err) {
      toast.error("Couldn't draft refund", { description: (err as { message?: string })?.message });
    }
  }

  async function handleApprove(reason?: string) {
    if (!approveTarget) return;
    await approveRefund.mutateAsync({ refundId: approveTarget.id, reason });
    toast.success("Refund approved");
  }

  return (
    <div>
      <Header title="Refunds" />
      <PageToolbar
        description="Drafting and approving are deliberately separate roles — a two-person control on every refund."
        actions={
          canDraftRefund(roles) ? (
            <Button onClick={() => setDraftOpen(true)}>
              <Plus className="h-4 w-4" />
              Draft refund
            </Button>
          ) : undefined
        }
      />

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setStatusFilter("all");
          setPage(1);
        }}
      >
        <Select
          className="w-52"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as RefundStatus | "all");
          }}
        >
          <option value="all">All statuses</option>
          {Object.entries(REFUND_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FilterBar>

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !refunds || refunds.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={RotateCcw}
              title={isFiltered ? "No refunds match this filter" : "No refund requests"}
              description="Drafted refunds will appear here, waiting for Finance Admin approval."
            />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Payment / gateway refund</TableHeaderCell>
                  <TableHeaderCell>Reason</TableHeaderCell>
                  <TableHeaderCell>Requested</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Reconciliation</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {refunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium text-[var(--foreground)]">{formatAmount(refund.amount)}</TableCell>
                    <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">
                      <div>{refund.payment_id.slice(0, 12)}</div>
                      <div>{refund.gateway_refund_id ?? "Provider ref pending"}</div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-[var(--foreground-muted)]">
                      {refund.reason || "—"}
                    </TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">
                      {new Date(refund.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <RefundStatusBadge status={refund.status} />
                    </TableCell>
                    <TableCell className="text-xs text-[var(--foreground-muted)]">
                      {refund.reconciliation_error ?? `${refund.reconciliation_attempts} attempt(s)`}
                    </TableCell>
                    <TableCell>
                      {refund.status === "pending_admin_approval" && canApproveRefund(roles) && (
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => setApproveTarget(refund)}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={refundPage?.total} onPageChange={setPage} />
      </GlassPanel>

      <Dialog open={draftOpen} onClose={() => setDraftOpen(false)} title="Draft a refund" size="sm">
        <form onSubmit={handleSubmit(onDraftSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Verified payment
            </label>
            <Select {...register("payment_id")}>
              <option value="">Select a payment…</option>
              {verifiedPayments.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatAmount(p.amount)} — {p.gateway_payment_id ?? p.id.slice(0, 8)}
                </option>
              ))}
            </Select>
            {errors.payment_id && <p className="mt-1 text-xs text-[var(--danger)]">{errors.payment_id.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
              Amount <span className="text-[var(--foreground-subtle)]">(optional — defaults to full amount)</span>
            </label>
            <Input type="number" placeholder="Full payment amount" {...register("amount")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Reason</label>
            <Input placeholder="Why this refund is needed" {...register("reason")} />
            {errors.reason && <p className="mt-1 text-xs text-[var(--danger)]">{errors.reason.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDraftOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={requestRefund.isPending}>
              Submit draft
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmActionDialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title={`Approve refund of ${approveTarget ? formatAmount(approveTarget.amount) : ""}?`}
        description="This triggers the actual refund with the payment gateway."
        confirmLabel="Approve refund"
        onConfirm={handleApprove}
      />
    </div>
  );
}