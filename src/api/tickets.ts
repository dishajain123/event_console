import { apiClient } from "@/api/client";
import type { CheckInOut } from "@/types/tickets";
export type CheckInPage = { items: CheckInOut[]; total: number; page: number; page_size: number };

export async function listCheckIns(eventId: string, venueId?: string, page = 1, pageSize = 25): Promise<CheckInPage> {
  const { data } = await apiClient.get<CheckInPage>("/check-ins", {
    params: { event_id: eventId, page, page_size: pageSize, ...(venueId ? { venue_id: venueId } : {}) },
  });
  return data;
}
