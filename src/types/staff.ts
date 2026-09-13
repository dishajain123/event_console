/** Mirrors app/modules/staff/schemas.py + models.py StaffAssignmentStatus. */

/**
 * Backend RoleName values a StaffAssignment can actually carry — a
 * separate, wider set than `@/types/rbac`'s `RoleName`, which only lists
 * the roles that ever grant a Console login. `event_coordinator`,
 * `staff_lead`, and `staff_member` are mobile-Staff-Mode-only roles and
 * deliberately excluded from the console's RoleName union.
 */
export type StaffRoleName = "event_manager" | "event_coordinator" | "staff_lead" | "staff_member";

export type StaffAssignmentStatus = "invited" | "active" | "revoked";

export const STAFF_ASSIGNMENT_STATUS_LABELS: Record<StaffAssignmentStatus, string> = {
  invited: "Invited",
  active: "Active",
  revoked: "Revoked",
};

/**
 * Roles that can actually be granted through a staff assignment — mirrors
 * app/modules/staff/service.py's create_assignment/reassign_assignment
 * validation, which rejects EVENT_MANAGER (that's set via the event's
 * primary manager settings, not a staff invitation) and anything outside
 * SCOPED_ROLES.
 */
export const STAFF_ROLE_OPTIONS: { value: StaffRoleName; label: string }[] = [
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
  role_name: StaffRoleName | null;
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
  /** Only populated by GET /staff/assignments/mine (the mobile "mine" endpoint); null from console-facing endpoints, which already have event context. */
  event_name?: string | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  venue_name?: string | null;
}

export interface StaffAssignmentCreateIn {
  invitee_mobile: string;
  role_name: StaffRoleName;
  role_label: string;
  full_name?: string | null;
  venue_id?: string | null;
}

export interface StaffAssignmentReassignIn {
  invitee_mobile?: string | null;
  role_name?: StaffRoleName | null;
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
