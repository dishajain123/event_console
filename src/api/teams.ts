import { apiClient } from "@/api/client";
import type { TeamOut } from "@/types/teams";

export type TeamPage = { items: TeamOut[]; total: number; page: number; page_size: number };
export async function listTeamsForEvent(eventId: string): Promise<TeamPage> {
  const { data } = await apiClient.get<TeamPage>("/teams", { params: { event_id: eventId, page: 1, page_size: 25 } });
  return data;
}

export async function approveTeam(teamId: string): Promise<TeamOut> {
  const { data } = await apiClient.post<TeamOut>(`/teams/${teamId}/approve`);
  return data;
}
