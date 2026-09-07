import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveEventTemplate, createEventFromTemplate, createEventTemplate, deleteEventTemplate, duplicateEvent, listEventTemplates, updateEventTemplate } from "@/api/eventTemplates";
import { useSessionStore } from "@/state/sessionStore";

function useReady() {
  return useSessionStore((state) => state.hydrated && !!state.user);
}

export function useEventTemplates(page = 1, search = "", includeArchived = false) {
  const ready = useReady();
  return useQuery({ queryKey: ["event-templates", page, search, includeArchived], queryFn: () => listEventTemplates({ page, search, includeArchived }), enabled: ready });
}

function invalidateTemplates(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["event-templates"] });
  queryClient.invalidateQueries({ queryKey: ["events"] });
}

export function useCreateEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createEventTemplate, onSuccess: () => invalidateTemplates(queryClient) });
}

export function useUpdateEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ templateId, payload }: { templateId: string; payload: { name?: string; description?: string | null } }) => updateEventTemplate(templateId, payload), onSuccess: () => invalidateTemplates(queryClient) });
}

export function useArchiveEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: archiveEventTemplate, onSuccess: () => invalidateTemplates(queryClient) });
}

export function useDeleteEventTemplate() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteEventTemplate, onSuccess: () => invalidateTemplates(queryClient) });
}

export function useCreateEventFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ templateId, payload }: { templateId: string; payload: { name: string; start_date: string; end_date: string } }) => createEventFromTemplate(templateId, payload), onSuccess: () => invalidateTemplates(queryClient) });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ eventId, payload }: { eventId: string; payload: { name: string; start_date: string; end_date: string } }) => duplicateEvent(eventId, payload), onSuccess: () => invalidateTemplates(queryClient) });
}
