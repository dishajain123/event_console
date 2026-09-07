import { apiClient } from "@/api/client";
import type {
  EventFinancialReportOut,
  EventOperationsOverviewOut,
  EventOperationsReportOut,
  EventSummaryReportOut,
  PlatformFinancialReportOut,
  PlatformOperationsReportOut,
  OperationsCommandCenterOut,
  EventAttendanceReportOut,
  AttendanceParticipantPageOut,
  EventAnalyticsOut,
  EventAnalyticsTimeSeriesOut,
  EventAnalyticsComparisonOut,
} from "@/types/reports";

export async function getOperationsCommandCenter(filters: { eventId?: string; page?: number; pageSize?: number; search?: string } = {}): Promise<OperationsCommandCenterOut> {
  const { data } = await apiClient.get<OperationsCommandCenterOut>("/reports/operations/command-center", {
    params: {
      event_id: filters.eventId || undefined,
      page: filters.page ?? 1,
      page_size: filters.pageSize ?? 25,
      search: filters.search || undefined,
    },
  });
  return data;
}

export async function getEventSummaryReport(eventId: string): Promise<EventSummaryReportOut> {
  const { data } = await apiClient.get<EventSummaryReportOut>(`/reports/events/${eventId}`);
  return data;
}

export async function getEventAttendanceReport(eventId: string): Promise<EventAttendanceReportOut> {
  const { data } = await apiClient.get<EventAttendanceReportOut>(`/reports/events/${eventId}/attendance`);
  return data;
}

export async function getEventAttendanceParticipants(eventId: string, filters: { page?: number; pageSize?: number; search?: string; attendance?: string } = {}): Promise<AttendanceParticipantPageOut> {
  const { data } = await apiClient.get<AttendanceParticipantPageOut>(`/reports/events/${eventId}/attendance/participants`, {
    params: { page: filters.page ?? 1, page_size: filters.pageSize ?? 25, search: filters.search || undefined, attendance: filters.attendance || undefined },
  });
  return data;
}

export async function getPlatformOperationsReport(): Promise<PlatformOperationsReportOut> {
  const { data } = await apiClient.get<PlatformOperationsReportOut>("/reports/operations");
  return data;
}

export async function getPlatformOperationsOverview(): Promise<EventOperationsOverviewOut> {
  const { data } = await apiClient.get<EventOperationsOverviewOut>("/reports/overview");
  return data;
}

export async function getEventOperationsReport(eventId: string): Promise<EventOperationsReportOut> {
  const { data } = await apiClient.get<EventOperationsReportOut>(`/reports/operations/${eventId}`);
  return data;
}

export async function getPlatformFinancialReport(): Promise<PlatformFinancialReportOut> {
  const { data } = await apiClient.get<PlatformFinancialReportOut>("/reports/financial");
  return data;
}

export async function getEventFinancialReport(eventId: string): Promise<EventFinancialReportOut> {
  const { data } = await apiClient.get<EventFinancialReportOut>(`/reports/financial/${eventId}`);
  return data;
}

export async function getEventAnalytics(eventId: string, filters: { start?: string; end?: string } = {}): Promise<EventAnalyticsOut> {
  const { data } = await apiClient.get<EventAnalyticsOut>(`/reports/analytics/events/${eventId}`, { params: { start: filters.start || undefined, end: filters.end || undefined } });
  return data;
}

export async function getEventAnalyticsTimeSeries(eventId: string, filters: { start?: string; end?: string } = {}): Promise<EventAnalyticsTimeSeriesOut> {
  const { data } = await apiClient.get<EventAnalyticsTimeSeriesOut>(`/reports/analytics/events/${eventId}/timeseries`, { params: { start: filters.start || undefined, end: filters.end || undefined } });
  return data;
}

export async function getEventAnalyticsComparison(eventId: string, filters: { start?: string; end?: string } = {}): Promise<EventAnalyticsComparisonOut> {
  const { data } = await apiClient.get<EventAnalyticsComparisonOut>(`/reports/analytics/events/${eventId}/comparison`, { params: { start: filters.start || undefined, end: filters.end || undefined } });
  return data;
}
