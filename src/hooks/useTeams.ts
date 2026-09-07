import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveTeam, assignTeamManager, listJoinRequests, listTeamMembers, removeTeamMember, respondToJoinRequest, setTeamMemberRole, listTeamsForEvent } from "@/api/teams";
import type { TeamJoinRequestOut, TeamMemberOut } from "@/types/teams";
import { useSessionStore } from "@/state/sessionStore";

export const teamsQueryKeys = {
  forEvent: (eventId: string) => ["teams", "event", eventId] as const,
  members: (teamId: string) => ["teams", "members", teamId] as const,
  requests: (teamId: string) => ["teams", "join-requests", teamId] as const,
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
    select: (result) => result.items,
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

export function useTeamMembers(teamId: string) {
  const ready = useReady();
  return useQuery<TeamMemberOut[]>({ queryKey: teamsQueryKeys.members(teamId), queryFn: () => listTeamMembers(teamId), enabled: ready && !!teamId });
}

export function useTeamJoinRequests(teamId: string) {
  const ready = useReady();
  return useQuery<TeamJoinRequestOut[]>({ queryKey: teamsQueryKeys.requests(teamId), queryFn: () => listJoinRequests(teamId), enabled: ready && !!teamId });
}

export function useTeamManagement(teamId: string, eventId: string) {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: teamsQueryKeys.forEvent(eventId) });
    queryClient.invalidateQueries({ queryKey: teamsQueryKeys.members(teamId) });
    queryClient.invalidateQueries({ queryKey: teamsQueryKeys.requests(teamId) });
  };
  return {
    respond: useMutation({ mutationFn: ({ requestId, accept }: { requestId: string; accept: boolean }) => respondToJoinRequest(teamId, requestId, accept), onSuccess: refresh }),
    remove: useMutation({ mutationFn: (memberId: string) => removeTeamMember(teamId, memberId), onSuccess: refresh }),
    setRole: useMutation({ mutationFn: ({ memberId, role }: { memberId: string; role: "manager" | "member" }) => setTeamMemberRole(teamId, memberId, role), onSuccess: refresh }),
    assignManager: useMutation({ mutationFn: (userId: string | null) => assignTeamManager(teamId, userId), onSuccess: refresh }),
  };
}
