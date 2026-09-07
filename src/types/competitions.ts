export type CompetitionStatus = "draft" | "open" | "in_progress" | "completed" | "cancelled";
export type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type MatchResultStatus = "pending" | "win" | "draw" | "forfeit";

export interface CompetitionOut { id: string; event_id: string; name: string; description: string | null; competition_type: string; participation_mode: string; max_participants: number | null; registration_deadline: string | null; status: CompetitionStatus; created_at: string; updated_at: string; }
export interface CompetitionStageOut { id: string; event_id: string; competition_id: string | null; name: string; stage_type: string; order_index: number; status: string; }
export interface CompetitionMatchOut { id: string; competition_id: string; event_id: string; stage_id: string; round_number: number; match_number: number; entry_a_id: string | null; entry_b_id: string | null; winner_entry_id: string | null; venue_id: string | null; scheduled_start: string; scheduled_end: string; status: MatchStatus; result_status: MatchResultStatus; score_a: number | null; score_b: number | null; }
export interface StandingOut { entry_id: string; position: number; played: number; wins: number; losses: number; draws: number; points: number; score_for: number; score_against: number; difference: number; }
