export type SponsorshipInquiryStatus =
  | "new"
  | "reviewing"
  | "approved"
  | "confirmed"
  | "rejected"
  | "closed";

export type SponsorStatus = "confirmed" | "active" | "inactive" | "completed" | "cancelled";
export type SponsorshipDeliverableStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface SponsorshipCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipPackage {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  benefits: string[];
  minimum_offer: string | number | null;
  is_active: boolean;
  category: SponsorshipCategory | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipInquiry {
  id: string;
  user_id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  business_details: string | null;
  category_id: string | null;
  package_id: string | null;
  offer_details: string | null;
  message: string | null;
  status: SponsorshipInquiryStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  event_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface SponsorshipInquiryCreate {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  business_details?: string | null;
  category_id?: string | null;
  package_id?: string | null;
  event_ids?: string[];
  offer_details?: string | null;
  message?: string | null;
}

export interface ManagedSponsor {
  id: string;
  event_id: string;
  name: string;
  tier: string | null;
  logo_url: string | null;
  status: SponsorStatus;
  category: string | null;
  description: string | null;
  offer_details: string | null;
  benefits: string[] | null;
  website_url: string | null;
  contact_email: string | null;
  inquiry_id: string | null;
  committed_value: string | number | null;
  paid_value: string | number | null;
}

export interface SponsorshipDeliverable {
  id: string;
  sponsor_id: string;
  event_id: string;
  deliverable_type: string;
  description: string;
  quantity: number | null;
  due_date: string | null;
  status: SponsorshipDeliverableStatus;
  completed_at: string | null;
  completion_notes: string | null;
  evidence: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorshipDeliverablePage {
  items: SponsorshipDeliverable[];
  total: number;
  page: number;
  page_size: number;
}

export interface SponsorshipMetrics {
  event_id: string;
  total_sponsors: number;
  confirmed_value: string | number;
  paid_value: string | number;
  active_sponsorships: number;
  completed_sponsorships: number;
  total_deliverables: number;
  completed_deliverables: number;
  pending_deliverables: number;
  overdue_deliverables: number;
  fulfillment_percentage: number | null;
  value_by_category: Array<{ category: string | null; committed_value: string | number; sponsors: number }>;
}

export interface SponsorSummary {
  sponsor_id: string;
  event_id: string;
  sponsor_name: string;
  category: string | null;
  committed_value: string | number | null;
  paid_value: string | number | null;
  total_deliverables: number;
  completed_deliverables: number;
  pending_deliverables: number;
  overdue_deliverables: number;
  fulfillment_percentage: number | null;
}

export type SponsorEngagementType = "lead_capture" | "booth_visit" | "session_interest" | "sponsor_interaction";
export type SponsorLeadStatus = "captured" | "qualified" | "contacted" | "converted" | "dismissed" | "unsubscribed";
export type SponsorConsentStatus = "not_given" | "given" | "withdrawn";

export interface SponsorEngagement {
  id: string;
  sponsor_id: string;
  event_id: string;
  participant_id: string;
  captured_by: string;
  captured_at: string;
  engagement_type: SponsorEngagementType;
  note: string | null;
  consent_status: SponsorConsentStatus;
  consent_at: string | null;
  consent_source: string | null;
  lead_status: SponsorLeadStatus;
  participant_display_name: string | null;
  participant_organization: string | null;
  participant_designation: string | null;
}

export interface SponsorEngagementPage {
  items: SponsorEngagement[];
  total: number;
  page: number;
  page_size: number;
}

export interface SponsorEngagementMetrics {
  event_id: string;
  sponsor_id: string;
  total_leads: number;
  qualified_leads: number;
  contacted_leads: number;
  converted_leads: number;
  dismissed_leads: number;
  unsubscribed_leads: number;
  total_engagements: number;
  unique_participants_engaged: number;
  conversion_rate: number;
  qualification_rate: number;
  by_type: Record<string, number>;
  by_date: Record<string, number>;
}
