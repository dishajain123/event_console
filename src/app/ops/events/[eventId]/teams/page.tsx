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
import { useApproveTeam, useEventTeams } from "@/hooks/useTeams";
import { TEAM_STATUS_LABELS, type TeamOut, type TeamStatus } from "@/types/teams";

const STATUS_TONE: Record<TeamStatus, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  draft: "neutral",
  inviting: "warning",
  submitted: "accent",
  approved: "success",
  rejected: "danger",
};

export default function TeamsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: teams, isLoading, isError, refetch } = useEventTeams(eventId);
  const approveTeam = useApproveTeam(eventId);
  const [confirmTeam, setConfirmTeam] = useState<TeamOut | null>(null);

  async function handleApprove() {
    if (!confirmTeam) return;
    await approveTeam.mutateAsync(confirmTeam.id);
    toast.success(`"${confirmTeam.name}" approved`, {
      description: "The team's underlying registration was approved too.",
    });
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
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {teams.map((team) => (
                <tr key={team.id} className="transition-colors hover:bg-black/[0.02]">
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">{team.name}</td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {team.submitted_at
                      ? new Date(team.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      : "Not submitted"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[team.status]}>{TEAM_STATUS_LABELS[team.status]}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {team.status === "submitted" && (
                      <Button size="sm" variant="outline" onClick={() => setConfirmTeam(team)}>
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      <ConfirmActionDialog
        open={!!confirmTeam}
        onOpenChange={(open) => !open && setConfirmTeam(null)}
        title={`Approve "${confirmTeam?.name}"?`}
        description="This also approves the team's underlying registration, unlocking payment and ticketing."
        confirmLabel="Approve team"
        onConfirm={handleApprove}
      />
    </div>
  );
}
