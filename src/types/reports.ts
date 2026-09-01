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
