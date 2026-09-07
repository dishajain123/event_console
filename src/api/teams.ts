import { apiClient } from "@/api/client";
import type { TeamJoinRequestOut, TeamMemberOut, TeamOut } from "@/types/teams";

export type TeamPage = { items: TeamOut[]; total: number; page: number; page_size: number };
export async function listTeamsForEvent(eventId: string): Promise<TeamPage> {
  const { data } = await apiClient.get<TeamPage>("/teams", { params: { event_id: eventId, page: 1, page_size: 25 } });
  return data;
}

export async function approveTeam(teamId: string): Promise<TeamOut> {
  const { data } = await apiClient.post<TeamOut>(`/teams/${teamId}/approve`);
  return data;
}

export async function listTeamMembers(teamId: string): Promise<TeamMemberOut[]> {
  const { data } = await apiClient.get<TeamMemberOut[]>(`/teams/${teamId}/members`);
  return data;
}

export async function listJoinRequests(teamId: string): Promise<TeamJoinRequestOut[]> {
  const { data } = await apiClient.get<TeamJoinRequestOut[]>(`/teams/${teamId}/join-requests`);
  return data;
}

export async function respondToJoinRequest(teamId: string, requestId: string, accept: boolean): Promise<TeamJoinRequestOut> {
  const { data } = await apiClient.post<TeamJoinRequestOut>(`/teams/${teamId}/join-requests/${requestId}/respond`, { accept });
  return data;
}

export async function removeTeamMember(teamId: string, memberId: string): Promise<TeamMemberOut> {
  const { data } = await apiClient.post<TeamMemberOut>(`/teams/${teamId}/members/${memberId}/remove`);
  return data;
}

export async function setTeamMemberRole(teamId: string, memberId: string, role: "manager" | "member"): Promise<TeamMemberOut> {
  const { data } = await apiClient.post<TeamMemberOut>(`/teams/${teamId}/members/${memberId}/role`, { role });
  return data;
}

export async function assignTeamManager(teamId: string, userId: string | null): Promise<TeamOut> {
  const { data } = await apiClient.post<TeamOut>(`/teams/${teamId}/manager`, { user_id: userId });
  return data;
}
