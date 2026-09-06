import { apiClient } from "@/api/client";
import type { VolunteerApplication, VolunteerApplicationStatus, VolunteerApplicationType } from "@/types/volunteers";

export async function listVolunteerApplications(params?: { event_id?: string; status?: VolunteerApplicationStatus; search?: string; application_type?: VolunteerApplicationType }) {
  const { data } = await apiClient.get<VolunteerApplication[]>("/volunteers/applications", { params });
  return data;
}

export async function updateVolunteerStatus(id: string, status: VolunteerApplicationStatus) {
  const { data } = await apiClient.patch<VolunteerApplication>(`/volunteers/applications/${id}/status`, { status });
  return data;
}

export async function activateVolunteer(id: string) {
  const { data } = await apiClient.post<VolunteerApplication>(`/volunteers/applications/${id}/activate`);
  return data;
}
