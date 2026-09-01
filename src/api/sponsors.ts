import { apiClient } from "@/api/client";
import type { SponsorIn, SponsorOut } from "@/types/sponsors";

export async function listSponsors(eventId: string): Promise<SponsorOut[]> {
  const { data } = await apiClient.get<SponsorOut[]>(`/events/${eventId}/sponsors`);
  return data;
}

export async function addSponsor(eventId: string, payload: SponsorIn): Promise<SponsorOut> {
  const { data } = await apiClient.post<SponsorOut>(`/events/${eventId}/sponsors`, payload);
  return data;
}

export async function removeSponsor(eventId: string, sponsorId: string): Promise<void> {
  await apiClient.delete(`/events/${eventId}/sponsors/${sponsorId}`);
}
