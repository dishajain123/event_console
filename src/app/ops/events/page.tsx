"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Settings2,
  BarChart3,
  CalendarDays,
  Layers3,
  ClipboardList,
  ListOrdered,
  Users2,
  Radio,
  Building2,
  MessageSquare,
  Ticket,
  Trophy,
  LineChart,
  Copy,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/states";
import { EventStatusStepper } from "@/components/events/event-status-stepper";
import { VenuesPanel, SchedulePanel } from "@/components/events/venue-schedule-panels";
import { useEvent } from "@/hooks/useEvents";
import { useDuplicateEvent } from "@/hooks/useEventTemplates";
import { EVENT_STATUS_LABELS, type EventStatus } from "@/types/events";
import type { LucideIcon } from "lucide-react";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatList(value: string[] | undefined | null): string {
  if (!value || value.length === 0) return "—";
  return value.join(", ");
}

const STATUS_TONE: Record<EventStatus, "neutral" | "accent" | "success" | "warning" | "info"> = {
  draft: "neutral",
  configured: "info",
  published: "accent",
  registration_open: "success",
  registration_closed: "warning",
  live: "success",
  completed: "neutral",
  archived: "neutral",
};

/** Every href below is unchanged from before — same 11 destinations. */
function manageActions(eventId: string): { label: string; href: string; icon: LucideIcon }[] {
  return [
    { label: "Registrations", href: `/ops/events/${eventId}/registrations`, icon: ClipboardList },
    { label: "Waitlist", href: `/ops/events/${eventId}/waitlist`, icon: ListOrdered },
    { label: "Ticket access", href: `/ops/events/${eventId}/access`, icon: Ticket },
    { label: "Teams", href: `/ops/events/${eventId}/teams`, icon: Users2 },
    { label: "Competitions", href: `/ops/events/${eventId}/competitions`, icon: Trophy },
    { label: "Day-of Operations", href: `/ops/events/${eventId}/operations`, icon: Radio },
    { label: "Attendance Analytics", href: `/ops/events/${eventId}/attendance`, icon: BarChart3 },
    { label: "Configuration Builder", href: `/ops/events/${eventId}/configure`, icon: Settings2 },
    { label: "Event Reports", href: `/ops/events/${eventId}/reports`, icon: BarChart3 },
    { label: "Advanced Analytics", href: `/ops/events/${eventId}/analytics`, icon: LineChart },
    { label: "Feedback", href: `/ops/events/${eventId}/feedback`, icon: MessageSquare },
  ];
}

function ManageActionTile({ label, href, icon: Icon }: { label: string; href: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent-strong)] group-hover:bg-white">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--foreground-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

/**
 * Same `useEvent` hook and the same `useDuplicateEvent` mutation
 * (identical payload shape) as before — every sub-page link below
 * points at the exact same href it did before. This is a structural
 * redesign only:
 *
 * - The identity/status/lifecycle card is now full-width instead of
 *   sharing a row with the management panel, so the stepper has room
 *   to breathe instead of being squeezed into a 2fr column.
 * - "Manage this event" is a compact grid of action tiles instead of
 *   11 full-width outline buttons stacked in a narrow right-hand
 *   column — it now sits naturally in the page's main flow.
 * - Duplicate-event and Organizer, which used to live inside that same
 *   cramped column, are now their own two-column row.
 */
