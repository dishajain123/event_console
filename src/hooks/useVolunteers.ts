import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activateVolunteer, listVolunteerApplications, updateVolunteerStatus } from "@/api/volunteers";
import type { VolunteerApplicationStatus, VolunteerApplicationType } from "@/types/volunteers";

/**
 * Same `listVolunteerApplications` call and params as before. `select`
 * that discarded everything but `items` removed — this hook has this
 * one call site (Volunteers), so exposing the full page is safe;
 * `.data?.items` replaces the old plain-array `.data`, and
 * `.data?.total` drives real pagination.
 */
export function useVolunteerApplications(params: {
  event_id?: string;
  status?: VolunteerApplicationStatus;
  search?: string;
  application_type?: VolunteerApplicationType;
  page?: number;
  page_size?: number;
}) {
  return useQuery({ queryKey: ["volunteers", params], queryFn: () => listVolunteerApplications(params) });
}

export function useVolunteerStatusMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: VolunteerApplicationStatus }) => updateVolunteerStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ["volunteers"] }),
  });
}

export function useActivateVolunteer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateVolunteer(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["volunteers"] }),
  });
}