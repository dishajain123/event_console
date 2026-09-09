"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  ListOrdered,
  RefreshCw,
  Ticket,
  Users2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { CardSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useOperationsCommandCenter } from "@/hooks/useReports";
import type { OperationsAlertOut, OperationsEventSummaryOut, OperationsIncidentSummaryOut } from "@/types/reports";

/** Unchanged helper — sums a subset of keys out of a totals record. */
function sum(values: Record<string, number>, keys: string[]) {
  return keys.reduce((total, key) => total + (values[key] ?? 0), 0);
}

function severityTone(severity: string): "danger" | "warning" | "info" {
  if (severity === "critical") return "danger";
  if (severity === "warning" || severity === "high") return "warning";
  return "info";
}

function AlertRow({ alert }: { alert: OperationsAlertOut }) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2.5 text-sm transition-colors hover:bg-[var(--surface-muted)]">
      <div className="flex items-center gap-2 min-w-0">
        <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
        <span className="truncate text-[var(--foreground)]">{alert.title}</span>
      </div>
      {alert.count > 0 && <strong className="shrink-0 text-[var(--foreground)]">{alert.count}</strong>}
    </div>
  );
  return alert.target_path ? (
    <Link href={alert.target_path} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

function IncidentRow({ incident }: { incident: OperationsIncidentSummaryOut }) {
  return (
    <Link
      href={`/ops/incidents?event_id=${incident.event_id}`}
      className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2.5 text-sm transition-colors hover:bg-[var(--surface-muted)]"
    >
      <span className="truncate text-[var(--foreground)]">{incident.title}</span>
      <div className="flex shrink-0 items-center gap-2">
        <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
        <span className="text-xs capitalize text-[var(--foreground-subtle)]">
          {incident.status.replaceAll("_", " ")}
        </span>
      </div>
    </Link>
  );
}

function EventRow({ event }: { event: OperationsEventSummaryOut }) {
  return (
    <Link
      href={`/ops/events/${event.event_id}`}
      className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">{event.event_name}</p>
        <p className="text-xs capitalize text-[var(--foreground-muted)]">
          {event.registration_status} · {event.event_status.replaceAll("_", " ")}
        </p>
      </div>
      <div className="shrink-0 text-right text-xs text-[var(--foreground-muted)]">
        <p>{event.capacity_used}/{event.capacity ?? "unlimited"} registered</p>
        <p>{event.tickets.checked_in ?? 0} checked in · {event.waitlist.waiting ?? 0} waiting</p>
      </div>
    </Link>
  );
}

/**
 * Same hook, same query args ({ eventId, page, pageSize, search }), and
 * the same derived totals/alerts fields as before — this is a layout
 * and density redesign only, no new or fabricated data. KPI cards now
 * fit 5-per-row; Alerts and Recent Incidents ("what needs attention")
 * sit in their own row above the Events table ("what's happening"),
 * instead of all three being cramped into one 3-column row.
 */
export default function OpsDashboardPage() {
  const [eventId, setEventId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useOperationsCommandCenter({ eventId, page, pageSize, search });
  const totals = data?.totals;
  const alerts = data?.alerts ?? [];
  const isFiltered = Boolean(search) || Boolean(eventId);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div>
      <Header title="Operations Command Center" />
      <PageToolbar
        meta={dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : undefined}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />
      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setSearch("");
          setEventId(undefined);
          setPage(1);
        }}
      >
        <Input
          className="max-w-sm"
          placeholder="Search events"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <Select
          className="w-56"
          value={eventId ?? ""}
          onChange={(e) => {
            setPage(1);
            setEventId(e.target.value || undefined);
          }}
        >
          <option value="">All accessible events</option>
          {(data?.items ?? []).map((event) => (
            <option key={event.event_id} value={event.event_id}>
              {event.event_name}
            </option>
          ))}
        </Select>
      </FilterBar>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title="Couldn't load operations" description="The backend command center is unavailable." onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={CalendarDays} title="No operations data" description="Create or assign an event to begin monitoring operations." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <KPICard
              label="Registrations"
              value={sum(totals?.registrations ?? {}, ["confirmed", "checked_in", "approved"])}
              icon={Users2}
              tone="accent"
              hint={`${sum(totals?.registrations ?? {}, ["submitted", "pending_verification", "pending_payment"])} pending`}
            />
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

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GlassPanel>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Operational alerts</h2>
                <span className="text-xs text-[var(--foreground-subtle)]">Derived from live records</span>
              </div>
              {alerts.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="No action required" description="No current operational alerts were detected." />
              ) : (
                <div className="space-y-1.5">
                  {alerts.map((alert, index) => (
                    <AlertRow key={`${alert.code}-${alert.event_id}-${index}`} alert={alert} />
                  ))}
                </div>
              )}
            </GlassPanel>

            <GlassPanel>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Recent incidents</h2>
                <Link href="/ops/incidents" className="text-xs font-medium text-[var(--accent-strong)]">
                  View all
                </Link>
              </div>
              {data.recent_incidents.length === 0 ? (
                <p className="py-6 text-center text-sm text-[var(--foreground-muted)]">No incidents reported.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.recent_incidents.slice(0, 5).map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))}
                </div>
              )}
            </GlassPanel>
          </div>

          <div className="mt-5">
            <GlassPanel padded={false}>
              <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Events</h2>
                <span className="text-xs text-[var(--foreground-subtle)]">{data.total} in view</span>
              </div>
              {data.items.length === 0 ? (
                <div className="p-4">
                  <EmptyState icon={CalendarDays} title="No matching events" description="Try another event search or filter." />
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {data.items.map((event) => (
                    <EventRow key={event.event_id} event={event} />
                  ))}
                </div>
              )}
              <Pagination page={page} totalPages={totalPages} totalItems={data.total} onPageChange={setPage} />
            </GlassPanel>
          </div>
        </>
      )}
    </div>
  );
}