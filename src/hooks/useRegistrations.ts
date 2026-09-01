import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRegistration,
  getRegistration,
  listRegistrationsForEvent,
  rejectRegistration,
} from "@/api/registrations";
import { useSessionStore } from "@/state/sessionStore";

export const registrationsQueryKeys = {
  forEvent: (eventId: string) => ["registrations", "event", eventId] as const,
  detail: (registrationId: string) => ["registrations", registrationId] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventRegistrations(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: registrationsQueryKeys.forEvent(eventId),
    queryFn: () => listRegistrationsForEvent(eventId),
    enabled: ready && !!eventId,
  });
}

export function useRegistration(registrationId: string | null) {
  const ready = useReady();
  return useQuery({
    queryKey: registrationsQueryKeys.detail(registrationId ?? ""),
    queryFn: () => getRegistration(registrationId as string),
    enabled: ready && !!registrationId,
  });
}

export function useApproveRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => approveRegistration(registrationId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.forEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.detail(data.id) });
    },
  });
}

export function useRejectRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, reason }: { registrationId: string; reason: string }) =>
      rejectRegistration(registrationId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.forEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.detail(data.id) });
    },
  });
}
