import { apiClient } from "@/api/client";
import type {
  StaffAssignmentCreateIn,
  StaffAssignmentHistoryOut,
  StaffAssignmentOut,
  StaffAssignmentReassignIn,
} from "@/types/staff";

export type StaffAssignmentPage = { items: StaffAssignmentOut[]; total: number; page: number; page_size: number };
export async function listStaffAssignments(eventId: string): Promise<StaffAssignmentPage> {
  const { data } = await apiClient.get<StaffAssignmentPage>(`/events/${eventId}/staff/assignments`, { params: { page: 1, page_size: 25 } });
  return data;
}

export async function createStaffAssignment(
  eventId: string,
  payload: StaffAssignmentCreateIn,
): Promise<StaffAssignmentOut> {
  const { data } = await apiClient.post<StaffAssignmentOut>(`/events/${eventId}/staff/assignments`, payload);
  return data;
}

export async function reassignStaffAssignment(
  eventId: string,
  assignmentId: string,
  payload: StaffAssignmentReassignIn,
): Promise<StaffAssignmentOut> {
  const { data } = await apiClient.post<StaffAssignmentOut>(
    `/events/${eventId}/staff/assignments/${assignmentId}/reassign`,
    payload,
  );
  return data;
}

export async function revokeStaffAssignment(eventId: string, assignmentId: string): Promise<StaffAssignmentOut> {
  const { data } = await apiClient.post<StaffAssignmentOut>(
    `/events/${eventId}/staff/assignments/${assignmentId}/revoke`,
  );
  return data;
}

export async function getStaffAssignmentHistory(
  eventId: string,
  assignmentId: string,
): Promise<StaffAssignmentHistoryOut[]> {
  const { data } = await apiClient.get<StaffAssignmentHistoryOut[]>(
    `/events/${eventId}/staff/assignments/${assignmentId}/history`,
  );
  return data;
}
