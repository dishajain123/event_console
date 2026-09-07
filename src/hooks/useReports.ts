import { useQuery } from "@tanstack/react-query";
import {
  getEventFinancialReport,
  getEventOperationsReport,
  getEventSummaryReport,
  getPlatformFinancialReport,
  getPlatformOperationsReport,
  getOperationsCommandCenter,
  getEventAttendanceReport,
  getEventAttendanceParticipants,
  getEventAnalytics,
  getEventAnalyticsTimeSeries,
  getEventAnalyticsComparison,
} from "@/api/reports";
import { useSessionStore } from "@/state/sessionStore";
import type { OperationsCommandCenterOut } from "@/types/reports";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventSummaryReport(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["reports", "event-summary", eventId],
    queryFn: () => getEventSummaryReport(eventId),
    enabled: ready && !!eventId,
  });
}

export function useEventAttendanceReport(eventId: string) {
  const ready = useReady();
  return useQuery({ queryKey: ["reports", "attendance", eventId], queryFn: () => getEventAttendanceReport(eventId), enabled: ready && !!eventId, refetchInterval: 30_000 });
}

export function useEventAttendanceParticipants(eventId: string, filters: { page?: number; pageSize?: number; search?: string; attendance?: string } = {}) {
  const ready = useReady();
  return useQuery({ queryKey: ["reports", "attendance-participants", eventId, filters], queryFn: () => getEventAttendanceParticipants(eventId, filters), enabled: ready && !!eventId, refetchInterval: 30_000 });
}

export function usePlatformOperationsReport() {
  const ready = useReady();
  return useQuery({
    queryKey: ["reports", "operations", "platform"],
    queryFn: getPlatformOperationsReport,
    enabled: ready,
  });
}

export function useEventOperationsReport(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["reports", "operations", eventId],
    queryFn: () => getEventOperationsReport(eventId),
    enabled: ready && !!eventId,
  });
}

export function usePlatformFinancialReport() {
  const ready = useReady();
  return useQuery({
    queryKey: ["reports", "financial", "platform"],
    queryFn: getPlatformFinancialReport,
    enabled: ready,
  });
}

export function useEventFinancialReport(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["reports", "financial", eventId],
    queryFn: () => getEventFinancialReport(eventId),
    enabled: ready && !!eventId,
  });
}

export function useOperationsCommandCenter(filters: { eventId?: string; page?: number; pageSize?: number; search?: string } = {}) {
  const ready = useReady();
  return useQuery<OperationsCommandCenterOut>({
    queryKey: ["reports", "command-center", filters],
    queryFn: () => getOperationsCommandCenter(filters),
    enabled: ready,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useEventAnalytics(eventId: string, filters: { start?: string; end?: string } = {}) {
  const ready = useReady();
  return useQuery({ queryKey: ["reports", "analytics", eventId, filters], queryFn: () => getEventAnalytics(eventId, filters), enabled: ready && !!eventId });
}

export function useEventAnalyticsTimeSeries(eventId: string, filters: { start?: string; end?: string } = {}) {
  const ready = useReady();
  return useQuery({ queryKey: ["reports", "analytics-timeseries", eventId, filters], queryFn: () => getEventAnalyticsTimeSeries(eventId, filters), enabled: ready && !!eventId });
}

export function useEventAnalyticsComparison(eventId: string, filters: { start?: string; end?: string } = {}) {
  const ready = useReady();
  return useQuery({ queryKey: ["reports", "analytics-comparison", eventId, filters], queryFn: () => getEventAnalyticsComparison(eventId, filters), enabled: ready && !!eventId });
}
