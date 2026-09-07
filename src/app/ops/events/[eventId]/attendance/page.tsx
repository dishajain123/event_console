"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventAttendanceParticipants, useEventAttendanceReport } from "@/hooks/useReports";

export default function EventAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("no_show");
  const report = useEventAttendanceReport(eventId);
  const participants = useEventAttendanceParticipants(eventId, { page, pageSize: 25, search, attendance });

  return <div>
    <Link href={`/ops/events/${eventId}`} className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"><ArrowLeft className="h-4 w-4" />{event?.name ?? "Back to event"}</Link>
    <Header title="Attendance Analytics" />
    {report.isError ? <ErrorState description="Unable to load attendance analytics." onRetry={() => report.refetch()} /> : report.isLoading ? <div className="p-6 text-sm text-[var(--foreground-muted)]">Loading attendance metrics...</div> : report.data ? <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Eligible participants" value={report.data.eligible_registrations} icon={BarChart3} tone="accent" />
        <KPICard label="Checked-in participants" value={report.data.checked_in_participants} icon={BarChart3} tone="success" />
        <KPICard label="No-shows" value={report.data.no_shows} icon={BarChart3} tone="warning" />
        <KPICard label="Attendance rate" value={report.data.attendance_rate_pct == null ? "—" : `${report.data.attendance_rate_pct}%`} icon={BarChart3} tone="info" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassPanel><h2 className="mb-3 font-semibold">Event totals</h2><div className="grid grid-cols-2 gap-3 text-sm"><div>Registrations <strong>{report.data.total_registrations}</strong></div><div>Confirmed <strong>{report.data.confirmed_registrations}</strong></div><div>Cancelled <strong>{report.data.cancelled_registrations}</strong></div><div>Refund-related <strong>{report.data.refund_related_registrations}</strong></div><div>Valid tickets <strong>{report.data.valid_tickets}</strong></div><div>Active tickets <strong>{report.data.active_tickets}</strong></div><div>Total entries <strong>{report.data.total_entries}</strong></div><div>Re-entries <strong>{report.data.reentry_count}</strong></div><div>Capacity utilization <strong>{report.data.capacity_utilization_pct == null ? "—" : `${report.data.capacity_utilization_pct}%`}</strong></div><div>Peak entries <strong>{report.data.peak_entry_count}</strong></div></div></GlassPanel>
        <GlassPanel><h2 className="mb-3 font-semibold">Access type breakdown</h2>{report.data.by_access_type.length ? <div className="space-y-2 text-sm">{report.data.by_access_type.map((row) => <div key={row.access_type} className="flex justify-between border-b pb-2"><span className="uppercase">{row.access_type}</span><span>{row.unique_attendees} attendees · {row.entries} entries</span></div>)}</div> : <EmptyState title="No check-ins yet" description="Access breakdowns appear after the first valid scan." />}</GlassPanel>
      </div>
      <GlassPanel padded={false}><div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><h2 className="font-semibold">Participant attendance</h2><div className="flex gap-2"><Input className="w-48" placeholder="Search participant" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /><Select value={attendance} onChange={(e) => { setAttendance(e.target.value); setPage(1); }}><option value="no_show">No-shows</option><option value="attended">Attended</option></Select></div></div>{participants.isError ? <div className="p-6"><ErrorState description="Unable to load participants." onRetry={() => participants.refetch()} /></div> : participants.isLoading ? <div className="p-6 text-sm text-[var(--foreground-muted)]">Loading participants...</div> : !participants.data?.items.length ? <div className="p-6"><EmptyState title="No matching participants" description="Try another attendance filter or search." /></div> : <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-[var(--foreground-muted)]"><th className="p-4">Participant</th><th className="p-4">Registration</th><th className="p-4">Access</th><th className="p-4">Entries</th><th className="p-4">Last check-in</th></tr></thead><tbody>{participants.data.items.map((row) => <tr key={row.registration_id} className="border-b"><td className="p-4">{row.participant_name ?? "Unnamed participant"}</td><td className="p-4 capitalize">{row.registration_status.replaceAll("_", " ")}</td><td className="p-4 uppercase">{row.access_type ?? "—"}</td><td className="p-4">{row.entry_count}</td><td className="p-4">{row.last_check_in ? new Date(row.last_check_in).toLocaleString() : "No check-in"}</td></tr>)}</tbody></table>}<div className="flex items-center justify-between border-t p-4 text-xs text-[var(--foreground-muted)]"><span>{participants.data?.total ?? 0} matching records · Page {page}</span><div className="flex gap-2"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={!participants.data || page * participants.data.page_size >= participants.data.total} onClick={() => setPage((value) => value + 1)}>Next</button></div></div></GlassPanel>
      <p className="mt-4 flex items-center gap-1 text-xs text-[var(--foreground-subtle)]"><RefreshCw className="h-3 w-3" /> Metrics refresh every 30 seconds. Attendance facts are derived by the backend.</p>
    </> : null}
  </div>;
}
