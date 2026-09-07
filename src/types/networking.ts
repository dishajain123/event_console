export type NetworkingVisibility = "visible" | "hidden";
export type ConnectionStatus = "pending" | "accepted" | "rejected" | "cancelled" | "blocked";
export type ReportStatus = "open" | "reviewed" | "resolved" | "dismissed";
export interface NetworkingConfig { id: string; event_id: string; enabled: boolean; matchmaking_enabled: boolean; allowed_participant_types: string[] | null; }
export interface ParticipantProfile { id: string; event_id: string; user_id: string; display_name: string | null; organization: string | null; designation: string | null; interests: string[]; skills: string[]; bio: string | null; visibility: NetworkingVisibility; share_contact: boolean; score?: number | null; explanation?: string[]; }
export interface NetworkingReport { id: string; event_id: string; reporter_id: string; reported_user_id: string; reason: string; status: ReportStatus; reviewed_by: string | null; resolution_notes: string | null; created_at: string; }
export interface NetworkingConnection { id: string; event_id: string; participant_low_id: string; participant_high_id: string; requested_by: string; intent: string; status: ConnectionStatus; created_at: string; responded_at: string | null; }
export interface NetworkingMetrics { opt_in_count: number; discoverable_count: number; connection_requests: number; accepted_connections: number; rejected_requests: number; blocked_users: number; open_reports: number; recommendations_dismissed: number; }
export interface Page<T> { items: T[]; total: number; page: number; page_size: number; }
