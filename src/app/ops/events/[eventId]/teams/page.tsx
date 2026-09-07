"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useEvent } from "@/hooks/useEvents";
import { useApproveTeam, useEventTeams, useTeamJoinRequests, useTeamManagement, useTeamMembers } from "@/hooks/useTeams";
import { TEAM_STATUS_LABELS, type TeamMemberOut, type TeamOut, type TeamStatus } from "@/types/teams";

const STATUS_TONE: Record<TeamStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  draft: "neutral",
  inviting: "warning",
  submitted: "accent",
  approved: "success",
  rejected: "danger",
  archived: "neutral",
};

export default function TeamsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: teams, isLoading, isError, refetch } = useEventTeams(eventId);
  const approveTeam = useApproveTeam(eventId);
  const [confirmTeam, setConfirmTeam] = useState<TeamOut | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamOut | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ title: string; description: string; run: () => Promise<void> } | null>(null);
  const { data: members, isLoading: membersLoading } = useTeamMembers(selectedTeam?.id ?? "");
  const { data: requests, isLoading: requestsLoading } = useTeamJoinRequests(selectedTeam?.id ?? "");
  const management = useTeamManagement(selectedTeam?.id ?? "", eventId);

  async function handleApprove() {
    if (!confirmTeam) return;
    await approveTeam.mutateAsync(confirmTeam.id);
    toast.success(`"${confirmTeam.name}" approved`, {
      description: "The team's underlying registration was approved too.",
    });
  }

  function ask(title: string, description: string, run: () => Promise<void>) {
    setConfirmAction({ title, description, run });
  }

  async function confirmManagementAction() {
    if (!confirmAction) return;
    await confirmAction.run();
    setConfirmAction(null);
    toast.success("Team updated");
  }

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>

      <Header title="Teams" />

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : !teams || teams.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users2}
              title="No teams yet"
              description="Teams created by captains through the mobile app will appear here once submitted."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Team</th>
                <th className="px-6 py-3 font-medium">Code</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {teams.map((team) => (
                <tr key={team.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">{team.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--foreground-muted)]">{team.team_code}</td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {team.submitted_at
                      ? new Date(team.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "Not submitted"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedTeam(team)}>Manage</Button>
                      {team.status === "submitted" && <Button size="sm" variant="outline" onClick={() => setConfirmTeam(team)}>Approve</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      {selectedTeam && (
        <GlassPanel className="mt-5" padded>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Manage {selectedTeam.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Team code: {selectedTeam.team_code}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedTeam(null)}>Close</Button>
          </div>
          <h3 className="mb-2 font-medium">Join requests</h3>
          {requestsLoading ? <p className="text-sm text-[var(--foreground-muted)]">Loading requests...</p> : !requests?.length ? <p className="mb-5 text-sm text-[var(--foreground-muted)]">No pending requests.</p> : (
            <div className="mb-5 space-y-2">
              {requests.filter((request) => request.status === "pending").map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded-lg border border-black/[0.06] p-3 text-sm">
                  <span>{request.user_id}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => ask("Approve join request?", "The user will be added to this team.", async () => { await management.respond.mutateAsync({ requestId: request.id, accept: true }); })}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => ask("Reject join request?", "The request will be rejected.", async () => { await management.respond.mutateAsync({ requestId: request.id, accept: false }); })}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <h3 className="mb-2 font-medium">Members</h3>
          {membersLoading ? <p className="text-sm text-[var(--foreground-muted)]">Loading members...</p> : !members?.length ? <p className="text-sm text-[var(--foreground-muted)]">No members.</p> : (
            <div className="space-y-2">
              {members.map((member) => <MemberRow key={member.id} member={member} onRemove={() => ask("Remove member?", "This member will lose access to the team.", async () => { await management.remove.mutateAsync(member.id); })} onRoleChange={(role) => management.setRole.mutateAsync({ memberId: member.id, role })} onAssignManager={() => management.assignManager.mutateAsync(member.user_id)} />)}
            </div>
          )}
        </GlassPanel>
      )}

      <ConfirmActionDialog
        open={!!confirmTeam}
        onOpenChange={(open) => !open && setConfirmTeam(null)}
        title={`Approve "${confirmTeam?.name}"?`}
        description="This also approves the team's underlying registration, unlocking payment and ticketing."
        confirmLabel="Approve team"
        onConfirm={handleApprove}
      />
      <ConfirmActionDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.title ?? "Confirm action"}
        description={confirmAction?.description ?? ""}
        confirmLabel="Confirm"
        onConfirm={confirmManagementAction}
      />
    </div>
  );
}

function MemberRow({ member, onRemove, onRoleChange, onAssignManager }: { member: TeamMemberOut; onRemove: () => void; onRoleChange: (role: "manager" | "member") => Promise<unknown>; onAssignManager: () => Promise<unknown> }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/[0.06] p-3 text-sm">
    <div><span className="font-medium">{member.full_name}</span><span className="ml-2 text-xs text-[var(--foreground-muted)]">{member.role}</span></div>
    {!member.is_captain && <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => void onRoleChange(member.role === "manager" ? "member" : "manager")}>{member.role === "manager" ? "Remove manager" : "Make manager"}</Button><Button size="sm" variant="outline" onClick={() => void onAssignManager()}>Assign manager</Button><Button size="sm" variant="outline" onClick={onRemove}>Remove</Button></div>}
  </div>;
}
