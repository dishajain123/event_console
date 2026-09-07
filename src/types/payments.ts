/** Mirrors app/modules/payments/schemas.py + models.py status enums. */

export type PaymentStatus = "initiated" | "verified" | "failed" | "refunded";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  initiated: "Initiated",
  verified: "Verified",
  failed: "Failed",
  refunded: "Refunded",
};

export interface PaymentOut {
  id: string;
  event_id: string;
  registration_id: string;
  user_id: string;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  gateway_provider: string;
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  discount_code: string | null;
  verified_at: string | null;
  captured_at: string | null;
  created_at: string;
  updated_at: string;
  reconciliation_status: string;
  reconciliation_attempts: number;
  last_reconciled_at: string | null;
  reconciliation_error: string | null;
}

export interface PaymentPage {
  items: PaymentOut[];
  total: number;
  page: number;
  page_size: number;
}

export type RefundStatus =
  | "draft"
  | "pending_admin_approval"
  | "approved"
  | "rejected"
  | "processing"
  | "processed"
  | "failed";

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  draft: "Draft",
  pending_admin_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  processing: "Processing",
  processed: "Processed",
  failed: "Failed",
};

export interface RefundOut {
  id: string;
  payment_id: string;
  requested_by: string;
  amount: string | number;
  reason: string | null;
  failure_reason: string | null;
  status: RefundStatus;
  approved_by: string | null;
  rejected_by: string | null;
  gateway_refund_id: string | null;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  reconciliation_attempts: number;
  last_reconciled_at: string | null;
  reconciliation_error: string | null;
}

export interface RefundPage {
  items: RefundOut[];
  total: number;
  page: number;
  page_size: number;
}

export type WebhookProcessingStatus = "received" | "processing" | "processed" | "failed";

export interface PaymentWebhookInboxOut {
  id: string;
  provider_event_id: string;
  provider: string;
  event_type: string;
  received_at: string;
  processing_status: WebhookProcessingStatus;
  attempts: number;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefundRequestIn {
  payment_id: string;
  amount?: string | number | null;
  reason?: string | null;
}
