import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStaffAssignment,
  getStaffAssignmentHistory,
  listStaffAssignments,
  reassignStaffAssignment,
  revokeStaffAssignment,
} from "@/api/staff";
import { useSessionStore } from "@/state/sessionStore";
import type { StaffAssignmentCreateIn, StaffAssignmentReassignIn } from "@/types/staff";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export const staffQueryKeys = {
  forEvent: (eventId: string) => ["staff", "event", eventId] as const,
  history: (eventId: string, assignmentId: string) => ["staff", "history", eventId, assignmentId] as const,
};

export function useStaffAssignments(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: staffQueryKeys.forEvent(eventId),
    queryFn: () => listStaffAssignments(eventId),
    enabled: ready && !!eventId,
  });
}

export function useCreateStaffAssignment(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StaffAssignmentCreateIn) => createStaffAssignment(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffQueryKeys.forEvent(eventId) }),
  });
}

export function useReassignStaffAssignment(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: string; payload: StaffAssignmentReassignIn }) =>
      reassignStaffAssignment(eventId, assignmentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffQueryKeys.forEvent(eventId) }),
  });
}

export function useRevokeStaffAssignment(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => revokeStaffAssignment(eventId, assignmentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffQueryKeys.forEvent(eventId) }),
  });
}

export function useStaffAssignmentHistory(eventId: string, assignmentId: string | null) {
  const ready = useReady();
  return useQuery({
    queryKey: staffQueryKeys.history(eventId, assignmentId ?? ""),
    queryFn: () => getStaffAssignmentHistory(eventId, assignmentId as string),
    enabled: ready && !!eventId && !!assignmentId,
  });
}
