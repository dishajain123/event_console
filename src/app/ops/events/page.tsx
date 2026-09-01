"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { CreateEventDialog } from "@/components/events/create-event-dialog";
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

export default function EventsPage() {
  const { data: events, isLoading, isError, refetch } = useEvents();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      const matchesSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.category ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  return (
    <div>
      <Header title="Events" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            placeholder="Search by name or category…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-52"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
        >
          <option value="all">All statuses</option>
          {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New event
        </Button>
      </div>

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CalendarDays}
              title={events && events.length > 0 ? "No events match your filters" : "No events yet"}
              description={
                events && events.length > 0
                  ? "Try a different search term or status filter."
                  : "Create your first event to start configuring it."
              }
              action={events && events.length === 0 ? { label: "Create event", onClick: () => setDialogOpen(true) } : undefined}
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.map((event) => (
                <tr key={event.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="px-6 py-4">
                    <Link
                      href={`/ops/events/${event.id}`}
                      className="font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">{event.category || "—"}</td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {new Date(event.start_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {" – "}
                    {new Date(event.end_date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[event.status]}>{EVENT_STATUS_LABELS[event.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      <CreateEventDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
