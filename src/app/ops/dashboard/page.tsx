"use client";

import { CalendarDays, ClipboardCheck, Ticket, AlertTriangle, Users2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { useSessionStore } from "@/state/sessionStore";
import { getPlatformOperationsOverview } from "@/api/reports";
import { EVENT_STATUS_LABELS, type EventStatus } from "@/types/events";
import type { EventOperationsOverviewOut } from "@/types/reports";

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
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  const ready = hydrated && !!user;
  const {
    data: overview,
    isLoading,
    isError,
    refetch,
  } = useQuery<EventOperationsOverviewOut>({
    queryKey: ["reports", "overview"],
    queryFn: getPlatformOperationsOverview,
    enabled: ready,
  });

  const recentEvents = overview?.events ?? [];
  const activeOrOpenCount = overview?.active_events ?? 0;

  return (
    <div>
      <Header title="Operations Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <KPICard
              label="Total events"
              value={overview?.total_events ?? 0}
              icon={CalendarDays}
              tone="accent"
            />
            <KPICard
              label="Upcoming events"
              value={overview?.upcoming_events ?? 0}
              icon={Ticket}
              tone="success"
            />
            <KPICard
              label="Active events"
              value={activeOrOpenCount}
              icon={ClipboardCheck}
              tone="warning"
              hint="Registration open or live"
            />
            <KPICard
              label="Completed events"
              value={overview?.completed_events ?? 0}
              icon={AlertTriangle}
              tone="neutral"
            />
            <KPICard
              label="Draft / unpublished"
              value={overview?.draft_events ?? 0}
              icon={ClipboardCheck}
              tone="info"
              hint="Draft or configured"
            />
            <KPICard
              label="Total registrations"
              value={overview?.total_registrations ?? 0}
              icon={Ticket}
              tone="accent"
            />
            <KPICard
              label="Full capacity"
              value={overview?.events_at_full_capacity ?? 0}
              icon={AlertTriangle}
              tone="info"
              hint="Events that hit capacity"
            />
          </>
        )}
      </div>

      {!isLoading && !isError && overview ? (
        <div className="mt-4 rounded-[var(--radius-md)] border border-black/[0.05] bg-white/70 px-4 py-3 text-sm text-[var(--foreground-muted)]">
          Registration open: {overview.registration_open_events} · Closed: {overview.registration_closed_events} · Full:{" "}
          {overview.events_at_full_capacity}
        </div>
      ) : null}

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
          ) : !recentEvents || recentEvents.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No events yet"
              description="Create an event in the console to populate the live operations dashboard."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-black/[0.05] bg-white/70 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                    Event-wise registration overview
                  </h3>
                  <div className="divide-y divide-black/[0.05]">
                    {recentEvents.slice(0, 6).map((event) => (
                      <div key={event.event_id} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{event.event_name}</p>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {event.organizer_name ?? event.organizer_mobile_number ?? "Unassigned"}
                            {" · "}
                            {event.main_category ?? "—"}
                            {event.sub_category ? ` / ${event.sub_category}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge tone={STATUS_TONE[event.status as EventStatus]}>
                            {EVENT_STATUS_LABELS[event.status as EventStatus]}
                          </Badge>
                          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                            {event.active_registrations}/{event.capacity ?? "∞"} registrations
                            {event.is_full ? " · Full" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] border border-black/[0.05] bg-white/70 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                    Event manager-wise overview
                  </h3>
                  <div className="divide-y divide-black/[0.05]">
                    {(overview?.event_manager_overview ?? []).slice(0, 6).map((manager) => (
                      <div key={manager.user_id ?? manager.mobile_number ?? manager.name} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {manager.name ?? manager.mobile_number ?? "Unassigned"}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {manager.mobile_number ?? "No mobile number"} · {manager.total_events} events
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                          <Users2 className="h-3.5 w-3.5" />
                          <span>{manager.active_events} active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
