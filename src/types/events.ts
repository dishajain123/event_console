import type { MainCategorySummary, SubCategorySummary } from "@/types/eventCategories";
import type { EventConfigurationOut } from "@/types/configEngine";
import type { UserOut } from "@/types/identity";

/** Mirrors app/modules/events/schemas.py + models.py EventStatus. */

export type EventStatus =
  | "draft"
  | "configured"
  | "published"
  | "registration_open"
  | "registration_closed"
  | "live"
  | "completed"
  | "archived";

export interface EventOut {
  id: string;
  organization_id: string | null;
  organizer_user_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  main_category_id: string | null;
  sub_category_id: string | null;
  main_category: MainCategorySummary | null;
  sub_category: SubCategorySummary | null;
  organizer: UserOut | null;
  configuration: EventConfigurationOut | null;
  start_date: string;
  end_date: string;
  status: EventStatus;
}

export interface EventCreateIn {
  name: string;
  description?: string | null;
  category?: string | null;
  main_category_id?: string | null;
  sub_category_id?: string | null;
  start_date: string;
  end_date: string;
  organization_id?: string | null;
  organizer_user_id?: string | null;
}

export interface EventUpdateIn {
  name?: string;
  description?: string | null;
  category?: string | null;
  main_category_id?: string | null;
  sub_category_id?: string | null;
  start_date?: string;
  end_date?: string;
  organizer_user_id?: string | null;
}

export interface VenueOut {
  id: string;
  event_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface VenueIn {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ScheduleItemOut {
  id: string;
  event_id: string;
  venue_id: string | null;
  title: string;
  start_time: string;
  end_time: string | null;
}

export interface ScheduleItemIn {
  venue_id?: string | null;
  title: string;
  start_time: string;
  end_time?: string | null;
}

export interface SponsorOut {
  id: string;
  event_id: string;
  name: string;
  tier: string | null;
  logo_url: string | null;
}

export interface SponsorIn {
  name: string;
  tier?: string | null;
  logo_url?: string | null;
}

export interface EventStatusChangeIn {
  new_status: EventStatus;
}

/** Ordered left-to-right for the status stepper UI. */
export const EVENT_STATUS_ORDER: EventStatus[] = [
  "draft",
  "configured",
  "published",
  "registration_open",
  "registration_closed",
  "live",
  "completed",
  "archived",
];

/** The valid state graph, mirrored from the backend's ALLOWED_TRANSITIONS
 * — used only to decide which status-change buttons to SHOW; the backend
 * is what actually enforces this. */
export const EVENT_ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["configured"],
  configured: ["draft", "published"],
  published: ["registration_open", "archived"],
  registration_open: ["registration_closed"],
  registration_closed: ["live", "registration_open"],
  live: ["completed"],
  completed: ["archived"],
  archived: [],
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  configured: "Configured",
  published: "Published",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  live: "Live",
  completed: "Completed",
  archived: "Archived",
};
