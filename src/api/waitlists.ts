import { apiClient } from "@/api/client";
import type { WaitlistEntry, WaitlistPage, WaitlistStatus } from "@/types/waitlists";

export async function listWaitlists(filters: {
  eventId?: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: WaitlistStatus | "all";
  participationType?: string;
}): Promise<WaitlistPage> {
  const { data } = await apiClient.get<WaitlistPage>("/waitlists", {
    params: {
      event_id: filters.eventId,
      page: filters.page,
      page_size: filters.pageSize,
      search: filters.search || undefined,
      status: filters.status && filters.status !== "all" ? filters.status : undefined,
      participation_type: filters.participationType && filters.participationType !== "all" ? filters.participationType : undefined,
    },
  });
  return data;
}

export async function removeWaitlistEntry(entryId: string): Promise<WaitlistEntry> {
  const { data } = await apiClient.delete<WaitlistEntry>(`/waitlists/${entryId}`);
  return data;
}

export async function retryWaitlistEntry(entryId: string): Promise<WaitlistEntry> {
  const { data } = await apiClient.post<WaitlistEntry>(`/waitlists/${entryId}/retry`);
  return data;
}
