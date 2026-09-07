export type WaitlistStatus = "waiting" | "promoted" | "expired" | "left" | "closed";

export interface WaitlistEntry {
  id: string;
  event_id: string;
  user_id: string;
  child_id: string | null;
  team_id: string | null;
  participation_type: string;
  status: WaitlistStatus;
  joined_at: string;
  position: number | null;
  promoted_at: string | null;
  promotion_expires_at: string | null;
  left_at: string | null;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistPage {
  items: WaitlistEntry[];
  total: number;
  page: number;
  page_size: number;
}
