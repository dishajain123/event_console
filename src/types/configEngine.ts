/** Mirrors app/modules/config_engine/schemas.py exactly. */

export type FieldType = "text" | "number" | "select" | "date" | "file" | "boolean";

export interface ConfigurableField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: string[] | null;
}

export interface EventConfigurationOut {
  id: string;
  event_id: string;
  participation_types: string[];
  fee_amount: string | number | null;
  currency: string;
  capacity: number | null;
  approval_required: boolean;
  rules: Record<string, unknown>;
  discount_rules: Record<string, unknown> | null;
}

export interface EventConfigurationIn {
  participation_types: string[];
  fee_amount: number | null;
  currency: string;
  capacity: number | null;
  approval_required: boolean;
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
