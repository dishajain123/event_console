import { apiClient } from "@/api/client";
import type { IncidentCreateIn, IncidentOut, IncidentPage, IncidentUpdateIn } from "@/types/incidents";

export interface IncidentFilters {
  eventId?: string;
  status?: string;
  severity?: string;
  category?: string;
  search?: string;
  mainCategoryId?: string;
  subCategoryId?: string;
  page?: number;
  pageSize?: number;
}

export async function listIncidents(filters: IncidentFilters = {}) {
  const { data } = await apiClient.get<IncidentPage>("/incidents", {
    params: {
      event_id: filters.eventId || undefined,
      status: filters.status || undefined,
      severity: filters.severity || undefined,
      category: filters.category || undefined,
      search: filters.search || undefined,
      main_category_id: filters.mainCategoryId || undefined,
      sub_category_id: filters.subCategoryId || undefined,
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 25,
    },
  });
  return data;
}
export async function getIncident(id: string) { const { data } = await apiClient.get<IncidentOut>(`/incidents/${id}`); return data; }
export async function createIncident(payload: IncidentCreateIn) { const { data } = await apiClient.post<IncidentOut>("/incidents", payload); return data; }
export async function updateIncident(id: string, payload: IncidentUpdateIn) { const { data } = await apiClient.patch<IncidentOut>(`/incidents/${id}`, payload); return data; }
