import { useQuery } from "@tanstack/react-query";
import { listCheckIns } from "@/api/tickets";
import { useSessionStore } from "@/state/sessionStore";

export function useCheckIns(eventId: string, venueId?: string, page = 1) {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);

  return useQuery({
    queryKey: ["check-ins", eventId, venueId ?? "all", page],
    queryFn: () => listCheckIns(eventId, venueId, page),
    select: (result) => result.items,
    enabled: hydrated && !!user && !!eventId,
    refetchInterval: 15_000, // day-of ops screen — keep it near-live
  });
}
