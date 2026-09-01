import { apiClient } from "@/api/client";
import type { RegistrationOut } from "@/types/registrations";

export async function listRegistrationsForEvent(eventId: string): Promise<RegistrationOut[]> {
  const { data } = await apiClient.get<RegistrationOut[]>("/registrations", {
    params: { event_id: eventId },
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
