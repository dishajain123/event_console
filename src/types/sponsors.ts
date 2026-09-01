/** Mirrors app/modules/events/schemas.py SponsorIn/SponsorOut. */

export interface SponsorOut {
  id: string;
  event_id: string;
  name: string;
  tier: string | null;
  logo_url: string | null;
}

export interface SponsorIn {
  name: string;
  tier?: string | null;
  logo_url?: string | null;
}

/** Free-text on the backend by design (config-driven, no hardcoded
 * tier list) — these are just common starting suggestions for the form. */
export const COMMON_SPONSOR_TIERS = ["title", "gold", "silver", "bronze", "partner"] as const;
