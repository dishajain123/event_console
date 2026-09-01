import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveTeam, listTeamsForEvent } from "@/api/teams";
import { useSessionStore } from "@/state/sessionStore";

export const teamsQueryKeys = {
  forEvent: (eventId: string) => ["teams", "event", eventId] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventTeams(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: teamsQueryKeys.forEvent(eventId),
    queryFn: () => listTeamsForEvent(eventId),
    enabled: ready && !!eventId,
  });
}

export function useApproveTeam(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => approveTeam(teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: teamsQueryKeys.forEvent(eventId) }),
  });
}
