export type VolunteerApplicationType = "volunteer" | "event_manager";
export type VolunteerApplicationStatus = "submitted" | "under_review" | "contacted" | "approved" | "rejected";

export interface VolunteerApplication {
  id: string;
  event_id: string;
  user_id: string;
  application_type: VolunteerApplicationType;
  full_name: string;
  phone: string;
  email: string | null;
  skills_experience: string | null;
  availability: string | null;
  preferred_responsibility: string | null;
  message: string | null;
  status: VolunteerApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  activated_staff_assignment_id: string | null;
  created_at: string;
  updated_at: string;
}
