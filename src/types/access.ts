export interface AccessZone { id: string; event_id: string; code: string; name: string; is_active: boolean; created_at: string; updated_at: string; }
export interface AccessPolicy { id: string; event_id: string; access_type: string; allowed_zone_ids: string[]; allows_reentry: boolean; max_entries: number; valid_from: string | null; valid_until: string | null; valid_dates: string[] | null; created_at: string; updated_at: string; }
export interface AccessTicket { id: string; event_id: string; registration_id: string; user_id: string; ticket_code: string; access_type: string; status: string; entry_count: number; created_at: string; }
export interface AccessTicketPage { items: AccessTicket[]; total: number; page: number; page_size: number; }
export interface TicketTransfer { id: string; ticket_id: string; event_id: string; from_user_id: string; to_user_id: string; status: string; created_at: string; updated_at: string; responded_at?: string | null; accepted_at?: string | null; }
export interface TicketTransferPage { items: TicketTransfer[]; total: number; page: number; page_size: number; }
