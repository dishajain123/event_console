import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRegistration,
  cancelRegistration,
  getRegistration,
  listRegistrationsForEvent,
  rejectRegistration,
} from "@/api/registrations";
import { useSessionStore } from "@/state/sessionStore";
import type { RegistrationStatus } from "@/types/registrations";

export const registrationsQueryKeys = {
  forEvent: (eventId: string) => ["registrations", "event", eventId] as const,
  detail: (registrationId: string) => ["registrations", registrationId] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventRegistrations(eventId: string, filters: {
  page: number; pageSize: number; search?: string; status?: RegistrationStatus | "all"; participationType?: string;
}) {
  const ready = useReady();
  return useQuery({
    queryKey: ["registrations", "event", eventId, filters],
    queryFn: () => listRegistrationsForEvent(eventId, filters),
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

export function useCancelRegistration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ registrationId, reason }: { registrationId: string; reason?: string }) =>
      cancelRegistration(registrationId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.forEvent(eventId) });
      queryClient.invalidateQueries({ queryKey: registrationsQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
    },
  });
}
