"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventWaitlists, useRemoveWaitlistEntry, useRetryWaitlistEntry } from "@/hooks/useWaitlists";
import type { WaitlistStatus } from "@/types/waitlists";

const labels: Record<WaitlistStatus, string> = { waiting: "Waiting", promoted: "Promoted", expired: "Expired", left: "Left", closed: "Closed" };
const PAGE_SIZE = 25;

/** Same `useEventWaitlists`/`useRemoveWaitlistEntry`/`useRetryWaitlistEntry` hooks as before. */
export default function WaitlistPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<WaitlistStatus | "all">("all");
  const { data, isLoading, isError, refetch } = useEventWaitlists(eventId, { page, pageSize: PAGE_SIZE, search, status });
  const remove = useRemoveWaitlistEntry(eventId);
  const retry = useRetryWaitlistEntry(eventId);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const isFiltered = search !== "" || status !== "all";

  return (
    <div>
      <Link href={`/ops/events/${eventId}`} className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>
      <Header title="Waitlist" />

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setPage(1);
        }}
      >
        <Input
          className="max-w-xs"
          placeholder="Search user or mobile"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          className="w-44"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as WaitlistStatus | "all");
          }}
        >
          <option value="all">All statuses</option>
          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FilterBar>

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !data?.items.length ? (
          <div className="p-5">
            <EmptyState icon={ListOrdered} title="No waitlist entries" description="Entries will appear when a full event receives a waitlist request." />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Position</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Joined</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{entry.user_id}</TableCell>
                    <TableCell className="capitalize text-[var(--foreground-muted)]">{entry.participation_type}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{entry.position ?? "—"}</TableCell>
                    <TableCell className="capitalize text-[var(--foreground-muted)]">{labels[entry.status]}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{new Date(entry.joined_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-3">
                        {entry.status === "expired" && (
                          <Button size="sm" variant="ghost" disabled={retry.isPending} onClick={() => retry.mutate(entry.id)}>
                            Retry
                          </Button>
                        )}
                        {(entry.status === "waiting" || entry.status === "promoted") && (
                          <Button size="sm" variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(entry.id)}>
                            <span className="text-[var(--danger)]">Remove</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={data?.total} onPageChange={setPage} />
      </GlassPanel>
    </div>
  );
}