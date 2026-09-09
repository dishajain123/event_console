"use client";

import { useState } from "react";
import { CalendarClock, UsersRound } from "lucide-react";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvents } from "@/hooks/useEvents";
import {
  useAssignVolunteer,
  useCreateVolunteerShift,
  useEligibleVolunteers,
  useShiftAssignments,
  useShiftAttendance,
  useUpdateShiftAssignment,
  useVolunteerShifts,
} from "@/hooks/useVolunteerShifts";
import type { VolunteerShift, VolunteerShiftAssignment } from "@/types/volunteerShifts";

/** Same shift-assignment hooks and mutations as before. */
function ShiftRow({ shift }: { shift: VolunteerShift }) {
  const [expanded, setExpanded] = useState(false);
  const assignments = useShiftAssignments(expanded ? shift.id : "");
  const eligible = useEligibleVolunteers(shift.id, expanded);
  const assign = useAssignVolunteer();
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const update = useUpdateShiftAssignment();

  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">{shift.title}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {shift.location || "No location"} · {new Date(shift.starts_at).toLocaleString()} to {new Date(shift.ends_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--foreground)]">
          <span className="capitalize">{shift.status.replaceAll("_", " ")}</span>
          <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
            <UsersRound className="h-3.5 w-3.5" />
            {shift.assigned_count}/{shift.required_count}
          </span>
          <Button size="sm" variant="outline" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Hide assignments" : "Assignments"}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-3 bg-[var(--surface-muted)] px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            <Select className="min-w-56" value={selectedVolunteer} onChange={(e) => setSelectedVolunteer(e.target.value)}>
              <option value="">Select approved volunteer</option>
              {(eligible.data?.items ?? []).map((volunteer) => (
                <option key={volunteer.user_id} value={volunteer.user_id}>
                  {volunteer.full_name}
                  {volunteer.preferred_responsibility ? ` · ${volunteer.preferred_responsibility}` : ""}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              onClick={() => {
                if (selectedVolunteer) {
                  assign.mutate({ shiftId: shift.id, userId: selectedVolunteer });
                  setSelectedVolunteer("");
                }
              }}
              loading={assign.isPending}
              disabled={!selectedVolunteer}
            >
              Assign approved volunteer
            </Button>
          </div>
          {assignments.isLoading ? (
            <p className="text-sm text-[var(--foreground-muted)]">Loading assignments…</p>
          ) : assignments.isError ? (
            <p className="text-sm text-[var(--danger)]">Unable to load assignments.</p>
          ) : !assignments.data?.items.length ? (
            <p className="text-sm text-[var(--foreground-muted)]">No volunteer requests or assignments yet.</p>
          ) : (
            <div className="space-y-2">
              {assignments.data.items.map((assignment) => (
                <AssignmentRow key={assignment.id} assignment={assignment} update={update} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AssignmentRow({
  assignment,
  update,
}: {
  assignment: VolunteerShiftAssignment;
  update: ReturnType<typeof useUpdateShiftAssignment>;
}) {
  const [showAttendance, setShowAttendance] = useState(false);
  const attendance = useShiftAttendance(assignment.id, showAttendance);

  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-[var(--foreground-muted)]">{assignment.user_id}</span>
        <span className="capitalize text-[var(--foreground)]">{assignment.status.replaceAll("_", " ")}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAttendance((value) => !value)}>
            {showAttendance ? "Hide attendance" : "Attendance"}
          </Button>
          {assignment.status === "requested" && (
            <>
              <Button size="sm" onClick={() => update.mutate({ id: assignment.id, status: "approved" })}>Approve</Button>
              <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: assignment.id, status: "rejected" })}>Reject</Button>
            </>
          )}
          {(assignment.status === "requested" || assignment.status === "approved" || assignment.status === "active") && (
            <Button size="sm" variant="danger" onClick={() => update.mutate({ id: assignment.id, status: "cancelled" })}>Cancel</Button>
          )}
        </div>
      </div>
      {showAttendance && (
        <p className="mt-2 text-xs text-[var(--foreground-muted)]">
          {attendance.isLoading
            ? "Loading attendance…"
            : attendance.data
              ? `${attendance.data.status.replaceAll("_", " ")} · ${
                  attendance.data.worked_seconds == null ? "No worked duration" : `${Math.round(attendance.data.worked_seconds / 60)} minutes`
                }`
              : "No attendance record yet"}
        </p>
      )}
    </div>
  );
}

/** Same `useVolunteerShifts`/`useCreateVolunteerShift` hooks and payload as before. */
export default function VolunteerShiftsPage() {
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ title: "", location: "", starts_at: "", ends_at: "", required_count: "1", required_role: "" });
  const events = useEvents({ page: 1 });
  const shifts = useVolunteerShifts({ eventId: eventId || undefined, page, search });
  const create = useCreateVolunteerShift();

  async function submit() {
    if (!eventId || !form.title || !form.starts_at || !form.ends_at) return;
    await create.mutateAsync({ eventId, payload: { ...form, required_count: Number(form.required_count), status: "open" } });
    setForm({ title: "", location: "", starts_at: "", ends_at: "", required_count: "1", required_role: "" });
  }

  const totalPages = shifts.data ? Math.max(1, Math.ceil(shifts.data.total / (shifts.data.page_size || 25))) : 1;
  const isFiltered = !!(eventId || search);

  return (
    <div>
      <Header title="Volunteer shifts" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">
        Create event-scoped shifts and review volunteer capacity from authoritative backend data.
      </p>

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setEventId("");
          setSearch("");
          setPage(1);
        }}
      >
        <Select
          className="w-56"
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All accessible events</option>
          {(events.data ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
        <Input
          className="max-w-xs"
          placeholder="Search shift title or location"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </FilterBar>

      <GlassPanel className="mb-4">
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Create shift</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Shift title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input
            type="number"
            min="1"
            placeholder="Required volunteers"
            value={form.required_count}
            onChange={(e) => setForm({ ...form, required_count: e.target.value })}
          />
          <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          <Input
            placeholder="Required role/skill (optional)"
            value={form.required_role}
            onChange={(e) => setForm({ ...form, required_role: e.target.value })}
          />
        </div>
        <Button className="mt-3.5" onClick={submit} loading={create.isPending} disabled={!eventId}>
          Create open shift
        </Button>
      </GlassPanel>

      {shifts.isLoading ? (
        <GlassPanel>
          <p className="text-sm text-[var(--foreground-muted)]">Loading shifts…</p>
        </GlassPanel>
      ) : shifts.isError ? (
        <ErrorState title="Unable to load volunteer shifts" onRetry={() => shifts.refetch()} />
      ) : !shifts.data?.items.length ? (
        <EmptyState icon={CalendarClock} title="No volunteer shifts" description="Create a shift or choose another accessible event." />
      ) : (
        <GlassPanel padded={false}>
          <div>
            {shifts.data.items.map((shift) => (
              <ShiftRow key={shift.id} shift={shift} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={shifts.data.total} onPageChange={setPage} />
        </GlassPanel>
      )}
    </div>
  );
}