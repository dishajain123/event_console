"use client";

import { CalendarDays, ClipboardCheck, Ticket, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/hooks/useEvents";
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

export default function OpsDashboardPage() {
  const { data: events, isLoading, isError, refetch } = useEvents();

  const liveOrOpenCount =
    events?.filter((e) => e.status === "registration_open" || e.status === "live").length ?? 0;

  return (
    <div>
      <Header title="Operations Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <KPICard
              label="Total events"
              value={events?.length ?? 0}
              icon={CalendarDays}
              tone="accent"
            />
            <KPICard
              label="Open or live now"
              value={liveOrOpenCount}
              icon={Ticket}
              tone="success"
            />
            <KPICard
              label="Pending approvals"
              value="—"
              icon={ClipboardCheck}
              tone="warning"
              hint="Ships in Phase 3 — Registration Management"
            />
            <KPICard
              label="Alerts"
              value="—"
              icon={AlertTriangle}
              tone="info"
              hint="Ships in Phase 7 — Analytics"
            />
          </>
        )}
      </div>

      <div className="mt-6">
        <GlassPanel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent events</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-[var(--radius-sm)] bg-black/[0.04]" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load events"
              description="Check that the backend is reachable and try again."
              onRetry={() => refetch()}
            />
          ) : !events || events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No events yet"
              description="Events created in the Console will show up here once Event Management ships in Phase 2."
            />
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {events.slice(0, 8).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{event.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {new Date(event.start_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
