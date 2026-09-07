export type PollStatus = "draft" | "scheduled" | "live" | "closed" | "archived";
export type QuestionStatus = "submitted" | "pending" | "approved" | "answered" | "rejected" | "hidden" | "archived";
export interface PollOption { id: string; label: string; sort_order: number; }
export interface Poll { id: string; event_id: string; title: string; description: string | null; starts_at: string; ends_at: string; choice_mode: "single" | "multiple"; anonymous: boolean; max_selections: number | null; allow_vote_change: boolean; result_visibility: string; status: PollStatus; options: PollOption[]; }
export interface Question { id: string; event_id: string; question: string; display_name: string | null; status: QuestionStatus; answer_text: string | null; answered_at: string | null; created_at: string; upvotes: number; user_upvoted: boolean; }
export interface Page<T> { items: T[]; total: number; page: number; page_size: number; }
export interface InteractionMetrics { active_polls: number; poll_responses: number; questions_submitted: number; questions_approved: number; questions_answered: number; question_upvotes: number; }
