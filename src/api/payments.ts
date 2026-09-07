import { apiClient } from "@/api/client";
import type { PaymentPage, PaymentWebhookInboxOut, RefundOut, RefundPage, RefundRequestIn } from "@/types/payments";

export async function listPayments(filters: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: string } = {}): Promise<PaymentPage> {
  const { data } = await apiClient.get<PaymentPage>("/payments", {
    params: { event_id: filters.eventId, page: filters.page ?? 1, page_size: filters.pageSize ?? 25, search: filters.search || undefined, payment_status: filters.status && filters.status !== "all" ? filters.status : undefined },
  });
  return data;
}

export async function listRefunds(filters: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: string } = {}): Promise<RefundPage> {
  const { data } = await apiClient.get<RefundPage>("/refunds", {
    params: { event_id: filters.eventId, page: filters.page ?? 1, page_size: filters.pageSize ?? 25, search: filters.search || undefined, refund_status: filters.status && filters.status !== "all" ? filters.status : undefined },
  });
  return data;
}

export async function listPaymentWebhooks(limit = 100): Promise<PaymentWebhookInboxOut[]> {
  const { data } = await apiClient.get<PaymentWebhookInboxOut[]>("/payments/webhooks", { params: { limit } });
  return data;
}

export async function requestRefund(payload: RefundRequestIn): Promise<RefundOut> {
  const { data } = await apiClient.post<RefundOut>("/refunds", payload);
  return data;
}

export async function approveRefund(refundId: string, reason?: string): Promise<RefundOut> {
  const { data } = await apiClient.post<RefundOut>(`/refunds/${refundId}/approve`, { reason });
  return data;
}
