"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvent } from "@/hooks/useEvents";
import { useEventAttendanceParticipants, useEventAttendanceReport } from "@/hooks/useReports";

const PAGE_SIZE = 25;

/** Same `useEventAttendanceReport`/`useEventAttendanceParticipants` hooks and filter shape as before. */
export default function EventAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState("no_show");
  const report = useEventAttendanceReport(eventId);
  const participants = useEventAttendanceParticipants(eventId, { page, pageSize: PAGE_SIZE, search, attendance });
  const isFiltered = search !== "" || attendance !== "no_show";

  return (
    <div>
      <Link href={`/ops/events/${eventId}`} className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>
      <Header title="Attendance Analytics" />

      {report.isError ? (
        <ErrorState description="Unable to load attendance analytics." onRetry={() => report.refetch()} />
      ) : report.isLoading ? (
        <div className="p-5 text-sm text-[var(--foreground-muted)]">Loading attendance metrics…</div>
      ) : report.data ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KPICard label="Eligible participants" value={report.data.eligible_registrations} icon={BarChart3} tone="accent" />
            <KPICard label="Checked-in participants" value={report.data.checked_in_participants} icon={BarChart3} tone="success" />
            <KPICard label="No-shows" value={report.data.no_shows} icon={BarChart3} tone="warning" />
            <KPICard label="Attendance rate" value={report.data.attendance_rate_pct == null ? "—" : `${report.data.attendance_rate_pct}%`} icon={BarChart3} tone="info" />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Event totals</h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-[var(--foreground)]">
                <div>Registrations <strong>{report.data.total_registrations}</strong></div>
                <div>Confirmed <strong>{report.data.confirmed_registrations}</strong></div>
                <div>Cancelled <strong>{report.data.cancelled_registrations}</strong></div>
                <div>Refund-related <strong>{report.data.refund_related_registrations}</strong></div>
                <div>Valid tickets <strong>{report.data.valid_tickets}</strong></div>
                <div>Active tickets <strong>{report.data.active_tickets}</strong></div>
                <div>Total entries <strong>{report.data.total_entries}</strong></div>
                <div>Re-entries <strong>{report.data.reentry_count}</strong></div>
                <div>Capacity utilization <strong>{report.data.capacity_utilization_pct == null ? "—" : `${report.data.capacity_utilization_pct}%`}</strong></div>
                <div>Peak entries <strong>{report.data.peak_entry_count}</strong></div>
              </div>
            </GlassPanel>
            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Access type breakdown</h2>
              {report.data.by_access_type.length ? (
                <div className="space-y-2 text-sm">
                  {report.data.by_access_type.map((row) => (
                    <div key={row.access_type} className="flex justify-between border-b border-[var(--border)] pb-2 last:border-b-0">
                      <span className="uppercase text-[var(--foreground-muted)]">{row.access_type}</span>
                      <span className="text-[var(--foreground)]">{row.unique_attendees} attendees · {row.entries} entries</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No check-ins yet" description="Access breakdowns appear after the first valid scan." />
              )}
            </GlassPanel>
          </div>

          <GlassPanel padded={false} className="mb-4">
            <div className="border-b border-[var(--border)] px-5 py-3.5">
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Participant attendance</h2>
              <FilterBar
                className="mb-0"
                isFiltered={isFiltered}
                onReset={() => {
                  setSearch("");
                  setAttendance("no_show");
                  setPage(1);
                }}
              >
                <Input
                  className="w-48"
                  placeholder="Search participant"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
                <Select
                  className="w-36"
                  value={attendance}
                  onChange={(e) => {
                    setAttendance(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="no_show">No-shows</option>
                  <option value="attended">Attended</option>
                </Select>
              </FilterBar>
            </div>
            {participants.isError ? (
              <div className="p-5">
                <ErrorState description="Unable to load participants." onRetry={() => participants.refetch()} />
              </div>
            ) : participants.isLoading ? (
              <div className="p-5 text-sm text-[var(--foreground-muted)]">Loading participants…</div>
            ) : !participants.data?.items.length ? (
              <div className="p-5">
                <EmptyState title="No matching participants" description="Try another attendance filter or search." />
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Participant</TableHeaderCell>
                      <TableHeaderCell>Registration</TableHeaderCell>
                      <TableHeaderCell>Access</TableHeaderCell>
                      <TableHeaderCell>Entries</TableHeaderCell>
                      <TableHeaderCell>Last check-in</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participants.data.items.map((row) => (
                      <TableRow key={row.registration_id}>
                        <TableCell className="text-[var(--foreground)]">{row.participant_name ?? "Unnamed participant"}</TableCell>
                        <TableCell className="capitalize text-[var(--foreground-muted)]">{row.registration_status.replaceAll("_", " ")}</TableCell>
                        <TableCell className="uppercase text-[var(--foreground-muted)]">{row.access_type ?? "—"}</TableCell>
                        <TableCell className="text-[var(--foreground-muted)]">{row.entry_count}</TableCell>
                        <TableCell className="text-[var(--foreground-muted)]">
                          {row.last_check_in ? new Date(row.last_check_in).toLocaleString() : "No check-in"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Pagination
              page={page}
              totalPages={participants.data ? Math.max(1, Math.ceil(participants.data.total / participants.data.page_size)) : 1}
              totalItems={participants.data?.total}
              onPageChange={setPage}
            />
          </GlassPanel>

          <p className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
            <RefreshCw className="h-3 w-3" /> Metrics refresh every 30 seconds. Attendance facts are derived by the backend.
          </p>
        </>
      ) : null}
    </div>
  );
}