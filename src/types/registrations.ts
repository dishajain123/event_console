/** Mirrors app/modules/registrations/schemas.py + models.py RegistrationStatus. */

export type RegistrationStatus =
  | "started"
  | "submitted"
  | "pending_verification"
  | "pending_payment"
  | "approved"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "rejected"
  | "cancelled";

export const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "started",
  "submitted",
  "pending_verification",
  "pending_payment",
  "approved",
  "confirmed",
  "checked_in",
  "completed",
];

export const DECIDABLE_REGISTRATION_STATUSES: RegistrationStatus[] = [
  "submitted",
  "pending_verification",
];

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  started: "Started",
  submitted: "Submitted",
  pending_verification: "Pending Verification",
  pending_payment: "Pending Payment",
  approved: "Approved",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export interface RegistrationParticipantOut {
  id: string;
  registration_id: string;
  user_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  is_captain: boolean;
}

export interface RegistrationOut {
  id: string;
  event_id: string;
  user_id: string;
  child_id: string | null;
  team_id: string | null;
  participation_type: string;
  status: RegistrationStatus;
  submitted_at: string | null;
  approved_by: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  participants: RegistrationParticipantOut[];
}
