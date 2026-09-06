export type FeedbackCategory =
  | "event_experience"
  | "venue_facilities"
  | "organization_management"
  | "schedule_activities"
  | "food_hospitality"
  | "technical_experience"
  | "other";

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  event_experience: "Event Experience",
  venue_facilities: "Venue & Facilities",
  organization_management: "Organization & Management",
  schedule_activities: "Schedule & Activities",
  food_hospitality: "Food & Hospitality",
  technical_experience: "Technical Experience",
  other: "Other",
};

export interface FeedbackCategoryOut {
  code: FeedbackCategory;
  label: string;
}

export interface FeedbackOut {
  id: string;
  event_id: string;
  event_name: string | null;
  user_id: string;
  user_name: string | null;
  category: FeedbackCategory;
  category_label: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackCategorySummary {
  category: FeedbackCategory;
  response_count: number;
  average_rating: number;
}

export interface FeedbackSummaryOut {
  response_count: number;
  overall_rating: number | null;
  category_summaries: FeedbackCategorySummary[];
  rating_distribution: Record<string, number>;
}
