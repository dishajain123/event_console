import { apiClient } from "@/api/client";
import type { RegistrationOut, RegistrationPage, RegistrationStatus } from "@/types/registrations";

export async function listRegistrationsForEvent(eventId: string, filters: {
  page: number; pageSize: number; search?: string; status?: RegistrationStatus | "all"; participationType?: string;
}): Promise<RegistrationPage> {
  const { data } = await apiClient.get<RegistrationPage>("/registrations", {
    params: {
      event_id: eventId, page: filters.page, page_size: filters.pageSize,
      search: filters.search || undefined,
      registration_status: filters.status && filters.status !== "all" ? filters.status : undefined,
      participation_type: filters.participationType && filters.participationType !== "all" ? filters.participationType : undefined,
    },
  });
  return data;
}

export async function getRegistration(registrationId: string): Promise<RegistrationOut> {
  const { data } = await apiClient.get<RegistrationOut>(`/registrations/${registrationId}`);
  return data;
}

export async function approveRegistration(registrationId: string): Promise<RegistrationOut> {
  const { data } = await apiClient.post<RegistrationOut>(`/registrations/${registrationId}/approve`);
  return data;
}

export async function rejectRegistration(registrationId: string, reason: string): Promise<RegistrationOut> {
  const { data } = await apiClient.post<RegistrationOut>(`/registrations/${registrationId}/reject`, {
    reason,
  });
  return data;
}

export async function cancelRegistration(registrationId: string, reason?: string): Promise<RegistrationOut> {
  const { data } = await apiClient.post<RegistrationOut>(`/registrations/${registrationId}/cancel`, {
    reason,
  });
  return data;
}
