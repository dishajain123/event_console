import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createScheduleItem,
  createSponsor,
  createVenue,
  changeEventStatus,
  deleteSponsor,
  getEvent,
  listEvents,
  listSchedule,
  listSponsors,
  listVenues,
  publishEvent,
  updateEvent,
} from "@/api/events";
import { useSessionStore } from "@/state/sessionStore";
import type { EventCreateIn, EventStatus, EventUpdateIn, ScheduleItemIn, SponsorIn, VenueIn } from "@/types/events";

export const eventsQueryKeys = {
  all: ["events"] as const,
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

export function useEvents() {
  const ready = useReady();
  return useQuery({ queryKey: eventsQueryKeys.all, queryFn: listEvents, enabled: ready });
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.all }),
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EventUpdateIn) => updateEvent(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.all });
    },
  });
}

export function useChangeEventStatus(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newStatus: EventStatus) => changeEventStatus(eventId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.all });
    },
  });
}

export function usePublishEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => publishEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventsQueryKeys.all });
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

export function useCreateScheduleItem(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScheduleItemIn) => createScheduleItem(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventsQueryKeys.schedule(eventId) }),
  });
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
