import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getIncident, listIncidents, updateIncident } from "@/api/incidents";
import { useSessionStore } from "@/state/sessionStore";
import type { IncidentUpdateIn } from "@/types/incidents";

export function useIncidents(filters: { eventId?: string; status?: string; severity?: string; category?: string; search?: string; page?: number; pageSize?: number } = {}) {
  const ready = useSessionStore((s) => s.hydrated && !!s.user);
  return useQuery({ queryKey: ["incidents", filters], queryFn: () => listIncidents(filters), enabled: ready });
}
export function useIncident(id: string | null) {
  const ready = useSessionStore((s) => s.hydrated && !!s.user);
  return useQuery({ queryKey: ["incidents", id], queryFn: () => getIncident(id!), enabled: ready && !!id });
}
export function useUpdateIncident(id: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: IncidentUpdateIn) => updateIncident(id, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["incidents"] }); queryClient.invalidateQueries({ queryKey: ["reports"] }); } });
}
