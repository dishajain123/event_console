import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSponsor, listSponsors, removeSponsor } from "@/api/sponsors";
import { useSessionStore } from "@/state/sessionStore";
import type { SponsorIn } from "@/types/sponsors";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventSponsors(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsors", "event", eventId],
    queryFn: () => listSponsors(eventId),
    enabled: ready && !!eventId,
  });
}

export function useAddSponsor(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SponsorIn) => addSponsor(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors", "event", eventId] }),
  });
}

export function useRemoveSponsor(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sponsorId: string) => removeSponsor(eventId, sponsorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsors", "event", eventId] }),
  });
}
