"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <GlassPanel className="rise-in">
              <div className="mb-5 flex flex-wrap items-center gap-3">
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
                  {new Date(event.start_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" – "}
                  {new Date(event.end_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {event.description && (
                <p className="mb-5 text-sm text-[var(--foreground-muted)]">{event.description}</p>
              )}

              <EventStatusStepper eventId={event.id} status={event.status} />
            </GlassPanel>

            <GlassPanel className="rise-in flex flex-col gap-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Manage this event</p>
              <div className="rounded-[var(--radius-sm)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-3">
                <p className="mb-2 text-xs font-semibold text-[var(--foreground)]">Duplicate event</p>
                <div className="space-y-2">
                  <Input placeholder="New event name" value={duplicateForm.name} onChange={(input) => setDuplicateForm((value) => ({ ...value, name: input.target.value }))} />
                  <Input type="datetime-local" value={duplicateForm.start_date} onChange={(input) => setDuplicateForm((value) => ({ ...value, start_date: input.target.value }))} />
                  <Input type="datetime-local" value={duplicateForm.end_date} onChange={(input) => setDuplicateForm((value) => ({ ...value, end_date: input.target.value }))} />
                  <Button className="w-full" loading={duplicate.isPending} disabled={!duplicateForm.name || !duplicateForm.start_date || !duplicateForm.end_date} onClick={async () => { const created = await duplicate.mutateAsync({ eventId, payload: { name: duplicateForm.name, start_date: new Date(duplicateForm.start_date).toISOString(), end_date: new Date(duplicateForm.end_date).toISOString() } }); router.push(`/ops/events/${created.id}`); }}>Duplicate event</Button>
                </div>
                <p className="mt-2 text-[11px] text-[var(--foreground-muted)]">Configuration is copied; registrations, payments, tickets, attendance, check-ins and history are not.</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-black/[0.05] bg-white/60 p-3 text-sm text-[var(--foreground-muted)]">
                <div className="mb-2 flex items-center gap-2 text-[var(--foreground)]">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Organizer</span>
                </div>
                <p>{event.organizer?.name ?? "Unassigned"}</p>
                <p>{event.organizer?.mobile_number ?? "No mobile number"}</p>
              </div>
              <Link href={`/ops/events/${event.id}/registrations`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <ClipboardList className="h-4 w-4" />
                  Registrations
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/waitlist`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <ListOrdered className="h-4 w-4" />
                  Waitlist
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/access`}>
                <Button variant="outline">Ticket access</Button>
              </Link>
              <Link href={`/ops/events/${event.id}/teams`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <Users2 className="h-4 w-4" />
                  Teams
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/competitions`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  Competitions
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/operations`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <Radio className="h-4 w-4" />
                  Day-of Operations
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/attendance`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <BarChart3 className="h-4 w-4" />
                  Attendance Analytics
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/configure`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <Settings2 className="h-4 w-4" />
                  Configuration Builder
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/reports`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <BarChart3 className="h-4 w-4" />
                  Event Reports
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/analytics`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <BarChart3 className="h-4 w-4" />
                  Advanced Analytics
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/feedback`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </Button>
              </Link>
            </GlassPanel>
          </div>

          <div className="mb-6">
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
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.venue_name ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {event.configuration?.details?.venue_address ?? event.configuration?.details?.venue_location ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Eligibility</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.age_group ?? "—"}
                  </p>
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
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.event_type ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Team size {event.configuration?.details?.team_size_min ?? "—"} to{" "}
                    {event.configuration?.details?.team_size_max ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Gender eligibility</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.gender_eligibility ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Required documents</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {formatList(event.configuration?.details?.required_documents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-subtle)]">Contact</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {event.configuration?.details?.contact_name ?? "—"}
                  </p>
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