export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const { data: event, isLoading, isError, refetch } = useEvent(eventId);
  const duplicate = useDuplicateEvent();
  const [duplicateForm, setDuplicateForm] = useState({ name: "", start_date: "", end_date: "" });

  return (
    <div>
      <div className="fade-in mb-4 flex items-center justify-between">
        <Link
          href="/ops/events"
          className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          All events
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : isError || !event ? (
        <ErrorState
          title="Couldn't load this event"
          description="It may have been removed, or the backend is unreachable."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <Header title={event.name} />

          <GlassPanel className="rise-in mb-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge tone={STATUS_TONE[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
              {(event.main_category || event.sub_category || event.category) && (
                <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                  <Layers3 className="h-3.5 w-3.5" />
                  {event.main_category?.name || event.category || "—"}
                  {event.sub_category?.name && (
                    <span className="text-[var(--foreground-subtle)]">/ {event.sub_category.name}</span>
                  )}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(event.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                {" – "}
                {new Date(event.end_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            {event.description && <p className="mb-4 text-sm text-[var(--foreground-muted)]">{event.description}</p>}

            <EventStatusStepper eventId={event.id} status={event.status} />
          </GlassPanel>

          <GlassPanel className="rise-in mb-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Manage this event</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {manageActions(event.id).map((action) => (
                <ManageActionTile key={action.href} {...action} />
              ))}
            </div>
          </GlassPanel>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GlassPanel className="rise-in">
              <div className="mb-2 flex items-center gap-2 text-[var(--foreground)]">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Organizer</span>
              </div>
              <p className="text-sm text-[var(--foreground)]">{event.organizer?.name ?? "Unassigned"}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{event.organizer?.mobile_number ?? "No mobile number"}</p>
            </GlassPanel>

            <GlassPanel className="rise-in">
              <div className="mb-2 flex items-center gap-2 text-[var(--foreground)]">
                <Copy className="h-4 w-4" />
                <span className="text-sm font-semibold">Duplicate event</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Input
                  className="sm:col-span-1"
                  placeholder="New event name"
                  value={duplicateForm.name}
                  onChange={(input) => setDuplicateForm((value) => ({ ...value, name: input.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={duplicateForm.start_date}
                  onChange={(input) => setDuplicateForm((value) => ({ ...value, start_date: input.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={duplicateForm.end_date}
                  onChange={(input) => setDuplicateForm((value) => ({ ...value, end_date: input.target.value }))}
                />
              </div>
              <Button
                className="mt-2 w-full"
                size="sm"
                loading={duplicate.isPending}
                disabled={!duplicateForm.name || !duplicateForm.start_date || !duplicateForm.end_date}
                onClick={async () => {
                  const created = await duplicate.mutateAsync({
                    eventId,
                    payload: {
                      name: duplicateForm.name,
                      start_date: new Date(duplicateForm.start_date).toISOString(),
                      end_date: new Date(duplicateForm.end_date).toISOString(),
                    },
                  });
                  router.push(`/ops/events/${created.id}`);
                }}
              >
                Duplicate event
              </Button>
              <p className="mt-2 text-[11px] text-[var(--foreground-subtle)]">
                Configuration is copied; registrations, payments, tickets, attendance, check-ins and history are not.
              </p>
            </GlassPanel>
          </div>

          <div className="mb-4">
            <GlassPanel>
              <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Event details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Registration window</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {formatDateTime(event.configuration?.details?.registration_start_at)} to{" "}
                    {formatDateTime(event.configuration?.details?.registration_end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Event window</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {formatDateTime(event.configuration?.details?.event_start_at)} to{" "}
                    {formatDateTime(event.configuration?.details?.event_end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Venue</p>
                  <p className="text-sm text-[var(--foreground)]">{event.configuration?.details?.venue_name ?? "—"}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {event.configuration?.details?.venue_address ?? event.configuration?.details?.venue_location ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Eligibility</p>
                  <p className="text-sm text-[var(--foreground)]">{event.configuration?.details?.age_group ?? "—"}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Min {event.configuration?.details?.age_min ?? "—"} / Max {event.configuration?.details?.age_max ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Capacity</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.minimum_participants ?? "—"} to{" "}
                    {event.configuration?.details?.maximum_participants ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Event type</p>
                  <p className="text-sm text-[var(--foreground)]">{event.configuration?.details?.event_type ?? "—"}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Team size {event.configuration?.details?.team_size_min ?? "—"} to{" "}
                    {event.configuration?.details?.team_size_max ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Gender eligibility</p>
                  <p className="text-sm text-[var(--foreground)]">{event.configuration?.details?.gender_eligibility ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Required documents</p>
                  <p className="text-sm text-[var(--foreground)]">{formatList(event.configuration?.details?.required_documents)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Contact</p>
                  <p className="text-sm text-[var(--foreground)]">{event.configuration?.details?.contact_name ?? "—"}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {event.configuration?.details?.contact_email ?? "—"}
                    {" · "}
                    {event.configuration?.details?.contact_phone ?? "—"}
                  </p>
                </div>
              </div>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <VenuesPanel eventId={event.id} />
            <SchedulePanel eventId={event.id} />
          </div>
        </>
      )}
    </div>
  );
}