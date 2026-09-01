import { apiClient } from "@/api/client";
import type { PaymentOut, RefundOut, RefundRequestIn } from "@/types/payments";

export async function listPayments(eventId?: string): Promise<PaymentOut[]> {
  const { data } = await apiClient.get<PaymentOut[]>("/payments", {
    params: eventId ? { event_id: eventId } : undefined,
  });
  return data;
}

export async function listRefunds(eventId?: string): Promise<RefundOut[]> {
  const { data } = await apiClient.get<RefundOut[]>("/refunds", {
    params: eventId ? { event_id: eventId } : undefined,
  });
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
