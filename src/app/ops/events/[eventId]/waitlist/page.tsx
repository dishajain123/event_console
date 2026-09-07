"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ListOrdered, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventWaitlists, useRemoveWaitlistEntry, useRetryWaitlistEntry } from "@/hooks/useWaitlists";
import type { WaitlistStatus } from "@/types/waitlists";

const labels: Record<WaitlistStatus, string> = { waiting: "Waiting", promoted: "Promoted", expired: "Expired", left: "Left", closed: "Closed" };

export default function WaitlistPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<WaitlistStatus | "all">("all");
  const pageSize = 25;
  const { data, isLoading, isError, refetch } = useEventWaitlists(eventId, { page, pageSize, search, status });
  const remove = useRemoveWaitlistEntry(eventId);
  const retry = useRetryWaitlistEntry(eventId);

  return <div>
    <Link href={`/ops/events/${eventId}`} className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)]"><ArrowLeft className="h-4 w-4" />{event?.name ?? "Back to event"}</Link>
    <Header title="Waitlist" />
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" /><Input className="pl-10" placeholder="Search user or mobile" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /></div>
      <Select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value as WaitlistStatus | "all"); }}><option value="all">All statuses</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
    </div>
    <GlassPanel padded={false}>
      {isLoading ? <div className="p-6"><TableSkeleton rows={6} cols={5} /></div> : isError ? <div className="p-6"><ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." /></div> : !data?.items.length ? <div className="p-6"><EmptyState icon={ListOrdered} title="No waitlist entries" description="Entries will appear when a full event receives a waitlist request." /></div> : <table className="w-full text-sm"><thead><tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]"><th className="px-6 py-3">User</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Position</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Joined</th><th className="px-6 py-3" /></tr></thead><tbody className="divide-y divide-black/[0.05]">{data.items.map((entry) => <tr key={entry.id}><td className="px-6 py-4 font-mono text-xs">{entry.user_id}</td><td className="px-6 py-4 capitalize">{entry.participation_type}</td><td className="px-6 py-4">{entry.position ?? "—"}</td><td className="px-6 py-4 capitalize">{labels[entry.status]}</td><td className="px-6 py-4">{new Date(entry.joined_at).toLocaleString()}</td><td className="px-6 py-4 text-right">{entry.status === "expired" ? <button className="mr-3 text-[var(--accent)]" disabled={retry.isPending} onClick={() => retry.mutate(entry.id)}>Retry</button> : null}{(entry.status === "waiting" || entry.status === "promoted") ? <button className="text-[var(--danger)]" disabled={remove.isPending} onClick={() => remove.mutate(entry.id)}>Remove</button> : null}</td></tr>)}</tbody></table>}
    </GlassPanel>
    {(data?.total ?? 0) > pageSize && <div className="mt-4 flex items-center justify-between text-sm text-[var(--foreground-muted)]"><span>{data?.total} total entries</span><div className="flex gap-2"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page * pageSize >= (data?.total ?? 0)} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>}
  </div>;
}
