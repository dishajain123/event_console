import { apiClient } from "@/api/client";
import type { EligibleVolunteerPage, VolunteerAssignmentPage, VolunteerAssignmentStatus, VolunteerAttendance, VolunteerShift, VolunteerShiftPage, VolunteerShiftStatus } from "@/types/volunteerShifts";

export async function listVolunteerShifts(params: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: VolunteerShiftStatus } = {}) {
  const { data } = await apiClient.get<VolunteerShiftPage>("/volunteer-shifts", { params: { event_id: params.eventId || undefined, page: params.page ?? 1, page_size: params.pageSize ?? 25, search: params.search || undefined, status: params.status || undefined } });
  return data;
}
export async function createVolunteerShift(eventId: string, payload: { title: string; location?: string; starts_at: string; ends_at: string; required_count: number; required_role?: string; status: VolunteerShiftStatus }) {
  const { data } = await apiClient.post<VolunteerShift>("/volunteer-shifts", payload, { params: { event_id: eventId } }); return data;
}
export async function listShiftAssignments(shiftId: string, params: { page?: number; pageSize?: number; status?: VolunteerAssignmentStatus } = {}) {
  const { data } = await apiClient.get<VolunteerAssignmentPage>(`/volunteer-shifts/${shiftId}/assignments`, { params: { page: params.page ?? 1, page_size: params.pageSize ?? 25, status: params.status || undefined } }); return data;
}
export async function updateShiftAssignment(id: string, status: VolunteerAssignmentStatus) { const { data } = await apiClient.patch(`/volunteer-shifts/assignments/${id}/status`, { status }); return data; }
export async function getShiftAttendance(id: string) { const { data } = await apiClient.get<VolunteerAttendance | null>(`/volunteer-shifts/assignments/${id}/attendance`); return data; }
export async function listEligibleVolunteers(shiftId: string) { const { data } = await apiClient.get<EligibleVolunteerPage>(`/volunteer-shifts/${shiftId}/eligible-volunteers`, { params: { page: 1, page_size: 100 } }); return data; }
export async function assignVolunteer(shiftId: string, userId: string) { const { data } = await apiClient.post(`/volunteer-shifts/${shiftId}/assign/${userId}`); return data; }
