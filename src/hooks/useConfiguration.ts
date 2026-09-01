import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConfiguration,
  getFieldSchema,
  upsertConfiguration,
  upsertFieldSchema,
  validateRegistration,
} from "@/api/configEngine";
import { useSessionStore } from "@/state/sessionStore";
import type { EventConfigurationIn, EventFieldSchemaIn, ValidateRegistrationIn } from "@/types/configEngine";

export const configQueryKeys = {
  configuration: (eventId: string) => ["events", eventId, "configuration"] as const,
  fieldSchema: (eventId: string, participationType: string) =>
    ["events", eventId, "field-schema", participationType] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventConfiguration(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: configQueryKeys.configuration(eventId),
    queryFn: () => getConfiguration(eventId),
    enabled: ready && !!eventId,
  });
}

export function useUpsertConfiguration(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventConfigurationIn) => upsertConfiguration(eventId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: configQueryKeys.configuration(eventId) }),
  });
}

export function useFieldSchema(eventId: string, participationType: string) {
  const ready = useReady();
  return useQuery({
    queryKey: configQueryKeys.fieldSchema(eventId, participationType),
    queryFn: () => getFieldSchema(eventId, participationType),
    enabled: ready && !!eventId && !!participationType,
  });
}

export function useUpsertFieldSchema(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventFieldSchemaIn) => upsertFieldSchema(eventId, payload),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: configQueryKeys.fieldSchema(eventId, variables.participation_type),
      }),
  });
}

export function useValidateRegistration(eventId: string) {
  return useMutation({
    mutationFn: (payload: ValidateRegistrationIn) => validateRegistration(eventId, payload),
  });
}
