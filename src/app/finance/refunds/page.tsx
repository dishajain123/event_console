"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RotateCcw, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { RefundStatusBadge } from "@/components/finance/status-badges";
import { useApproveRefund, usePayments, useRefunds, useRequestRefund } from "@/hooks/usePayments";
import { useSessionStore } from "@/state/sessionStore";
import { canApproveRefund, canDraftRefund } from "@/lib/rbac";
import type { RefundOut } from "@/types/payments";

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

export default function RefundsPage() {
  const roles = useSessionStore((s) => s.roles);
  const { data: refunds, isLoading, isError, refetch } = useRefunds();
  const { data: payments } = usePayments();
  const requestRefund = useRequestRefund();
  const approveRefund = useApproveRefund();

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

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--foreground-muted)]">
          Drafting and approving are deliberately separate roles — a two-person control on every refund.
        </p>
        {canDraftRefund(roles) && (
          <Button onClick={() => setDraftOpen(true)}>
            <Plus className="h-4 w-4" />
            Draft refund
          </Button>
        )}
      </div>

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !refunds || refunds.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={RotateCcw}
              title="No refund requests"
              description="Drafted refunds will appear here, waiting for Finance Admin approval."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Reason</th>
                <th className="px-6 py-3 font-medium">Requested</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {refunds.map((refund) => (
                <tr key={refund.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">{formatAmount(refund.amount)}</td>
                  <td className="px-6 py-4 max-w-[280px] truncate text-[var(--foreground-muted)]">
                    {refund.reason || "—"}
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {new Date(refund.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <RefundStatusBadge status={refund.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {refund.status === "pending_admin_approval" && canApproveRefund(roles) && (
                      <Button size="sm" variant="outline" onClick={() => setApproveTarget(refund)}>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      {draftOpen && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setDraftOpen(false)} />
          <GlassPanel strong className="rise-in relative w-full max-w-md p-6">
            <h3 className="mb-4 text-base font-semibold text-[var(--foreground)]">Draft a refund</h3>
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
          </GlassPanel>
        </div>
      )}

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
