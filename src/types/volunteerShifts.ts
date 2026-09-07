export type VolunteerShiftStatus = "draft" | "open" | "full" | "in_progress" | "completed" | "cancelled";
export type VolunteerAssignmentStatus = "requested" | "approved" | "active" | "completed" | "rejected" | "cancelled";
export type VolunteerAttendanceStatus = "not_checked_in" | "checked_in" | "checked_out" | "no_show" | "cancelled";

export interface VolunteerShift {
  id: string; event_id: string; title: string; description: string | null; location: string | null;
  starts_at: string; ends_at: string; required_count: number; required_role: string | null;
  status: VolunteerShiftStatus; assigned_count: number; available_count: number;
  created_at: string; updated_at: string;
}
export interface VolunteerShiftAssignment {
  id: string; event_id: string; shift_id: string; user_id: string; volunteer_application_id: string | null;
  status: VolunteerAssignmentStatus; requested_by: string; reviewed_by: string | null;
  reviewed_at: string | null; check_in_at: string | null; check_out_at: string | null;
  created_at: string; updated_at: string;
}
export interface VolunteerAttendance {
  id: string; event_id: string; shift_id: string; assignment_id: string; user_id: string;
  status: VolunteerAttendanceStatus; first_check_in_at: string | null; final_check_out_at: string | null;
  worked_seconds: number | null; notes: string | null; created_at: string; updated_at: string;
}
export interface VolunteerShiftPage { items: VolunteerShift[]; total: number; page: number; page_size: number; }
export interface VolunteerAssignmentPage { items: VolunteerShiftAssignment[]; total: number; page: number; page_size: number; }
export interface EligibleVolunteer { user_id: string; application_id: string; full_name: string; preferred_responsibility: string | null; }
export interface EligibleVolunteerPage { items: EligibleVolunteer[]; total: number; page: number; page_size: number; }
