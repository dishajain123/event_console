import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveRefund, listPayments, listRefunds, requestRefund } from "@/api/payments";
import { useSessionStore } from "@/state/sessionStore";
import type { RefundRequestIn } from "@/types/payments";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export const paymentsQueryKeys = {
  payments: (eventId?: string) => ["payments", eventId ?? "all"] as const,
  refunds: (eventId?: string) => ["refunds", eventId ?? "all"] as const,
};

export function usePayments(eventId?: string) {
  const ready = useReady();
  return useQuery({
    queryKey: paymentsQueryKeys.payments(eventId),
    queryFn: () => listPayments(eventId),
    enabled: ready,
  });
}

export function useRefunds(eventId?: string) {
  const ready = useReady();
  return useQuery({
    queryKey: paymentsQueryKeys.refunds(eventId),
    queryFn: () => listRefunds(eventId),
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
