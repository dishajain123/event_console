import { apiClient } from "@/api/client";
import type { MediaOut, MediaUploadIn } from "@/types/media";

export type MediaPage = { items: MediaOut[]; total: number; page: number; page_size: number };
export async function listEventMedia(eventId: string): Promise<MediaPage> {
  const { data } = await apiClient.get<MediaPage>(`/events/${eventId}/media`, { params: { page: 1, page_size: 25 } });
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
