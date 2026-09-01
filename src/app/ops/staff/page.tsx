"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users2, Plus, History, UserX, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { StaffStatusBadge } from "@/components/staff/staff-status-badge";
import { InviteStaffDialog } from "@/components/staff/invite-staff-dialog";
import { StaffHistoryDrawer } from "@/components/staff/staff-history-drawer";
import { useEvents } from "@/hooks/useEvents";
import { useRevokeStaffAssignment, useStaffAssignments } from "@/hooks/useStaff";
import { STAFF_ROLE_OPTIONS } from "@/types/staff";
import type { StaffAssignmentOut } from "@/types/staff";

export default function StaffAccountsPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState<string>("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<StaffAssignmentOut | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<StaffAssignmentOut | null>(null);

  const { data: assignments, isLoading, isError, refetch } = useStaffAssignments(eventId);
  const revoke = useRevokeStaffAssignment(eventId);

  const roleLabel = (roleName: string | null) =>
    STAFF_ROLE_OPTIONS.find((r) => r.value === roleName)?.label ?? roleName ?? "—";

  async function handleRevoke() {
    if (!revokeTarget) return;
    await revoke.mutateAsync(revokeTarget.id);
    toast.success("Access revoked", {
      description: "Their permissions for this event have been removed immediately.",
    });
  }

  return (
    <div>
      <Header title="Staff Accounts" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select className="w-64" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Select an event…</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
        {eventId && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="h-4 w-4" />
            Invite staff
          </Button>
        )}
      </div>

      {!eventId ? (
        <GlassPanel>
          <EmptyState
            icon={Users2}
            title="Pick an event to manage its staff"
            description="Every field-role account — Event Manager, Event Coordinator, Staff Lead, Staff Member — is created per event, invitation-based, from here."
          />
        </GlassPanel>
      ) : (
        <GlassPanel padded={false}>
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} cols={5} />
            </div>
          ) : isError ? (
            <div className="p-6">
              <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
            </div>
          ) : !assignments || assignments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users2}
                title="No staff invited yet"
                description="Invite Event Managers, Coordinators, Staff Leads, or Staff Members for this event."
                action={{ label: "Invite staff", onClick: () => setInviteOpen(true) }}
              />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                  <th className="px-6 py-3 font-medium">Person</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="transition-colors hover:bg-black/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--foreground)]">
                        {assignment.full_name || assignment.invitee_mobile}
                      </p>
                      {assignment.full_name && (
                        <p className="text-xs text-[var(--foreground-muted)]">{assignment.invitee_mobile}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--foreground)]">{assignment.role_label}</p>
                      <p className="text-xs text-[var(--foreground-subtle)]">{roleLabel(assignment.role_name)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StaffStatusBadge status={assignment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setHistoryTarget(assignment)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        {assignment.status !== "revoked" && (
                          <Button size="sm" variant="ghost" onClick={() => setRevokeTarget(assignment)}>
                            <UserX className="h-3.5 w-3.5 text-[var(--danger)]" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassPanel>
      )}

      {eventId && <InviteStaffDialog eventId={eventId} open={inviteOpen} onClose={() => setInviteOpen(false)} />}
      {historyTarget && (
        <StaffHistoryDrawer eventId={eventId} assignment={historyTarget} onClose={() => setHistoryTarget(null)} />
      )}
      <ConfirmActionDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title={`Revoke access for "${revokeTarget?.full_name || revokeTarget?.invitee_mobile}"?`}
        description="This immediately removes their permissions for this event — not just their invitation status."
        confirmLabel="Revoke access"
        tone="danger"
        onConfirm={handleRevoke}
      />
    </div>
  );
}
