"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, ClipboardCheck, CreditCard, ListOrdered, RefreshCw, Ticket, Users2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CardSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { useOperationsCommandCenter } from "@/hooks/useReports";
import type { OperationsEventSummaryOut } from "@/types/reports";

function sum(values: Record<string, number>, keys: string[]) {
  return keys.reduce((total, key) => total + (values[key] ?? 0), 0);
}

function severityClass(severity: string) {
  return severity === "critical" ? "border-red-200 bg-red-50 text-red-700" : severity === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700";
}

function EventRow({ event }: { event: OperationsEventSummaryOut }) {
  return <Link href={`/ops/events/${event.event_id}`} className="flex items-center justify-between gap-4 border-b border-black/[0.05] py-3 last:border-0 hover:bg-black/[0.02]">
    <div><p className="text-sm font-medium text-[var(--foreground)]">{event.event_name}</p><p className="text-xs capitalize text-[var(--foreground-muted)]">{event.registration_status} · {event.event_status.replaceAll("_", " ")}</p></div>
    <div className="text-right text-xs text-[var(--foreground-muted)]"><p>{event.capacity_used}/{event.capacity ?? "unlimited"} registered</p><p>{event.tickets.checked_in ?? 0} checked in · {event.waitlist.waiting ?? 0} waiting</p></div>
  </Link>;
}

export default function OpsDashboardPage() {
  const [eventId, setEventId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useOperationsCommandCenter({ eventId, page, pageSize, search });
  const totals = data?.totals;
  const alerts = data?.alerts ?? [];

  return <div>
    <Header title="Operations Command Center" />
    <div className="mb-5 flex flex-wrap items-center gap-3"><Input className="max-w-sm" placeholder="Search events" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} /><select className="h-10 rounded-[var(--radius-sm)] border border-black/[0.1] bg-white/70 px-3 text-sm" value={eventId ?? ""} onChange={(e) => { setPage(1); setEventId(e.target.value || undefined); }}><option value="">All accessible events</option>{(data?.items ?? []).map((event) => <option key={event.event_id} value={event.event_id}>{event.event_name}</option>)}</select><button className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-black/[0.1] px-3 text-sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" />Refresh</button>{dataUpdatedAt ? <span className="text-xs text-[var(--foreground-subtle)]">Updated {new Date(dataUpdatedAt).toLocaleTimeString()}</span> : null}</div>

    {isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <CardSkeleton key={index} />)}</div> : isError ? <ErrorState title="Couldn't load operations" description="The backend command center is unavailable." onRetry={() => refetch()} /> : !data ? <EmptyState icon={CalendarDays} title="No operations data" description="Create or assign an event to begin monitoring operations." /> : <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Registrations" value={sum(totals?.registrations ?? {}, ["confirmed", "checked_in", "approved"])} icon={Users2} tone="accent" hint={`${sum(totals?.registrations ?? {}, ["submitted", "pending_verification", "pending_payment"])} pending`} />
        <KPICard label="Checked in" value={totals?.tickets.checked_in ?? 0} icon={ClipboardCheck} tone="success" hint={`${totals?.tickets.issued ?? 0} tickets issued`} />
        <KPICard label="Waiting list" value={totals?.waitlist.waiting ?? 0} icon={ListOrdered} tone="warning" hint={`${totals?.waitlist.promoted ?? 0} promoted`} />
        <KPICard label="Payment failures" value={totals?.payments.failed ?? 0} icon={CreditCard} tone="warning" hint={`${totals?.reconciliation_attention ?? 0} reconciliation items`} />
        <KPICard label="Refunds pending" value={sum(totals?.refunds ?? {}, ["draft", "pending_admin_approval", "approved", "processing"])} icon={RefreshCw} tone="info" />
        <KPICard label="Failed notifications" value={totals?.failed_notifications ?? 0} icon={AlertTriangle} tone="warning" />
        <KPICard label="Open incidents" value={totals?.open_incidents ?? 0} icon={AlertTriangle} tone="warning" />
        <KPICard label="Critical incidents" value={totals?.critical_incidents ?? 0} icon={AlertTriangle} tone="warning" />
        <KPICard label="Feedback submitted" value={totals?.feedback_submitted ?? 0} icon={Ticket} tone="neutral" />
        <KPICard label="Events in view" value={data.total} icon={CalendarDays} tone="accent" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassPanel><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Operational alerts</h2><span className="text-xs text-[var(--foreground-muted)]">Derived from live records</span></div>{alerts.length === 0 ? <EmptyState icon={AlertTriangle} title="No action required" description="No current operational alerts were detected." /> : <div className="space-y-2">{alerts.map((alert, index) => alert.target_path ? <Link key={`${alert.code}-${alert.event_id}-${index}`} href={alert.target_path} className={`block rounded border p-3 text-sm ${severityClass(alert.severity)}`}><div className="flex justify-between gap-3"><span>{alert.title}</span>{alert.count > 0 ? <strong>{alert.count}</strong> : null}</div></Link> : <div key={`${alert.code}-${index}`} className={`rounded border p-3 text-sm ${severityClass(alert.severity)}`}>{alert.title}</div>)}</div>}</GlassPanel>
        <GlassPanel><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Recent incidents</h2><Link href="/ops/incidents" className="text-xs text-[var(--accent)]">View all</Link></div>{data.recent_incidents.length === 0 ? <p className="text-sm text-[var(--foreground-muted)]">No incidents reported.</p> : <div className="space-y-2">{data.recent_incidents.slice(0, 5).map((incident) => <Link key={incident.id} href={`/ops/incidents?event_id=${incident.event_id}`} className={`block rounded border p-3 text-sm ${severityClass(incident.severity === "critical" ? "critical" : incident.severity === "high" ? "warning" : "info")}`}><span className="font-medium">{incident.title}</span><span className="ml-2 text-xs capitalize">{incident.status.replaceAll("_", " ")}</span></Link>)}</div>}</GlassPanel>
        <GlassPanel><h2 className="mb-3 text-sm font-semibold">Events</h2>{data.items.length === 0 ? <EmptyState icon={CalendarDays} title="No matching events" description="Try another event search or filter." /> : <div>{data.items.map((event) => <EventRow key={event.event_id} event={event} />)}</div>}{data.total > pageSize ? <div className="mt-4 flex justify-between text-sm"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>{page} / {Math.ceil(data.total / pageSize)}</span><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page * pageSize >= data.total} onClick={() => setPage((value) => value + 1)}>Next</button></div> : null}</GlassPanel>
      </div>
    </>}
  </div>;
}
