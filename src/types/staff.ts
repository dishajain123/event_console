/** Mirrors app/modules/staff/schemas.py + models.py StaffAssignmentStatus. */
import type { RoleName } from "@/types/rbac";

export type StaffAssignmentStatus = "invited" | "active" | "revoked";

export const STAFF_ASSIGNMENT_STATUS_LABELS: Record<StaffAssignmentStatus, string> = {
  invited: "Invited",
  active: "Active",
  revoked: "Revoked",
};

/** The four scoped roles that can be invited as staff — mirrors
 * app/modules/rbac/models.py SCOPED_ROLES exactly. */
export const STAFF_ROLE_OPTIONS: { value: RoleName; label: string }[] = [
  { value: "event_manager", label: "Event Manager" },
  { value: "event_coordinator", label: "Event Coordinator" },
  { value: "staff_lead", label: "Staff Lead" },
  { value: "staff_member", label: "Staff Member" },
];

export interface StaffAssignmentOut {
  id: string;
  event_id: string;
  venue_id: string | null;
  user_id: string | null;
  invitee_mobile: string;
  full_name: string | null;
  role_name: RoleName | null;
  role_label: string;
  status: StaffAssignmentStatus;
  invited_by: string;
  accepted_by: string | null;
  revoked_by: string | null;
  accepted_at: string | null;
  revoked_at: string | null;
  superseded_by_id: string | null;
  linked_role_assignment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignmentCreateIn {
  invitee_mobile: string;
  role_name: RoleName;
  role_label: string;
  full_name?: string | null;
  venue_id?: string | null;
}

export interface StaffAssignmentReassignIn {
  invitee_mobile?: string | null;
  role_name?: RoleName | null;
  role_label?: string | null;
  full_name?: string | null;
  venue_id?: string | null;
}

export interface StaffAssignmentHistoryOut {
  id: string;
  assignment_id: string;
  action: string;
  actor_user_id: string | null;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
