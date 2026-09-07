"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useIncident, useIncidents, useUpdateIncident } from "@/hooks/useIncidents";
import type { IncidentOut, IncidentSeverity, IncidentStatus } from "@/types/incidents";

const statuses: IncidentStatus[] = ["open", "acknowledged", "in_progress", "resolved", "closed", "cancelled"];
const severities: IncidentSeverity[] = ["low", "medium", "high", "critical"];
function tone(severity: string) { return severity === "critical" ? "border-red-300 bg-red-50 text-red-800" : severity === "high" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white/50 text-slate-700"; }

function IncidentRow({ incident, onSelect }: { incident: IncidentOut; onSelect: () => void }) {
  return <button onClick={onSelect} className={`w-full border-b p-4 text-left hover:bg-black/[0.03] ${incident.severity === "critical" ? "border-l-4 border-l-red-500" : incident.severity === "high" ? "border-l-4 border-l-amber-500" : ""}`}><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{incident.title}</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">{incident.category} · event {incident.event_id}</p></div><span className={`rounded-full border px-2 py-1 text-xs font-semibold uppercase ${tone(incident.severity)}`}>{incident.severity}</span></div><p className="mt-2 text-xs capitalize text-[var(--foreground-muted)]">{incident.status.replaceAll("_", " ")} · {new Date(incident.created_at).toLocaleString()}</p></button>;
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const [assignedUserId, setAssignedUserId] = useState("");
  const { data, isLoading, isError } = useIncident(id);
  const mutation = useUpdateIncident(id);
  if (isLoading) return <GlassPanel><p>Loading incident...</p></GlassPanel>;
  if (isError || !data) return <GlassPanel><ErrorState title="Unable to load incident" /></GlassPanel>;
  return <GlassPanel><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold">{data.title}</p><p className="text-sm text-[var(--foreground-muted)]">{data.description}</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm">Status<select className="glass-input mt-1 h-11 w-full px-3" value={data.status} onChange={(e) => mutation.mutate({ status: e.target.value as IncidentStatus })}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><label className="text-sm">Severity<select className="glass-input mt-1 h-11 w-full px-3" value={data.severity} onChange={(e) => mutation.mutate({ severity: e.target.value as IncidentSeverity })}>{severities.map((severity) => <option key={severity} value={severity}>{severity}</option>)}</select></label></div><div className="mt-4 flex gap-2"><Input className="max-w-md" placeholder="Authorized assignee user ID" value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)} /><Button variant="outline" loading={mutation.isPending} disabled={!assignedUserId} onClick={() => mutation.mutate({ assigned_user_id: assignedUserId })}>Assign</Button></div><p className="mt-4 text-xs text-[var(--foreground-muted)]">Reporter: {data.reporter_user_id} · Assigned: {data.assigned_user_id ?? "Unassigned"}</p></GlassPanel>;
}

export default function IncidentsPage() {
  const [search, setSearch] = useState(""); const [eventId, setEventId] = useState(""); const [status, setStatus] = useState(""); const [severity, setSeverity] = useState(""); const [page, setPage] = useState(1); const [selected, setSelected] = useState<string | null>(null); const pageSize = 25;
  const result = useIncidents({ search, eventId: eventId || undefined, status: status || undefined, severity: severity || undefined, page, pageSize });
  return <div className="space-y-6"><Header title="Incidents" /><p className="-mt-4 text-sm text-[var(--foreground-muted)]">Event-scoped operational incident management.</p><div className="grid gap-3 md:grid-cols-4"><Input placeholder="Search title or description" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><Input placeholder="Event ID" value={eventId} onChange={(e) => { setEventId(e.target.value); setPage(1); }} /><select className="glass-input h-11 px-3" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{statuses.map((v) => <option key={v} value={v}>{v}</option>)}</select><select className="glass-input h-11 px-3" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1); }}><option value="">All severities</option>{severities.map((v) => <option key={v} value={v}>{v}</option>)}</select></div>{selected ? <Detail id={selected} onClose={() => setSelected(null)} /> : null}{result.isLoading ? <GlassPanel><p>Loading incidents...</p></GlassPanel> : result.isError ? <ErrorState title="Unable to load incidents" onRetry={() => result.refetch()} /> : result.data?.items.length ? <GlassPanel><div className="flex items-center gap-2 border-b p-4"><ShieldAlert className="h-5 w-5 text-[var(--accent)]" /><p className="text-sm font-semibold">{result.data.total} incident{result.data.total === 1 ? "" : "s"}</p></div>{result.data.items.map((incident) => <IncidentRow key={incident.id} incident={incident} onSelect={() => setSelected(incident.id)} />)}<div className="flex items-center justify-between p-4 text-sm"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((v) => v - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(result.data.total / pageSize))}</span><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page * pageSize >= result.data.total} onClick={() => setPage((v) => v + 1)}>Next</button></div></GlassPanel> : <EmptyState icon={AlertTriangle} title="No incidents found" description="No incidents match the selected filters." />}</div>;
}
