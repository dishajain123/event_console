export type SponsorshipInquiryStatus =
  | "new"
  | "reviewing"
  | "approved"
  | "confirmed"
  | "rejected"
  | "closed";

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
