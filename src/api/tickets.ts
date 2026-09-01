import { apiClient } from "@/api/client";
import type { CheckInOut } from "@/types/tickets";

export async function listCheckIns(eventId: string, venueId?: string): Promise<CheckInOut[]> {
  const { data } = await apiClient.get<CheckInOut[]>("/check-ins", {
    params: { event_id: eventId, ...(venueId ? { venue_id: venueId } : {}) },
  });
  return data;
}
