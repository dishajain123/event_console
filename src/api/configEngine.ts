import { apiClient } from "@/api/client";
import type {
  EventConfigurationIn,
  EventConfigurationOut,
  EventFieldSchemaIn,
  EventFieldSchemaOut,
  ValidateRegistrationIn,
  ValidationResultOut,
} from "@/types/configEngine";

export async function getConfiguration(eventId: string): Promise<EventConfigurationOut | null> {
  const { data } = await apiClient.get<EventConfigurationOut | null>(
    `/events/${eventId}/configuration`,
  );
  return data;
}

export async function upsertConfiguration(
  eventId: string,
  payload: EventConfigurationIn,
): Promise<EventConfigurationOut> {
  const { data } = await apiClient.put<EventConfigurationOut>(
    `/events/${eventId}/configuration`,
    payload,
  );
  return data;
}

export async function getFieldSchema(
  eventId: string,
  participationType: string,
): Promise<EventFieldSchemaOut | null> {
  const { data } = await apiClient.get<EventFieldSchemaOut | null>(
    `/events/${eventId}/field-schema/${encodeURIComponent(participationType)}`,
  );
  return data;
}

export async function upsertFieldSchema(
  eventId: string,
  payload: EventFieldSchemaIn,
): Promise<EventFieldSchemaOut> {
  const { data } = await apiClient.put<EventFieldSchemaOut>(
    `/events/${eventId}/field-schema`,
    payload,
  );
  return data;
}

export async function validateRegistration(
  eventId: string,
  payload: ValidateRegistrationIn,
): Promise<ValidationResultOut> {
  const { data } = await apiClient.post<ValidationResultOut>(
    `/events/${eventId}/configuration/validate`,
    payload,
  );
  return data;
}
