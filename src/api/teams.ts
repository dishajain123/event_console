import { apiClient } from "@/api/client";
import type { TeamOut } from "@/types/teams";

export async function listTeamsForEvent(eventId: string): Promise<TeamOut[]> {
  const { data } = await apiClient.get<TeamOut[]>("/teams", { params: { event_id: eventId } });
  return data;
}

export async function approveTeam(teamId: string): Promise<TeamOut> {
  const { data } = await apiClient.post<TeamOut>(`/teams/${teamId}/approve`);
  return data;
}
