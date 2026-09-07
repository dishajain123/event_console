import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignVolunteer, createVolunteerShift, getShiftAttendance, listEligibleVolunteers, listShiftAssignments, listVolunteerShifts, updateShiftAssignment } from "@/api/volunteerShifts";
import type { VolunteerAssignmentStatus, VolunteerShiftStatus } from "@/types/volunteerShifts";
import { useSessionStore } from "@/state/sessionStore";

function ready() { const s = useSessionStore.getState(); return s.hydrated && !!s.user; }
export function useVolunteerShifts(params: { eventId?: string; page?: number; search?: string; status?: VolunteerShiftStatus } = {}) {
  return useQuery({ queryKey: ["volunteer-shifts", params], queryFn: () => listVolunteerShifts(params), enabled: ready() });
}
export function useCreateVolunteerShift() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ eventId, payload }: { eventId: string; payload: Parameters<typeof createVolunteerShift>[1] }) => createVolunteerShift(eventId, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["volunteer-shifts"] }) }); }
export function useShiftAssignments(shiftId: string, page = 1) { return useQuery({ queryKey: ["volunteer-shift-assignments", shiftId, page], queryFn: () => listShiftAssignments(shiftId, { page }), enabled: ready() && !!shiftId }); }
export function useUpdateShiftAssignment() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: string; status: VolunteerAssignmentStatus }) => updateShiftAssignment(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ["volunteer-shift-assignments"] }) }); }
export function useShiftAttendance(assignmentId: string, enabled = false) { return useQuery({ queryKey: ["volunteer-attendance", assignmentId], queryFn: () => getShiftAttendance(assignmentId), enabled: ready() && enabled && !!assignmentId }); }
export function useEligibleVolunteers(shiftId: string, enabled = false) { return useQuery({ queryKey: ["volunteer-eligible", shiftId], queryFn: () => listEligibleVolunteers(shiftId), enabled: ready() && enabled && !!shiftId }); }
export function useAssignVolunteer() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ shiftId, userId }: { shiftId: string; userId: string }) => assignVolunteer(shiftId, userId), onSuccess: (_, variables) => { qc.invalidateQueries({ queryKey: ["volunteer-shift-assignments", variables.shiftId] }); qc.invalidateQueries({ queryKey: ["volunteer-shifts"] }); } }); }
