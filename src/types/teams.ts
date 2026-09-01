/** Mirrors app/modules/teams/schemas.py + models.py TeamStatus/InvitationStatus. */

export type TeamStatus = "draft" | "inviting" | "submitted" | "approved" | "rejected";

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  draft: "Draft",
  inviting: "Inviting",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export type InvitationStatus = "pending" | "accepted" | "rejected";

export interface TeamOut {
  id: string;
  event_id: string;
  captain_user_id: string;
  name: string;
  status: TeamStatus;
  captain_date_of_birth: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
}

export interface TeamMemberOut {
  id: string;
  team_id: string;
  user_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  is_captain: boolean;
}
