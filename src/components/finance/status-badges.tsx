import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_LABELS, REFUND_STATUS_LABELS, type PaymentStatus, type RefundStatus } from "@/types/payments";

const PAYMENT_TONE: Record<PaymentStatus, "neutral" | "success" | "danger" | "info"> = {
  initiated: "info",
  verified: "success",
  failed: "danger",
  refunded: "neutral",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}

const REFUND_TONE: Record<RefundStatus, "neutral" | "warning" | "success" | "danger" | "info"> = {
  draft: "neutral",
  pending_admin_approval: "warning",
  approved: "info",
  rejected: "danger",
  processing: "info",
  processed: "success",
  failed: "danger",
};

export function RefundStatusBadge({ status }: { status: RefundStatus }) {
  return <Badge tone={REFUND_TONE[status]}>{REFUND_STATUS_LABELS[status]}</Badge>;
}
