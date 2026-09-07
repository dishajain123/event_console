import { apiClient } from "@/api/client";
import type { EventOut } from "@/types/events";
import type { EventTemplate, EventTemplateDateInput, EventTemplatePage } from "@/types/eventTemplates";

export async function listEventTemplates(params: { page?: number; search?: string; includeArchived?: boolean } = {}): Promise<EventTemplatePage> {
  const { data } = await apiClient.get<EventTemplatePage>("/events/templates", {
    params: { page: params.page ?? 1, page_size: 25, search: params.search || undefined, include_archived: params.includeArchived || undefined },
  });
  return data;
}

export async function createEventTemplate(payload: { name: string; description?: string | null; source_event_id: string }): Promise<EventTemplate> {
  const { data } = await apiClient.post<EventTemplate>("/events/templates", payload);
  return data;
}

export async function updateEventTemplate(templateId: string, payload: { name?: string; description?: string | null }): Promise<EventTemplate> {
  const { data } = await apiClient.patch<EventTemplate>(`/events/templates/${templateId}`, payload);
  return data;
}

export async function archiveEventTemplate(templateId: string): Promise<EventTemplate> {
  const { data } = await apiClient.post<EventTemplate>(`/events/templates/${templateId}/archive`);
  return data;
}

export async function deleteEventTemplate(templateId: string): Promise<void> {
  await apiClient.delete(`/events/templates/${templateId}`);
}

export async function createEventFromTemplate(templateId: string, payload: EventTemplateDateInput): Promise<EventOut> {
  const { data } = await apiClient.post<EventOut>(`/events/templates/${templateId}/events`, payload);
  return data;
}

export async function duplicateEvent(eventId: string, payload: EventTemplateDateInput): Promise<EventOut> {
  const { data } = await apiClient.post<EventOut>(`/events/${eventId}/duplicate`, payload);
  return data;
}
