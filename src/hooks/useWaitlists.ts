import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listWaitlists, removeWaitlistEntry, retryWaitlistEntry } from "@/api/waitlists";
import type { WaitlistStatus } from "@/types/waitlists";
import { useSessionStore } from "@/state/sessionStore";

export function useEventWaitlists(eventId: string, filters: { page: number; pageSize: number; search?: string; status?: WaitlistStatus | "all"; participationType?: string }) {
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  return useQuery({
    queryKey: ["waitlists", eventId, filters],
    queryFn: () => listWaitlists({ eventId, ...filters }),
    enabled: hydrated && !!user && !!eventId,
  });
}

export function useRemoveWaitlistEntry(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlists", eventId] }),
  });
}

export function useRetryWaitlistEntry(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryWaitlistEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["waitlists", eventId] }),
  });
}
