/** Mirrors app/modules/config_engine/schemas.py exactly. */

export type FieldType = "text" | "number" | "select" | "date" | "file" | "boolean";

export interface ConfigurableField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[] | null;
}

export interface EventDetailSettings {
  registration_start_at: string | null;
  registration_end_at: string | null;
  event_start_at: string | null;
  event_end_at: string | null;
  venue_name: string | null;
  venue_address: string | null;
  venue_location: string | null;
  age_group: string | null;
  age_min: number | null;
  age_max: number | null;
  eligibility_notes: string | null;
  maximum_participants: number | null;
  minimum_participants: number | null;
  registration_fee: number | null;
  event_type: string | null;
  team_size_min: number | null;
  team_size_max: number | null;
  gender_eligibility: string | null;
  event_image_url: string | null;
  banner_url: string | null;
  rules_and_guidelines: string | null;
  terms_and_conditions: string | null;
  cancellation_policy: string | null;
  required_documents: string[];
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  registration_status: string | null;
  custom_registration_questions: string[];
}

export interface EventConfigurationOut {
  id: string;
  event_id: string;
  participation_types: string[];
  fee_amount: string | number | null;
  currency: string;
  capacity: number | null;
  approval_required: boolean;
  details: EventDetailSettings;
  rules: Record<string, unknown>;
  discount_rules: Record<string, unknown> | null;
}

export interface EventConfigurationIn {
  participation_types: string[];
  fee_amount: number | null;
  currency: string;
  capacity: number | null;
  approval_required: boolean;
  details: EventDetailSettings;
  rules: Record<string, unknown>;
  discount_rules: Record<string, unknown> | null;
}

export interface EventFieldSchemaOut {
  id: string;
  event_id: string;
  participation_type: string;
  fields: ConfigurableField[];
}

export interface EventFieldSchemaIn {
  participation_type: string;
  fields: ConfigurableField[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface ValidationResultOut {
  is_eligible: boolean;
  errors: ValidationErrorItem[];
}

export interface ValidateRegistrationIn {
  participation_type: string;
  date_of_birth?: string | null;
  team_member_count?: number | null;
  documents_provided: string[];
  answers: Record<string, unknown>;
}

/** Known, common participation types across event shapes — the
 * Configuration Builder always allows a free-text custom one too, since
 * the backend places no restriction on this string. */
export const COMMON_PARTICIPATION_TYPES = ["individual", "team", "viewer", "delegate"] as const;

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  number: "Number",
  select: "Select (choose one)",
  date: "Date",
  file: "File upload",
  boolean: "Yes / No",
};
