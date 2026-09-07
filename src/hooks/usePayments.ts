import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveRefund, listPaymentWebhooks, listPayments, listRefunds, requestRefund } from "@/api/payments";
import { useSessionStore } from "@/state/sessionStore";
import type { RefundRequestIn } from "@/types/payments";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export const paymentsQueryKeys = {
  payments: (filters?: object) => ["payments", filters ?? "all"] as const,
  refunds: (filters?: object) => ["refunds", filters ?? "all"] as const,
  webhooks: ["payment-webhooks"] as const,
};

export function usePayments(filters: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: string } = {}) {
  const ready = useReady();
  return useQuery({
    queryKey: paymentsQueryKeys.payments(filters),
    queryFn: () => listPayments(filters),
    enabled: ready,
  });
}

export function usePaymentWebhooks() {
  const ready = useReady();
  return useQuery({
    queryKey: paymentsQueryKeys.webhooks,
    queryFn: () => listPaymentWebhooks(),
    enabled: ready,
  });
}

export function useRefunds(filters: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: string } = {}) {
  const ready = useReady();
  return useQuery({
    queryKey: paymentsQueryKeys.refunds(filters),
    queryFn: () => listRefunds(filters),
    enabled: ready,
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RefundRequestIn) => requestRefund(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
    },
  });
}

export function useApproveRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ refundId, reason }: { refundId: string; reason?: string }) => approveRefund(refundId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
