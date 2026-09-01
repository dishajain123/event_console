"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ScanLine, MapPin, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent, useVenues } from "@/hooks/useEvents";
import { useCheckIns } from "@/hooks/useCheckIns";

export default function EventOperationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: venues } = useVenues(eventId);
  const [venueFilter, setVenueFilter] = useState<string>("all");

  const { data: checkIns, isLoading, isError, refetch, dataUpdatedAt } = useCheckIns(
    eventId,
    venueFilter === "all" ? undefined : venueFilter,
  );

  const venueName = useMemo(() => {
    const map = new Map((venues ?? []).map((v) => [v.id, v.name]));
    return (id: string | null) => (id ? map.get(id) ?? "Unknown venue" : "No venue set");
  }, [venues]);

  const byVenue = useMemo(() => {
    if (!checkIns) return [];
    const counts = new Map<string, number>();
    for (const c of checkIns) {
      const key = c.venue_id ?? "none";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([venueId, count]) => ({
      venueId: venueId === "none" ? null : venueId,
      count,
    }));
  }, [checkIns]);

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>

      <Header title="Day-of Operations" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select className="w-56" value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)}>
          <option value="all">All venues</option>
          {(venues ?? []).map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-subtle)]">
          <RefreshCw className="h-3 w-3" />
          Live — refreshes every 15s
          {dataUpdatedAt > 0 && <span>· last updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span>}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard label="Total check-ins" value={checkIns?.length ?? 0} icon={ScanLine} tone="success" />
        <KPICard label="Venues active" value={byVenue.length} icon={MapPin} tone="accent" />
        <KPICard
          label="Offline scans synced"
          value={(checkIns ?? []).filter((c) => c.source === "offline").length}
          icon={RefreshCw}
          tone="info"
          hint="Scanned without signal, synced once reconnected"
        />
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
        ) : !checkIns || checkIns.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ScanLine}
              title="No check-ins yet"
              description="Ticket scans from the mobile app's Staff Mode will appear here in near real-time."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Venue</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Scanned at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {checkIns
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 50)
                .map((checkIn) => (
                  <tr key={checkIn.id} className="transition-colors hover:bg-black/[0.02]">
                    <td className="px-6 py-4 text-[var(--foreground)]">{venueName(checkIn.venue_id)}</td>
                    <td className="px-6 py-4 capitalize text-[var(--foreground-muted)]">{checkIn.source}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">
                      {new Date(checkIn.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </GlassPanel>
    </div>
  );
}
