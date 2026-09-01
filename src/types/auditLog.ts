/** Mirrors app/modules/audit_log/schemas.py exactly. */

export interface AuditLogOut {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_user_id: string | null;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogPageOut {
  items: AuditLogOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLogQueryParams {
  entity_type?: string;
  entity_id?: string;
  actor_user_id?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

/** Entity types actually written by core/audit.py across the backend —
 * verified directly against every entity_type="..." call site, not
 * guessed — so the filter dropdown only ever offers real options. */
export const AUDIT_ENTITY_TYPES = [
  "assistance_request",
  "child_profile",
  "event",
  "funnel_entry",
  "media",
  "notification",
  "payment",
  "referral",
  "referral_reward",
  "refund",
  "registration",
  "role_assignment",
  "sponsor",
  "staff_assignment",
  "team",
  "ticket",
] as const;
