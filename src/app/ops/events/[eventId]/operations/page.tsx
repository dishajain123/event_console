"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ScanLine, MapPin, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent, useVenues } from "@/hooks/useEvents";
import { useCheckIns } from "@/hooks/useCheckIns";

const PAGE_SIZE = 25;

/**
 * Same `useCheckIns` hook and params as before. `useCheckIns` no
 * longer discards `total` (see the hook's own comment), so pagination
 * below is real instead of a "disable Next once fewer than 25 came
 * back" heuristic.
 */
export default function EventOperationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: venues } = useVenues(eventId);
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: checkInPage, isLoading, isError, refetch, dataUpdatedAt } = useCheckIns(
    eventId,
    venueFilter === "all" ? undefined : venueFilter,
    page,
  );
  const checkIns = checkInPage?.items;
  const totalPages = checkInPage ? Math.max(1, Math.ceil(checkInPage.total / PAGE_SIZE)) : 1;

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

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard label="Total check-ins" value={checkInPage?.total ?? 0} icon={ScanLine} tone="success" />
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
          <div className="p-5">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !checkIns || checkIns.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={ScanLine}
              title="No check-ins yet"
              description="Ticket scans from the mobile app's Staff Mode will appear here in near real-time."
            />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Venue</TableHeaderCell>
                  <TableHeaderCell>Source</TableHeaderCell>
                  <TableHeaderCell>Scanned at</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkIns
                  .slice()
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell className="text-[var(--foreground)]">{venueName(checkIn.venue_id)}</TableCell>
                      <TableCell className="capitalize text-[var(--foreground-muted)]">{checkIn.source}</TableCell>
                      <TableCell className="text-[var(--foreground-muted)]">{new Date(checkIn.created_at).toLocaleTimeString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={checkInPage?.total} onPageChange={setPage} />
      </GlassPanel>
    </div>
  );
}