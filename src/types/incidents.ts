export type IncidentStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "closed" | "cancelled";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface IncidentOut {
  id: string;
  event_id: string;
  reporter_user_id: string;
  assigned_user_id: string | null;
  category: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  resolution_notes: string | null;
  acknowledged_at: string | null;
  in_progress_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  cancelled_at: string | null;
  escalation_count: number;
  created_at: string;
  updated_at: string;
}

export interface IncidentPage { items: IncidentOut[]; total: number; page: number; page_size: number; }
export interface IncidentCreateIn { event_id: string; category: string; title: string; description: string; severity: IncidentSeverity; assigned_user_id?: string; }
export interface IncidentUpdateIn { status?: IncidentStatus; severity?: IncidentSeverity; assigned_user_id?: string | null; resolution_notes?: string | null; }
