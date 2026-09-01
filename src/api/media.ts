import { apiClient } from "@/api/client";
import type { MediaOut, MediaUploadIn } from "@/types/media";

export async function listEventMedia(eventId: string): Promise<MediaOut[]> {
  const { data } = await apiClient.get<MediaOut[]>(`/events/${eventId}/media`);
  return data;
}

export async function uploadMedia(eventId: string, payload: MediaUploadIn): Promise<MediaOut> {
  const { data } = await apiClient.post<MediaOut>(`/events/${eventId}/media`, payload);
  return data;
}

export async function publishMedia(mediaId: string, isPublished: boolean): Promise<MediaOut> {
  const { data } = await apiClient.post<MediaOut>(`/media/${mediaId}/publish`, { is_published: isPublished });
  return data;
}
