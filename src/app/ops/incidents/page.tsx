"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useIncident, useIncidents, useUpdateIncident } from "@/hooks/useIncidents";
import { cn } from "@/lib/utils";
import type { IncidentOut, IncidentSeverity, IncidentStatus } from "@/types/incidents";

const statuses: IncidentStatus[] = ["open", "acknowledged", "in_progress", "resolved", "closed", "cancelled"];
const severities: IncidentSeverity[] = ["low", "medium", "high", "critical"];

function severityTone(severity: string): "danger" | "warning" | "neutral" {
  if (severity === "critical") return "danger";
  if (severity === "high" || severity === "medium") return "warning";
  return "neutral";
}

function IncidentRow({ incident, onSelect }: { incident: IncidentOut; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full border-b border-[var(--border)] p-4 text-left transition-colors last:border-b-0 hover:bg-black/[0.02]",
        incident.severity === "critical" && "border-l-2 border-l-[var(--danger)]",
        incident.severity === "high" && "border-l-2 border-l-[var(--warning)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">{incident.title}</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">{incident.category} · event {incident.event_id}</p>
        </div>
        <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
      </div>
      <p className="mt-2 text-xs capitalize text-[var(--foreground-subtle)]">
        {incident.status.replaceAll("_", " ")} · {new Date(incident.created_at).toLocaleString()}
      </p>
    </button>
  );
}

/** Same `useIncident`/`useUpdateIncident` hooks and mutation payloads as before. */
function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const [assignedUserId, setAssignedUserId] = useState("");
  const { data, isLoading, isError } = useIncident(id);
  const mutation = useUpdateIncident(id);

  if (isLoading) {
    return (
      <GlassPanel>
        <p className="text-sm text-[var(--foreground-muted)]">Loading incident…</p>
      </GlassPanel>
    );
  }
  if (isError || !data) {
    return (
      <GlassPanel>
        <ErrorState title="Unable to load incident" />
      </GlassPanel>
    );
  }

  return (
    <GlassPanel>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">{data.title}</p>
          <p className="text-sm text-[var(--foreground-muted)]">{data.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Status</label>
          <Select value={data.status} onChange={(e) => mutation.mutate({ status: e.target.value as IncidentStatus })}>
            {statuses.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Severity</label>
          <Select value={data.severity} onChange={(e) => mutation.mutate({ severity: e.target.value as IncidentSeverity })}>
            {severities.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="mt-3.5 flex gap-2">
        <Input
          className="max-w-md"
          placeholder="Authorized assignee user ID"
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        />
        <Button
          variant="outline"
          loading={mutation.isPending}
          disabled={!assignedUserId}
          onClick={() => mutation.mutate({ assigned_user_id: assignedUserId })}
        >
          Assign
        </Button>
      </div>
      <p className="mt-3.5 text-xs text-[var(--foreground-subtle)]">
        Reporter: {data.reporter_user_id} · Assigned: {data.assigned_user_id ?? "Unassigned"}
      </p>
    </GlassPanel>
  );
}

const PAGE_SIZE = 25;

/** Same `useIncidents` hook and filter params as before. */
export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const result = useIncidents({ search, eventId: eventId || undefined, status: status || undefined, severity: severity || undefined, page, pageSize: PAGE_SIZE });
  const isFiltered = !!(search || eventId || status || severity);
  const totalPages = result.data ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1;

  return (
    <div>
      <Header title="Incidents" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">Event-scoped operational incident management.</p>

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setSearch("");
          setEventId("");
          setStatus("");
          setSeverity("");
          setPage(1);
        }}
      >
        <Input
          className="max-w-xs"
          placeholder="Search title or description"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Input
          className="max-w-[220px]"
          placeholder="Event ID"
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setPage(1);
          }}
        />
        <Select
          className="w-44"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {statuses.map((v) => (
            <option key={v} value={v} className="capitalize">
              {v.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
        <Select
          className="w-40"
          value={severity}
          onChange={(e) => {
            setSeverity(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All severities</option>
          {severities.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </Select>
      </FilterBar>

      {selected && (
        <div className="mb-4">
          <Detail id={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {result.isLoading ? (
        <GlassPanel>
          <p className="text-sm text-[var(--foreground-muted)]">Loading incidents…</p>
        </GlassPanel>
      ) : result.isError ? (
        <ErrorState title="Unable to load incidents" onRetry={() => result.refetch()} />
      ) : result.data?.items.length ? (
        <GlassPanel padded={false}>
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3.5">
            <ShieldAlert className="h-4 w-4 text-[var(--accent)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {result.data.total} incident{result.data.total === 1 ? "" : "s"}
            </p>
          </div>
          {result.data.items.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} onSelect={() => setSelected(incident.id)} />
          ))}
          <Pagination page={page} totalPages={totalPages} totalItems={result.data.total} onPageChange={setPage} />
        </GlassPanel>
      ) : (
        <EmptyState icon={AlertTriangle} title="No incidents found" description="No incidents match the selected filters." />
      )}
    </div>
  );
}