import { apiClient } from "@/api/client";
import type {
  EventFinancialReportOut,
  EventOperationsOverviewOut,
  EventOperationsReportOut,
  EventSummaryReportOut,
  PlatformFinancialReportOut,
  PlatformOperationsReportOut,
} from "@/types/reports";

export async function getEventSummaryReport(eventId: string): Promise<EventSummaryReportOut> {
  const { data } = await apiClient.get<EventSummaryReportOut>(`/reports/events/${eventId}`);
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
