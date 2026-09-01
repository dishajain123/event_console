"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Settings2, BarChart3, CalendarDays, Tag, ClipboardList, Users2, Radio } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/states";
import { EventStatusStepper } from "@/components/events/event-status-stepper";
import { VenuesPanel, SchedulePanel } from "@/components/events/venue-schedule-panels";
import { useEvent } from "@/hooks/useEvents";
import { EVENT_STATUS_LABELS, type EventStatus } from "@/types/events";

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
  const { data: event, isLoading, isError, refetch } = useEvent(eventId);

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
                {event.category && (
                  <span className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                    <Tag className="h-3.5 w-3.5" />
                    {event.category}
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
              <Link href={`/ops/events/${event.id}/registrations`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <ClipboardList className="h-4 w-4" />
                  Registrations
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/teams`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <Users2 className="h-4 w-4" />
                  Teams
                </Button>
              </Link>
              <Link href={`/ops/events/${event.id}/operations`}>
                <Button variant="outline" className="w-full justify-start gap-2.5">
                  <Radio className="h-4 w-4" />
                  Day-of Operations
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
