import { useQuery } from "@tanstack/react-query";
import {
  getEventFinancialReport,
  getEventOperationsReport,
  getEventSummaryReport,
  getPlatformFinancialReport,
  getPlatformOperationsReport,
} from "@/api/reports";
import { useSessionStore } from "@/state/sessionStore";

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

