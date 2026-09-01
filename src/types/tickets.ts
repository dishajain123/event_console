/** Mirrors app/modules/tickets/schemas.py CheckInOut + CheckInSource enum. */

export type CheckInSource = "online" | "offline";

export interface CheckInOut {
  id: string;
  ticket_id: string;
  event_id: string;
  venue_id: string | null;
  scanned_by: string;
  source: CheckInSource;
  offline_batch_id: string | null;
  synced_at: string | null;
  scan_payload: string | null;
  created_at: string;
  updated_at: string;
}
