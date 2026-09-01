import { apiClient } from "@/api/client";
import type {
  EventCreateIn,
  EventOut,
  EventStatus,
  EventUpdateIn,
  ScheduleItemIn,
  ScheduleItemOut,
  SponsorIn,
  SponsorOut,
  VenueIn,
  VenueOut,
} from "@/types/events";

export async function listEvents(): Promise<EventOut[]> {
  const { data } = await apiClient.get<EventOut[]>("/events");
  return data;
}

export async function getEvent(eventId: string): Promise<EventOut> {
  // Backend now has a real single-event GET (see the fix in
  // app/modules/events/service.py's get_event_visible_to_actor) — this
  // used to be a list-then-find workaround that silently broke for a
  // scoped Event Manager's own unpublished event.
  const { data } = await apiClient.get<EventOut>(`/events/${eventId}`);
  return data;
}

export async function createEvent(payload: EventCreateIn): Promise<EventOut> {
  const { data } = await apiClient.post<EventOut>("/events", payload);
  return data;
}

export async function updateEvent(eventId: string, payload: EventUpdateIn): Promise<EventOut> {
  const { data } = await apiClient.patch<EventOut>(`/events/${eventId}`, payload);
  return data;
}

export async function publishEvent(eventId: string): Promise<EventOut> {
  const { data } = await apiClient.post<EventOut>(`/events/${eventId}/publish`);
  return data;
}

export async function changeEventStatus(eventId: string, newStatus: EventStatus): Promise<EventOut> {
  const { data } = await apiClient.post<EventOut>(`/events/${eventId}/status`, {
    new_status: newStatus,
  });
  return data;
}

export async function listVenues(eventId: string): Promise<VenueOut[]> {
  const { data } = await apiClient.get<VenueOut[]>(`/events/${eventId}/venues`);
  return data;
}

export async function createVenue(eventId: string, payload: VenueIn): Promise<VenueOut> {
  const { data } = await apiClient.post<VenueOut>(`/events/${eventId}/venues`, payload);
  return data;
}

export async function listSchedule(eventId: string): Promise<ScheduleItemOut[]> {
  const { data } = await apiClient.get<ScheduleItemOut[]>(`/events/${eventId}/schedule`);
  return data;
}

export async function createScheduleItem(
  eventId: string,
  payload: ScheduleItemIn,
): Promise<ScheduleItemOut> {
  const { data } = await apiClient.post<ScheduleItemOut>(`/events/${eventId}/schedule`, payload);
  return data;
}

export async function listSponsors(eventId: string): Promise<SponsorOut[]> {
  const { data } = await apiClient.get<SponsorOut[]>(`/events/${eventId}/sponsors`);
  return data;
}

export async function createSponsor(eventId: string, payload: SponsorIn): Promise<SponsorOut> {
  const { data } = await apiClient.post<SponsorOut>(`/events/${eventId}/sponsors`, payload);
  return data;
}

export async function deleteSponsor(eventId: string, sponsorId: string): Promise<void> {
  await apiClient.delete(`/events/${eventId}/sponsors/${sponsorId}`);
}
