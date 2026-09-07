/** Mirrors app/modules/reports/schemas.py in full. */

export interface RegistrationStatusBreakdown {
  status: string;
  count: number;
}

export interface EventOperationsReportOut {
  event_id: string;
  event_name: string;
  total_registrations: number;
  active_registrations: number;
  registrations_by_status: RegistrationStatusBreakdown[];
  capacity: number | null;
  capacity_used: number;
  capacity_utilization_pct: number | null;
  total_check_ins: number;
  unique_tickets_checked_in: number;
}

export interface PlatformOperationsReportOut {
  total_events: number;
  published_events: number;
  total_registrations_across_events: number;
  total_check_ins_across_events: number;
  events: EventOperationsReportOut[];
}

export interface EventFinancialReportOut {
  event_id: string;
  event_name: string;
  total_revenue: string | number;
  verified_payment_count: number;
  pending_payment_count: number;
  failed_payment_count: number;
  total_refunded: string | number;
  refund_count: number;
  net_revenue: string | number;
}

export interface PlatformFinancialReportOut {
  total_revenue_across_events: string | number;
  total_refunded_across_events: string | number;
  net_revenue_across_events: string | number;
  events: EventFinancialReportOut[];
}

export interface EventManagerOverviewOut {
  user_id: string | null;
  name: string | null;
  mobile_number: string | null;
  total_events: number;
  upcoming_events: number;
  active_events: number;
  completed_events: number;
}

export interface EventDashboardItemOut {
  event_id: string;
  event_name: string;
  organizer_user_id: string | null;
  organizer_name: string | null;
  organizer_mobile_number: string | null;
  main_category: string | null;
  sub_category: string | null;
  status: string;
  start_date: string;
  end_date: string;
  total_registrations: number;
  active_registrations: number;
  capacity: number | null;
  registration_status: string;
  is_full: boolean;
}

export interface EventOperationsOverviewOut {
  total_events: number;
  upcoming_events: number;
  active_events: number;
  completed_events: number;
  draft_events: number;
  unpublished_events: number;
  registration_open_events: number;
  registration_closed_events: number;
  events_at_full_capacity: number;
  total_registrations: number;
  active_registrations: number;
  event_manager_overview: EventManagerOverviewOut[];
  events: EventDashboardItemOut[];
}

export interface EventSummaryReportOut {
  event_id: string;
  event_name: string;
  total_registrations: number;
  active_registrations: number;
  registrations_by_status: RegistrationStatusBreakdown[];
  capacity: number | null;
  capacity_used: number;
  capacity_utilization_pct: number | null;
  total_check_ins: number;
  revenue_collected: string | number;
}

export interface AttendanceAccessBreakdownOut { access_type: string; entries: number; unique_attendees: number; }
export interface AttendanceTimeBucketOut { bucket: string; entries: number; }
export interface EventAttendanceReportOut {
  event_id: string; event_name: string; total_registrations: number; confirmed_registrations: number;
  cancelled_registrations: number; refund_related_registrations: number; eligible_registrations: number;
  active_tickets: number; valid_tickets: number; checked_in_participants: number; no_shows: number;
  attendance_rate_pct: number | null; capacity: number | null; capacity_utilization_pct: number | null;
  total_entries: number; reentry_count: number; first_check_in: string | null; last_check_in: string | null;
  peak_entry_period: string | null; peak_entry_count: number;
  by_access_type: AttendanceAccessBreakdownOut[]; checkins_over_time: AttendanceTimeBucketOut[];
}

export interface AnalyticsPointOut { date: string; count: number; }
export interface EventAnalyticsOut {
  event_id: string; event_name: string; registrations: Record<string, number>; capacity: Record<string, number | null>;
  waitlist: Record<string, number>; tickets: Record<string, number>; attendance: Record<string, number>;
  feedback: Record<string, number | null>; engagement: Record<string, number>; funnel: Record<string, number>;
  breakdowns: Record<string, Record<string, number>>;
  revenue?: Record<string, unknown>;
}
export interface EventAnalyticsTimeSeriesOut { event_id: string; start: string; end: string; registrations: AnalyticsPointOut[]; payments: AnalyticsPointOut[]; refunds: AnalyticsPointOut[]; check_ins: AnalyticsPointOut[]; feedback: AnalyticsPointOut[]; sponsor_engagements: AnalyticsPointOut[]; networking: AnalyticsPointOut[]; }
export interface EventAnalyticsComparisonOut { event_id: string; start: string; end: string; previous_start: string; previous_end: string; registrations: { current: number; previous: number; change_pct: number | null }; attendance: { current: number; previous: number; change_pct: number | null }; engagement: { current: number; previous: number; change_pct: number | null }; revenue?: { current: number; previous: number; change_pct: number | null }; }
export interface AttendanceParticipantOut {
  registration_id: string; event_id: string; user_id: string; participant_name: string | null;
  registration_status: string; access_type: string | null; attendance_status: "attended" | "no_show";
  first_check_in: string | null; last_check_in: string | null; entry_count: number;
}
export interface AttendanceParticipantPageOut { items: AttendanceParticipantOut[]; total: number; page: number; page_size: number; }

export interface OperationsAlertOut {
  code: string;
  severity: "info" | "warning" | "critical";
  title: string;
  event_id: string | null;
  count: number;
  target_path: string | null;
}

export interface OperationsEventSummaryOut {
  event_id: string;
  event_name: string;
  event_status: string;
  registration_status: string;
  capacity: number | null;
  capacity_used: number;
  capacity_available: number | null;
  capacity_utilization_pct: number | null;
  registrations: Record<string, number>;
  waitlist: Record<string, number>;
  payments: Record<string, number>;
  refunds: Record<string, number>;
  tickets: Record<string, number>;
  feedback_submitted: number;
  failed_notifications: number;
  reconciliation_attention: number;
  open_incidents: number;
  critical_incidents: number;
  alerts: OperationsAlertOut[];
}

export interface OperationsTotalsOut {
  registrations: Record<string, number>;
  waitlist: Record<string, number>;
  payments: Record<string, number>;
  refunds: Record<string, number>;
  tickets: Record<string, number>;
  feedback_submitted: number;
  failed_notifications: number;
  reconciliation_attention: number;
  open_incidents: number;
  critical_incidents: number;
}

export interface OperationsIncidentSummaryOut {
  id: string;
  event_id: string;
  title: string;
  category: string;
  status: string;
  severity: string;
  created_at: string;
}

export interface OperationsCommandCenterOut {
  generated_at: string;
  event_id: string | null;
  items: OperationsEventSummaryOut[];
  total: number;
  page: number;
  page_size: number;
  totals: OperationsTotalsOut;
  alerts: OperationsAlertOut[];
  recent_incidents: OperationsIncidentSummaryOut[];
}
