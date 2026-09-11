import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createScheduleItem,
  createSponsor,
  createVenue,
  changeEventStatus,
  deleteSponsor,
  getEvent,
  setEventImage,
  removeEventImage,
  listEvents,
  listSchedule,
  listManagedSchedule,
  cancelScheduleItem,
  listSponsors,
  listVenues,
  listAssignableVenues,
  publishEvent,
  updateEvent,
} from "@/api/events";
import { useSessionStore } from "@/state/sessionStore";
import type { EventCreateIn, EventStatus, EventUpdateIn, ScheduleItemIn, SponsorIn, VenueIn } from "@/types/events";

export const eventsQueryKeys = {
  all: (mainCategoryId?: string, subCategoryId?: string, search?: string, status?: string, page?: number) =>
    ["events", mainCategoryId ?? "all", subCategoryId ?? "all", search ?? "", status ?? "all", page ?? 1] as const,
  page: (mainCategoryId?: string, subCategoryId?: string, search?: string, status?: string, page?: number, pageSize?: number) =>
    ["events", "page", mainCategoryId ?? "all", subCategoryId ?? "all", search ?? "", status ?? "all", page ?? 1, pageSize ?? 25] as const,
  detail: (eventId: string) => ["events", eventId] as const,
  venues: (eventId: string) => ["events", eventId, "venues"] as const,
  schedule: (eventId: string) => ["events", eventId, "schedule"] as const,
  sponsors: (eventId: string) => ["events", eventId, "sponsors"] as const,
};

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEvents(filters?: { mainCategoryId?: string; subCategoryId?: string; search?: string; status?: string; page?: number }) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.all(filters?.mainCategoryId, filters?.subCategoryId, filters?.search, filters?.status, filters?.page),
    queryFn: () => listEvents(filters),
    select: (result) => result.items,
    enabled: ready,
  });
}

/**
 * Additive — same `listEvents` API call as [useEvents], with the same
 * params, but returns the full paginated `EventPage` (items/total/
 * page/page_size) instead of discarding everything but `items`. Added
 * so the Events page can drive a real [Pagination] control from data
 * the backend was already returning; [useEvents] is untouched and
 * every one of its existing call sites (which expect a plain array)
 * keeps working exactly as before.
 */
export function useEventsPage(filters?: {
  mainCategoryId?: string;
  subCategoryId?: string;
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.page(
      filters?.mainCategoryId,
      filters?.subCategoryId,
      filters?.search,
      filters?.status,
      filters?.page,
      filters?.pageSize,
    ),
    queryFn: () => listEvents(filters),
    enabled: ready,
  });
}

export function useEvent(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
    enabled: ready && !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventCreateIn) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventUpdateIn) => updateEvent(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      // A manager reassignment (organizer_user_id) changes who "Admin
      // Accounts" shows as managing this event, for both the old and the
      // new manager — without this, that page kept showing the pre-
      // reassignment state until an unrelated refetch happened to occur.
      if (variables.organizer_user_id !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["event-managers"] });
      }
    },
  });
}

function useEventImageMutation(eventId: string, fn: (eventId: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fn(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSetEventImage(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => setEventImage(eventId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useRemoveEventImage(eventId: string) {
  return useEventImageMutation(eventId, removeEventImage);
}

export function useChangeEventStatus(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newStatus: EventStatus) => changeEventStatus(eventId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function usePublishEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useVenues(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.venues(eventId),
    queryFn: () => listVenues(eventId),
    enabled: ready && !!eventId,
  });
}

export function useAssignableVenues(eventId: string) {
  const ready = useReady();
  return useQuery({ queryKey: ["events", eventId, "assignable-venues"], queryFn: () => listAssignableVenues(eventId), enabled: ready && !!eventId });
}

export function useCreateVenue(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VenueIn) => createVenue(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.venues(eventId) }),
  });
}

export function useSchedule(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.schedule(eventId),
    queryFn: () => listSchedule(eventId),
    enabled: ready && !!eventId,
  });
}

export function useManagedSchedule(eventId: string, filters: { page?: number; search?: string; status?: string } = {}) {
  const ready = useReady();
  return useQuery({ queryKey: ["events", eventId, "schedule-manage", filters], queryFn: () => listManagedSchedule(eventId, { ...filters, pageSize: 25 }), enabled: ready && !!eventId });
}

export function useCreateScheduleItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScheduleItemIn) => createScheduleItem(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.schedule(eventId) }),
  });
}

export function useCancelScheduleItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (scheduleId: string) => cancelScheduleItem(eventId, scheduleId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events", eventId, "schedule-manage"] }) });
}

export function useSponsors(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: eventsQueryKeys.sponsors(eventId),
    queryFn: () => listSponsors(eventId),
    enabled: ready && !!eventId,
  });
}

export function useCreateSponsor(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SponsorIn) => createSponsor(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.sponsors(eventId) }),
  });
}

export function useDeleteSponsor(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sponsorId: string) => deleteSponsor(eventId, sponsorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.sponsors(eventId) }),
  });
}