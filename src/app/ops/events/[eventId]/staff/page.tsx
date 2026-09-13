"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Users2, History, X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { useAssignableVenues } from "@/hooks/useEvents";
import {
  useCreateStaffAssignment,
  useReassignStaffAssignment,
  useRevokeStaffAssignment,
  useStaffAssignmentHistory,
  useStaffAssignments,
} from "@/hooks/useStaff";
import { STAFF_ASSIGNMENT_STATUS_LABELS, STAFF_ROLE_OPTIONS, type StaffAssignmentOut, type StaffRoleName } from "@/types/staff";

const STATUS_TONE: Record<string, "neutral" | "accent" | "success" | "warning" | "info" | "danger"> = {
  invited: "info",
  active: "success",
  revoked: "neutral",
};

function AssignmentHistorySheet({ eventId, assignmentId, onClose }: { eventId: string; assignmentId: string; onClose: () => void }) {
  const { data: history, isLoading } = useStaffAssignmentHistory(eventId, assignmentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="fade-in max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <History className="h-4 w-4" /> Assignment history
          </h3>
          <button onClick={onClose} className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        {isLoading ? (
          <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
        ) : !history || history.length === 0 ? (
          <p className="text-sm text-[var(--foreground-muted)]">No history yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--border)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--foreground-subtle)]">
                  <span className="font-medium capitalize text-[var(--foreground)]">{entry.action.replaceAll("_", " ")}</span>
                  <span>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                {entry.notes && <p className="mt-1 text-sm text-[var(--foreground-muted)]">{entry.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Closes a real gap: the console had a full CRUD API + hooks for staff
 * assignments (create/reassign/revoke/history) but no page anywhere that
 * actually rendered a form to use them — an Event Manager had no way to
 * assign a task/role to a volunteer at all. This is that missing page.
 */
export default function EventStaffPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: assignments, isLoading, isError, refetch } = useStaffAssignments(eventId);
  const { data: venues } = useAssignableVenues(eventId);
  const createAssignment = useCreateStaffAssignment(eventId);
  const reassignAssignment = useReassignStaffAssignment(eventId);
  const revokeAssignment = useRevokeStaffAssignment(eventId);

  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [form, setForm] = useState({
    invitee_mobile: "",
    full_name: "",
    role_name: STAFF_ROLE_OPTIONS[0]?.value ?? ("staff_member" as StaffRoleName),
    role_label: "",
    venue_id: "",
  });

  const canSubmit = form.invitee_mobile.trim() !== "" && form.role_label.trim() !== "";

  function resetForm() {
    setForm({ invitee_mobile: "", full_name: "", role_name: STAFF_ROLE_OPTIONS[0]?.value ?? ("staff_member" as StaffRoleName), role_label: "", venue_id: "" });
  }

  const active = (assignments ?? []).filter((a) => a.status !== "revoked");
  const revoked = (assignments ?? []).filter((a) => a.status === "revoked");

  return (
    <div>
      <div className="fade-in mb-4 flex items-center justify-between">
        <Link
          href={`/ops/events/${eventId}`}
          className="flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to event
        </Link>
      </div>

      <Header title="Staff & Volunteers" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">
        Invite staff/volunteers to this event, assign their role and task label, and track who has accepted.
      </p>

      <GlassPanel className="rise-in mb-4">
        <h2 className="mb-3.5 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <UserPlus className="h-4 w-4" /> Invite staff / volunteer
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            placeholder="Mobile number (e.g. +919700000003)"
            value={form.invitee_mobile}
            onChange={(e) => setForm((f) => ({ ...f, invitee_mobile: e.target.value }))}
          />
          <Input
            placeholder="Full name (optional)"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
          <Select
            value={form.role_name}
            onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value as StaffRoleName }))}
          >
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Task / role label (e.g. Gate Marshal, Registration Desk)"
            className="sm:col-span-2"
            value={form.role_label}
            onChange={(e) => setForm((f) => ({ ...f, role_label: e.target.value }))}
          />
          <Select value={form.venue_id} onChange={(e) => setForm((f) => ({ ...f, venue_id: e.target.value }))}>
            <option value="">No specific venue</option>
            {(venues ?? []).map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </Select>
        </div>
        {createAssignment.isError && (
          <p role="alert" className="mt-2 text-sm text-[var(--danger)]">
            {(createAssignment.error as Error)?.message ?? "Couldn't create this assignment."}
          </p>
        )}
        <Button
          className="mt-3.5"
          size="sm"
          loading={createAssignment.isPending}
          disabled={!canSubmit}
          onClick={() => {
            createAssignment.mutate(
              {
                invitee_mobile: form.invitee_mobile.trim(),
                full_name: form.full_name.trim() || null,
                role_name: form.role_name,
                role_label: form.role_label.trim(),
                venue_id: form.venue_id || null,
              },
              { onSuccess: resetForm },
            );
          }}
        >
          Send invitation
        </Button>
      </GlassPanel>

      <GlassPanel padded={false} className="mb-4">
        <h2 className="flex items-center gap-2 px-5 pt-4 text-sm font-semibold text-[var(--foreground)]">
          <Users2 className="h-4 w-4" /> Assignments
        </h2>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : active.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users2}
              title="No staff assigned yet"
              description="Invite a volunteer or staff member above to get started."
            />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name / Mobile</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Task label</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {active.map((assignment: StaffAssignmentOut) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <p className="font-medium text-[var(--foreground)]">{assignment.full_name || "Unnamed"}</p>
                      <p className="font-mono text-xs text-[var(--foreground-muted)]">{assignment.invitee_mobile}</p>
                    </TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">
                      {STAFF_ROLE_OPTIONS.find((o) => o.value === assignment.role_name)?.label ?? assignment.role_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-[var(--foreground)]">{assignment.role_label}</TableCell>
                    <TableCell>
                      <Badge tone={STATUS_TONE[assignment.status] ?? "neutral"}>
                        {STAFF_ASSIGNMENT_STATUS_LABELS[assignment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setHistoryFor(assignment.id)}>
                          History
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newLabel = window.prompt("New task / role label", assignment.role_label);
                            if (newLabel && newLabel !== assignment.role_label) {
                              reassignAssignment.mutate({ assignmentId: assignment.id, payload: { role_label: newLabel } });
                            }
                          }}
                        >
                          Reassign
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={revokeAssignment.isPending}
                          onClick={() => revokeAssignment.mutate(assignment.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassPanel>

      {revoked.length > 0 && (
        <GlassPanel padded={false}>
          <h2 className="px-5 pt-4 text-sm font-semibold text-[var(--foreground)]">Revoked</h2>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name / Mobile</TableHeaderCell>
                  <TableHeaderCell>Task label</TableHeaderCell>
                  <TableHeaderCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {revoked.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <p className="text-[var(--foreground-muted)]">{assignment.full_name || assignment.invitee_mobile}</p>
                    </TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{assignment.role_label}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setHistoryFor(assignment.id)}>
                          History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassPanel>
      )}

      {historyFor && (
        <AssignmentHistorySheet eventId={eventId} assignmentId={historyFor} onClose={() => setHistoryFor(null)} />
      )}
    </div>
  );
}
